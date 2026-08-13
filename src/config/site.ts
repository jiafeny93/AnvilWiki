/**
 * Site configuration — the single source of truth for game-specific metadata.
 *
 * 👉 APPLY TEMPLATE: Change every field here when building a new game wiki.
 * This is part of the CONFIG LAYER — framework code reads from here, never the reverse.
 */

export interface SiteConfig {
  /** Full site name, used in <title> suffix and Organization JSON-LD. e.g. "Anvil Quest Wiki" */
  name: string;
  /** Short name for PWA manifest and mobile logo. e.g. "AQ Wiki" */
  shortName: string;
  /** Site description for Organization JSON-LD and og:site_name. */
  description: string;
  /** Domain without protocol or trailing slash. e.g. "anvilquestwiki.wiki" */
  domain: string;
  /** Hero tagline shown under the site title. */
  tagline: string;
  /** Copyright / legal disclaimer line shown in footer. */
  legalNotice: string;
  social: {
    /** Official game website URL (the game itself, not the wiki). */
    official: string;
    discord?: string;
    youtube?: string;
    twitter?: string;
    reddit?: string;
  };
  game: {
    /** Full game name. */
    name: string;
    /** Platform: "Roblox" | "Steam" | "Epic Games" | "Mobile" | ... */
    platform: string;
    /** Developer / studio name. */
    developer: string;
    /** Genre description. */
    genre: string;
    /** ISO release date (optional). */
    releaseDate?: string;
  };
  /**
   * Dimensions of the default OG/Twitter share image (public/images/hero.webp).
   * Emitted as og:image:width / og:image:height so social crawlers can render
   * the share card without downloading the image first.
   */
  ogImageWidth: number;
  ogImageHeight: number;
}

export const site: SiteConfig = {
  name: 'Aniimo Wiki',
  shortName: 'Aniimo Wiki',
  description: 'Complete Aniimo wiki with creature guides, tier lists, Twine mechanics, and beta/release info. Community-driven and constantly updated.',
  domain: 'aniimo.chixu.buzz',
  tagline: 'Your complete Aniimo guide — creatures, tier lists, Twine mechanics, and more',
  legalNotice: 'Aniimo Wiki is a fan-made community site. Not affiliated with or endorsed by Pawprint Studio or FunPlus.',
  social: {
    official: 'https://www.aniimo.com/',
  },
  game: {
    name: 'Aniimo',
    platform: 'PC (Steam/Epic), PS5, Xbox Series X/S, Mobile (iOS/Android)',
    developer: 'Pawprint Studio (Published by FunPlus)',
    genre: 'Action RPG / Open World / Creature Collection',
    releaseDate: '',
  },
};

/** Absolute site URL (no trailing slash). Falls back to the Astro `site` config. */
export const siteUrl: string = (process.env.SITE_URL || `https://${site.domain}`).replace(
  /\/$/,
  '',
);
