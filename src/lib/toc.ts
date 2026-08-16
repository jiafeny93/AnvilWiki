/**
 * Table-of-contents extraction from MDX source.
 *
 * Heading ids MUST match what Astro renders in the final HTML, otherwise the
 * TOC anchors silently point nowhere. Astro's built-in slugger follows the
 * github-slugger algorithm: lowercase, strip punctuation (keeping letters,
 * digits, hyphens and unicode), spaces to hyphens, duplicates suffixed -1/-2.
 *
 * The CJK article titles round-trip correctly because \p{L} keeps han/kana/
 * hangul while dropping full-width punctuation (：、！…) — verified against
 * built dist output (e.g. id="aniimo-战斗基础动作-rpg-机制").
 */

export interface TocHeading {
  /** Depth: 2 for h2, 3 for h3. */
  depth: 2 | 3;
  text: string;
  id: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** Deduplicate ids the same way github-slugger does (foo, foo-1, foo-2…). */
function uniqueId(base: string, seen: Map<string, number>): string {
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

/**
 * Extract h2/h3 headings from MDX body text.
 *
 * Skips fenced code blocks (``` … ```) so shell comments or example markup
 * inside them can't inject fake TOC entries. H1 is owned by the page header
 * and intentionally excluded.
 */
export function extractHeadings(body: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const seen = new Map<string, number>();
  let inFence = false;

  for (const line of body.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (match) {
      const text = match[2].trim();
      headings.push({
        depth: match[1].length as 2 | 3,
        text,
        id: uniqueId(slugify(text), seen),
      });
    }
  }
  return headings;
}
