// Tests always use their own database and secret, never your real data
process.env.DB_NAME = "jobtrack_test";
process.env.DATABASE_URL = "";
process.env.JWT_SECRET = "test-secret-for-jest-only";
process.env.JWT_EXPIRES_IN = "1h";

// The auth tests make many requests from one address, so keep the limit out of their way
process.env.AUTH_RATE_LIMIT_MAX = "1000";
