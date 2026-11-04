const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("Issue #2518: Checkbox uses valid 6-digit hex border color", () => {
  const checkboxPath = path.resolve(
    __dirname,
    "../src/components/ui/checkbox.tsx"
  );
  const content = fs.readFileSync(checkboxPath, "utf8");

  assert.ok(
    content.includes("border-[#adadea]"),
    "Checkbox component must use valid 6-digit hex border color border-[#adadea]"
  );

  assert.ok(
    !content.includes("border-[#adadeaf]"),
    "Checkbox component must not contain invalid 7-digit hex border-[#adadeaf]"
  );

  // Verify no 7-digit hex color literals in the component
  const sevenDigitHex = /#[0-9a-fA-F]{7}(?![0-9a-fA-F])/g;
  const matches = content.match(sevenDigitHex);
  assert.equal(
    matches,
    null,
    `Found invalid 7-digit hex colors in checkbox.tsx: ${JSON.stringify(matches)}`
  );
});
