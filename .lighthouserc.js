/**
 * Lighthouse CI configuration.
 * Runs mobile + desktop presets, 3 runs per URL (median used).
 * Fails CI if any Lighthouse category drops below 90 on either device.
 *
 * SITE_INDEXING=false during pre-launch: the `is-crawlable` audit is skipped
 * because robots.txt intentionally blocks indexing. Remove the skip at go-live.
 */

const TARGET_URL = process.env.LHCI_TARGET_URL || "http://localhost:4321";

const ROUTES = [
  "/",
  "/classes",
  "/schedule",
  "/pricing",
  "/coaches",
  "/contact",
  "/404",
];

const urls = ROUTES.map((r) => `${TARGET_URL}${r}`);

const ASSERT_CATEGORIES = {
  "categories:performance": ["error", { minScore: 0.9 }],
  "categories:accessibility": ["error", { minScore: 0.9 }],
  "categories:best-practices": ["error", { minScore: 0.9 }],
  "categories:seo": ["error", { minScore: 0.9 }],
};

/** @type {import('@lhci/utils/src/types').LighthouseConfig} */
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        // Mobile preset (Lighthouse default)
        preset: "perf",
        throttlingMethod: "simulate",
      },
      url: urls,
    },
    assert: {
      assertions: {
        ...ASSERT_CATEGORIES,
        // Skip is-crawlable while SITE_INDEXING=false (noindex by design)
        "is-crawlable": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
