const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./tests",

    // Tests share one database, so run them one at a time
    workers: 1,
    fullyParallel: false,

    reporter: [["list"], ["html", { open: "never" }]],

    use: {
        headless: true,
        screenshot: "only-on-failure",
        trace: "retain-on-failure"
    },

    // Starts the real backend against the TEST database before the tests run
    webServer: {
        command: "node db/init.js && node server.js",
        cwd: "../backend",
        url: "http://localhost:5000/api/health",
        reuseExistingServer: false,
        timeout: 30000,
        env: {
            PORT: "5000",
            DB_NAME: "jobtrack_test",
            JWT_SECRET: "e2e-secret-for-tests-only",
                                    JWT_EXPIRES_IN: "1h",
            DATABASE_URL: "",
            AUTH_RATE_LIMIT_MAX: "1000"
        }
    }
});
