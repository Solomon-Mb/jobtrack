const { test, expect } = require("@playwright/test");

test("buttons still work when the backend serves the page", async ({ page }) => {
    const email = "served-" + Date.now() + "@example.com";

    await page.goto("http://localhost:5000/");
    await page.getByText("Need an account? Register").click();
    await page.locator("#registerName").fill("Served User");
    await page.locator("#registerEmail").fill(email);
    await page.locator("#registerPassword").fill("Passw0rd123");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("#appSection")).toBeVisible();

    await page.locator("#addApplicationBtn").click();
    await page.locator("#company").fill("Stripe");
    await page.locator("#position").fill("Backend Intern");
    await page.locator("#date").fill("2026-10-11");
    await page.getByRole("button", { name: "Save Application" }).click();

    const card = page.locator(".application-card", { hasText: "Stripe" });
    await expect(card).toBeVisible();

    // These buttons use inline onclick handlers, which a strict policy would block
    await card.getByRole("button", { name: "View Details" }).click();
    await expect(page.locator("#detailsOverlay")).toBeVisible();
});
