import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { parseEntryId } from '~/lib/content';
import { site } from '../config/site';

/**
 * Site-wide RSS feed — freshness discovery channel for crawlers.
 * Newest articles first (lastModified when present, else date), capped at 80
 * so the feed stays light while always surfacing every recent batch.
 * English (default locale) links live at the bare path — no /en/ prefix.
 */
export async function GET(context) {
  const posts = (await getCollection('wiki'))
    .sort(
      (a, b) =>
        (b.data.lastModified ?? b.data.date).getTime() -
        (a.data.lastModified ?? a.data.date).getTime()
    )
    .slice(0, 80);

  return rss({
    title: `${site.name} — Creature Encyclopedia & Release Info`,
    description: site.description,
    site: context.site,
    items: posts.map((p) => {
      const parsed = parseEntryId(p.id);
      const path = parsed
        ? parsed.locale === 'en'
          ? `${parsed.category}/${parsed.slug}`
          : `${parsed.locale}/${parsed.category}/${parsed.slug}`
        : p.id;
      return {
        title: p.data.title,
        description: p.data.description,
        link: `/${path}/`,
        pubDate: p.data.lastModified ?? p.data.date,
        categories: [p.data.category],
      };
    }),
    customData: '<language>en</language>',
  });
}
