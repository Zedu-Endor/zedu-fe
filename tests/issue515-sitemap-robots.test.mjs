import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_MARKETING_SITE_URL,
  MARKETING_PAGES,
  marketingPageUrl,
  normalizeMarketingSiteUrl,
} from "../src/lib/marketing-site.ts";

const expectedPaths = [
  "/",
  "/about",
  "/pricing",
  "/resources",
  "/contact-sales",
  "/download",
  "/policy",
  "/terms-of-service",
  "/solutions/bootcamps",
  "/solutions/schools",
  "/solutions/universities",
  "/products/buzz",
  "/products/channels",
  "/products/file-management",
];

test("sitemap lists every requested public marketing page", () => {
  assert.deepEqual(
    MARKETING_PAGES.map((page) => page.path),
    expectedPaths
  );
});

test("sitemap page metadata is valid for Next.js", () => {
  for (const page of MARKETING_PAGES) {
    assert.ok(page.priority > 0 && page.priority <= 1);
    assert.ok(page.changeFrequency);
  }
});

test("marketing URLs are absolute and avoid duplicate slashes", () => {
  assert.equal(
    marketingPageUrl("/pricing", "https://zedu.chat/"),
    "https://zedu.chat/pricing"
  );
  assert.equal(
    marketingPageUrl("/", "https://zedu.chat/"),
    "https://zedu.chat/"
  );
  assert.equal(
    marketingPageUrl("products/buzz", "https://staging.zedu.chat"),
    "https://staging.zedu.chat/products/buzz"
  );
});

test("missing environment URL falls back to the public site", () => {
  assert.equal(normalizeMarketingSiteUrl(), DEFAULT_MARKETING_SITE_URL);
  assert.equal(normalizeMarketingSiteUrl("  "), DEFAULT_MARKETING_SITE_URL);
  assert.equal(
    marketingPageUrl("/about"),
    `${DEFAULT_MARKETING_SITE_URL}/about`
  );
});

test("sitemap excludes authenticated application routes", () => {
  const paths = MARKETING_PAGES.map((page) => page.path);
  for (const privatePath of ["/auth/login", "/billing", "/account", "/api"]) {
    assert.ok(!paths.includes(privatePath));
  }
});
