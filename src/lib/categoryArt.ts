/**
 * Category artwork — maps each wiki category to a cover image.
 *
 * Images are official Aniimo promotional art (sourced from aniimo.com CDN),
 * used under the fan-wiki fair-use convention covered by the footer's
 * "fan-made, not affiliated" notice.
 *
 * 👉 APPLY TEMPLATE: swap the files in public/images/ and update the map.
 */

const CATEGORY_ART: Record<string, string> = {
  guides: '/images/cat-guides.webp',
  creatures: '/images/cat-creatures.webp',
  'tier-list': '/images/cat-tier-list.webp',
  release: '/images/cat-release.webp',
  news: '/images/cat-news.webp',
  reviews: '/images/cat-reviews.webp',
};

const FALLBACK_ART = '/images/cat-reviews.webp';

/** Public path of the cover image for a category slug. */
export function categoryArt(category: string): string {
  return CATEGORY_ART[category] ?? FALLBACK_ART;
}
