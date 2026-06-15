-- ============================================================
-- PostgreSQL schema + seed for the Employee Onboarding System
-- (the relational core; MongoDB collections are auto-created by
--  the Node service, so they need no schema here)
--
-- Usage (run once on a fresh machine):
--   1) createdb -U postgres onboarding_db          (or: CREATE DATABASE onboarding_db;)
--   2) psql -U postgres -d onboarding_db -f database/schema.sql
-- ============================================================

DROP TABLE IF EXISTS user_step_progress, user_workflow, steps, workflows, users CASCADE;

CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255),
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(50)  NOT NULL,          -- ADMIN | MANAGER | USER
    created_at TIMESTAMP
);

CREATE TABLE workflows (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(255),
    job_type    VARCHAR(255),
    description TEXT,
    created_at  TIMESTAMP
);

CREATE TABLE steps (
    id          BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT REFERENCES workflows(id),
    title       VARCHAR(255),
    description TEXT,
    step_order  INTEGER
);

CREATE TABLE user_workflow (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id),
    workflow_id BIGINT REFERENCES workflows(id),
    assigned_at TIMESTAMP,
    status      VARCHAR(50)                     -- IN_PROGRESS | COMPLETED
);

CREATE TABLE user_step_progress (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id),
    step_id      BIGINT REFERENCES steps(id),
    status       VARCHAR(50),                   -- PENDING | DONE
    completed_at TIMESTAMP
);

-- ---- Seed accounts ----------------------------------------------------------
-- NOTE: passwords are plain text by design of this demo app (no hashing).
INSERT INTO users (name, email, password, role, created_at) VALUES
    ('Admin',     'admin@company.com',     'admin123',     'ADMIN', NOW()),
    ('Yashwanth', 'yashwanth@company.com', 'yashwanth123', 'USER',  NOW());

-- Optional: a sample workflow with steps (uncomment to pre-load demo data)
-- INSERT INTO workflows (title, job_type, description, created_at)
--   VALUES ('Engineer Onboarding', 'ENGINEER', 'Standard onboarding for engineers', NOW());
-- INSERT INTO steps (workflow_id, title, description, step_order) VALUES
--   (1, 'Sign NDA',        'Read and sign the NDA',          1),
--   (1, 'Set up laptop',   'Install required software',      2),
--   (1, 'Meet your team',  'Intro call with the team',       3);
