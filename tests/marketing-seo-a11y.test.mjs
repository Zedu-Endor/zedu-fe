import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

test("marketing layout includes main landmark", () => {
  const layoutPath = path.join(root, "src", "app", "(homepage)", "layout.tsx");
  const layoutSource = fs.readFileSync(layoutPath, "utf8");
  assert.ok(
    /<main[\s\S]*?id="main-content"/.test(layoutSource),
    'Homepage layout must contain a <main> landmark with id="main-content"'
  );
  assert.ok(
    layoutSource.includes("</main>"),
    "Homepage layout must close the main landmark"
  );
});

test("public/llms.txt exists and contains standard product sections", () => {
  const llmsPath = path.join(root, "public", "llms.txt");
  assert.ok(fs.existsSync(llmsPath), "public/llms.txt must exist");

  const content = fs.readFileSync(llmsPath, "utf8");
  assert.ok(
    content.startsWith("# Zedu"),
    "llms.txt must start with H1 project name"
  );
  assert.ok(
    content.includes("## Products"),
    "llms.txt must have Products section"
  );
  assert.ok(content.includes("[Buzz]"), "llms.txt must link Buzz");
  assert.ok(content.includes("[Channels]"), "llms.txt must link Channels");
  assert.ok(
    content.includes("[File Management]"),
    "llms.txt must link File Management"
  );
});

test("marketing sections avoid duplicate H1 tags", () => {
  const sectionFiles = [
    "src/app/(homepage)/_components/home/FeatureSection.tsx",
    "src/app/(homepage)/_components/home/ArticlesSection.tsx",
    "src/app/(homepage)/_components/home/PricingSection.tsx",
    "src/app/(homepage)/_components/home/WhySection.tsx",
    "src/app/(homepage)/_components/home/FAQSection.tsx",
    "src/app/(homepage)/_components/footer/dynamic-footer.tsx",
  ];

  for (const relativePath of sectionFiles) {
    const fullPath = path.join(root, relativePath);
    const content = fs.readFileSync(fullPath, "utf8");
    assert.ok(
      !content.includes("<h1"),
      `${relativePath} should not render <h1> tags (must use <h2> for subsections)`
    );
  }
});

test("product pages have exactly one primary H1 tag", () => {
  const productFiles = [
    "src/app/(homepage)/products/file-management/page.tsx",
    "src/app/(homepage)/products/channels/page.tsx",
    "src/app/(homepage)/products/buzz/page.tsx",
  ];

  for (const relativePath of productFiles) {
    const fullPath = path.join(root, relativePath);
    const content = fs.readFileSync(fullPath, "utf8");
    const h1Count = (content.match(/<h1[\s>]/g) || []).length;
    assert.equal(
      h1Count,
      1,
      `${relativePath} must contain exactly 1 <h1> tag for SEO and accessibility (found ${h1Count})`
    );
  }
});
