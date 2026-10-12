CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL
        CHECK (status IN ('Applied', 'Interview', 'Offer', 'Rejected')),
    applied_date DATE NOT NULL,
    interview_date DATE,
    website VARCHAR(500) NOT NULL DEFAULT '',
    location VARCHAR(255) NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Each application belongs to a user
ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL
    REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications (user_id);
