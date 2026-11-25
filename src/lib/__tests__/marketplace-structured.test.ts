import test from "node:test";
import assert from "node:assert/strict";
import {
  parsePackageLines,
  parsePortfolioLines,
  parsePriceToInt,
  parseServiceLines,
} from "../marketplace-structured";

test("parsePriceToInt handles currency symbols and commas", () => {
  assert.equal(parsePriceToInt("₦80,000"), 80000);
  assert.equal(parsePriceToInt("₦1,500.50"), 150050);
  assert.equal(parsePriceToInt(""), null);
});

test("parseServiceLines reads title, amount, description and delivery", () => {
  const services = parseServiceLines(
    "Logo design | ₦80,000 | Three concepts | 5 days\nFlyer design | ₦25,000"
  );
  assert.equal(services.length, 2);
  assert.equal(services[0].title, "Logo design");
  assert.equal(services[0].priceMin, 80000);
  assert.equal(services[0].deliveryDays, 5);
  assert.equal(services[1].title, "Flyer design");
});

test("parsePackageLines drops incomplete packages", () => {
  const packages = parsePackageLines(
    "Starter | ₦100,000 | 7 days | Two posters | Design, 2 revisions\nNo price |"
  );
  assert.equal(packages.length, 1);
  assert.equal(packages[0].name, "Starter");
  assert.equal(packages[0].price, 100000);
  assert.equal(packages[0].deliveryDays, 7);
  assert.deepEqual(packages[0].includes, ["Design", "2 revisions"]);
});

test("parsePortfolioLines reads title, URL and description", () => {
  const items = parsePortfolioLines(
    "Launch campaign | https://example.com/case | Multi-channel launch\nBad line"
  );
  assert.equal(items.length, 1);
  assert.equal(items[0].title, "Launch campaign");
  assert.equal(items[0].externalUrl, "https://example.com/case");
});
