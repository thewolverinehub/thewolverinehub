/**
 * Lighthouse CI — DESKTOP preset.
 * Same routes and thresholds as mobile, desktop throttling profile.
 */

const PORT = 4322;
const BASE_URL = `http://localhost:${PORT}`;

const ROUTES = ["/", "/404"];
const urls = ROUTES.map((r) => `${BASE_URL}${r}`);

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
      startServerCommand: `node ./dist/server/entry.mjs`,
      startServerReadyPattern: "ready|listening|started",
      startServerReadyTimeout: 30000,
      url: urls,
      settings: {
        // Desktop preset
        preset: "perf",
        throttlingMethod: "simulate",
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        ...ASSERT_CATEGORIES,
        "is-crawlable": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
