import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(
    (url) => /\/(portal|admin|booster)(\/|$)/.test(url.pathname),
    { timeout: 60_000, waitUntil: "commit" }
  );
}

test("advertiser can open settings and see account controls", async ({ page }) => {
  await login(page, "client@advers.ng", "password123");
  await page.goto("/portal/settings");
  await expect(page.getByText("Account experience")).toBeVisible();
  await expect(page.getByText("Danger zone")).toBeVisible();
  await expect(page.getByText("Security & 2FA").first()).toBeVisible();
});

test("advertiser marketplace renders and profile opens", async ({ page }) => {
  await login(page, "client@advers.ng", "password123");
  await page.goto("/portal/adboosters");
  await expect(page.getByRole("heading", { name: "AdBoosters" })).toBeVisible();
  await page.goto("/portal/adboosters/chukwudi-eze");
  await expect(page.getByText("Request this Booster")).toBeVisible();
  await expect(page.getByText("Services & pricing")).toBeVisible();
});

test("campaign builder shows only television requirements", async ({ page }) => {
  await login(page, "client@advers.ng", "password123");
  await page.goto("/portal/campaigns");
  await page.getByRole("button", { name: "Launch new campaign" }).click();

  await page.fill("#campName", "E2E Television Campaign");
  await page.selectOption("#campChannel", { label: "Television advertising" });
  await page.selectOption("#campLocation", { index: 1 });
  await page.fill("#campBudget", "250000");

  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await expect(page.getByText(/Television requirements/)).toBeVisible();
  await expect(page.getByText("TV commercial *", { exact: true })).toBeVisible();
  await expect(page.getByText("Broadcast schedule *", { exact: true })).toBeVisible();
});

test("admin can open channel specs and reconciliation", async ({ page }) => {
  await login(page, "admin@advers.ng", "password123");
  await page.goto("/admin/channel-specs");
  await expect(
    page.getByRole("heading", { name: "Channel Specifications" })
  ).toBeVisible();
  await page.goto("/admin/reconciliation");
  await expect(
    page.getByRole("heading", { name: /Reconciliation/ })
  ).toBeVisible();
});
