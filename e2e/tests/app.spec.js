const { test, expect } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

const APP_URL = pathToFileURL(
    path.join(__dirname, "..", "..", "frontend", "index.html")
).href;

const PASSWORD = "Passw0rd123";

// Every test uses a new email, so tests never collide with old data
function uniqueEmail() {
    return "e2e-" + Date.now() + "-" + Math.floor(Math.random() * 100000) + "@example.com";
}

async function register(page, name, email) {
    await page.goto(APP_URL);
    await page.getByText("Need an account? Register").click();
    await page.locator("#registerName").fill(name);
    await page.locator("#registerEmail").fill(email);
    await page.locator("#registerPassword").fill(PASSWORD);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.locator("#appSection")).toBeVisible();
}

async function addApplication(page, app) {
    await page.locator("#addApplicationBtn").click();
    await page.locator("#company").fill(app.company);
    await page.locator("#position").fill(app.position);
    await page.locator("#status").selectOption(app.status);
    await page.locator("#date").fill(app.date);
    await page.getByRole("button", { name: "Save Application" }).click();
    await expect(page.locator(".application-card", { hasText: app.company })).toBeVisible();
}

test("shows only the login screen to a visitor", async ({ page }) => {
    await page.goto(APP_URL);

    await expect(page.locator("#authSection")).toBeVisible();
    await expect(page.locator("#appSection")).toBeHidden();
});

test("registers a new user and logs out", async ({ page }) => {
    await register(page, "New User", uniqueEmail());

    await expect(page.locator("#userName")).toHaveText("New User");
    await expect(page.locator("#totalApplications")).toHaveText("0");

    await page.getByRole("button", { name: "Log out" }).click();

    await expect(page.locator("#authSection")).toBeVisible();
    await expect(page.locator("#appSection")).toBeHidden();
});

test("rejects a wrong password, then accepts the right one", async ({ page }) => {
    const email = uniqueEmail();

    await register(page, "Login User", email);
    await page.getByRole("button", { name: "Log out" }).click();

    await page.locator("#loginEmail").fill(email);
    await page.locator("#loginPassword").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.locator("#authError")).toHaveText("Invalid email or password");
    await expect(page.locator("#appSection")).toBeHidden();

    await page.locator("#loginPassword").fill(PASSWORD);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.locator("#appSection")).toBeVisible();
    await expect(page.locator("#userName")).toHaveText("Login User");
});

test("adds, views, edits and deletes an application", async ({ page }) => {
    await register(page, "Crud User", uniqueEmail());

    await addApplication(page, {
        company: "Google",
        position: "Software Intern",
        status: "Applied",
        date: "2026-10-11"
    });

    await expect(page.locator("#totalApplications")).toHaveText("1");
    await expect(page.locator("#appliedApplications")).toHaveText("1");

    const card = page.locator(".application-card", { hasText: "Google" });

    // View details
    await card.getByRole("button", { name: "View Details" }).click();
    await expect(page.locator("#detailsContent")).toContainText("Software Intern");
    await page.locator("#closeDetailsBtn").click();
    await expect(page.locator("#detailsOverlay")).toBeHidden();

    // Edit: change the status
    await card.getByRole("button", { name: "Edit" }).click();
    await page.locator("#status").selectOption("Interview");
    await page.getByRole("button", { name: "Save Application" }).click();

    await expect(card).toContainText("Interview");
    await expect(page.locator("#interviewApplications")).toHaveText("1");
    await expect(page.locator("#appliedApplications")).toHaveText("0");

    // Delete
    await card.getByRole("button", { name: "Delete" }).click();

    await expect(page.locator(".application-card")).toHaveCount(0);
    await expect(page.locator("#totalApplications")).toHaveText("0");
});

test("search and filter narrow the list but not the statistics", async ({ page }) => {
    await register(page, "Search User", uniqueEmail());

    await addApplication(page, {
        company: "Google",
        position: "Intern",
        status: "Applied",
        date: "2026-10-11"
    });
    await addApplication(page, {
        company: "Microsoft",
        position: "Developer",
        status: "Interview",
        date: "2026-10-12"
    });

    await page.locator("#searchInput").fill("micro");
    await expect(page.locator(".application-card")).toHaveCount(1);
    await expect(page.locator(".application-card")).toContainText("Microsoft");
    await expect(page.locator("#totalApplications")).toHaveText("2");

    await page.locator("#searchInput").fill("");
    await page.locator("#statusFilter").selectOption("Applied");
    await expect(page.locator(".application-card")).toHaveCount(1);
    await expect(page.locator(".application-card")).toContainText("Google");

    await page.locator("#searchInput").fill("zzzz");
    await expect(page.getByText("No applications found.")).toBeVisible();
});

test("keeps the session and the data after a page reload", async ({ page }) => {
    await register(page, "Reload User", uniqueEmail());

    await addApplication(page, {
        company: "Amazon",
        position: "Backend Intern",
        status: "Applied",
        date: "2026-10-11"
    });

    await page.reload();

    await expect(page.locator("#appSection")).toBeVisible();
    await expect(page.locator(".application-card", { hasText: "Amazon" })).toBeVisible();
});

test("a second user does not see the first user's applications", async ({ page }) => {
    await register(page, "User One", uniqueEmail());

    await addApplication(page, {
        company: "Secret Corp",
        position: "Analyst",
        status: "Applied",
        date: "2026-10-11"
    });

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page.locator("#authSection")).toBeVisible();

    await register(page, "User Two", uniqueEmail());

    await expect(page.locator(".application-card")).toHaveCount(0);
    await expect(page.locator("#totalApplications")).toHaveText("0");
});
