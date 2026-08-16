#!/usr/bin/env node
/**
 * postbuild: inject <lastmod> into the sitemaps @astrojs/sitemap emits.
 *
 * The integrations's `serialize()` hook runs at page-generate time and can't
 * see MDX frontmatter for aggregated routes, so we rewrite dist/sitemap-*.xml
 * AFTER the build instead:
 *
 *   - article URLs  → frontmatter lastModified (falls back to date)
 *   - category URLs → newest article date in that (category, locale)
 *   - everything else (home, about, …) is left untouched
 *
 * Zero deps — plain fs + regex. Run from the repo root (postbuild does).
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const CONTENT = join(ROOT, 'src/content/wiki');
const DIST = join(ROOT, 'dist');
const LOCALES = ['en', 'zh', 'ja', 'ko'];

/** Recursively collect .mdx files under a directory. */
function walkMdx(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkMdx(p, out);
    else if (name.endsWith('.mdx')) out.push(p);
  }
  return out;
}

function grab(frontmatter, key) {
  const m = frontmatter.match(new RegExp(`^${key}: ['"]?([^'"\\n]+)['"]?\\s*$`, 'm'));
  return m ? m[1].trim() : null;
}

// path → lastmod date, e.g. "/zh/guides/aniimo-combat" → "2026-08-16"
const lastmodByPath = new Map();
// (category, locale) → newest date, for category list pages
const newestByCategory = new Map();

for (const loc of LOCALES) {
  for (const file of walkMdx(join(CONTENT, loc))) {
    const rel = relative(join(CONTENT, loc), file).replace(/\.mdx$/, '');
    const [category, ...rest] = rel.split('/');
    if (!rest.length) continue;
    const raw = readFileSync(file, 'utf8');
    const fm = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) continue;
    const date = grab(fm[1], 'lastModified') || grab(fm[1], 'date');
    if (!date) continue;
    const path = `/${loc === 'en' ? '' : loc + '/'}${category}/${rest.join('/')}`;
    lastmodByPath.set(path, date.slice(0, 10));

    const key = `${loc}:${category}`;
    if (!newestByCategory.has(key) || date > newestByCategory.get(key)) {
      newestByCategory.set(key, date.slice(0, 10));
    }
  }
}

let patched = 0;
for (const name of readdirSync(DIST)) {
  if (!/^sitemap-\d+\.xml$/.test(name)) continue;
  const file = join(DIST, name);
  let xml = readFileSync(file, 'utf8');

  xml = xml.replace(/<url>(.*?)<\/url>/g, (_, block) => {
    const loc = block.match(/<loc>(.*?)<\/loc>/);
    if (!loc) return `<url>${block}</url>`;
    const url = new URL(loc[1]);
    let date = lastmodByPath.get(url.pathname);
    if (!date) {
      // category list page: /zh/guides or /guides
      const m = url.pathname.match(/^\/(?:zh|ja|ko)?\/?(creatures|guides|news|release|reviews|tier-list)$/);
      if (m) date = newestByCategory.get(`${url.pathname.match(/^\/(zh|ja|ko)\//)?.[1] ?? 'en'}:${m[1]}`);
    }
    if (!date || block.includes('<lastmod>')) return `<url>${block}</url>`;
    patched++;
    return `<url>${block.replace(/<\/loc>/, `</loc><lastmod>${date}</lastmod>`)}</url>`;
  });

  writeFileSync(file, xml);
}

console.log(`sitemap-lastmod: patched ${patched} of ${lastmodByPath.size} article URLs`);
