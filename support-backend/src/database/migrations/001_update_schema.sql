-- Migration: Update schema for username login and remove priority

-- 1. Add username column to users table and make email nullable
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- 2. Create usernames for existing users (from their email)
UPDATE users SET username = SPLIT_PART(email, '@', 1) WHERE username IS NULL;

-- 3. Make username NOT NULL after populating
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- 4. Update index for username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 5. Make priority nullable in tickets (remove NOT NULL constraint)
ALTER TABLE tickets ALTER COLUMN priority DROP NOT NULL;
ALTER TABLE tickets ALTER COLUMN priority DROP DEFAULT;

-- 6. Drop the CHECK constraint on priority (if it causes issues, we'll make it nullable)
-- Note: To drop a constraint, we need to know its name. Let's recreate the table constraint
-- First, let's just make priority fully optional
DO $$
BEGIN
    -- Try to drop the check constraint (name may vary)
    ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_priority_check;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- 7. Add solution field to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS solution TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS channel VARCHAR(50) DEFAULT 'وب';

-- Update existing tickets to have default channel if NULL
UPDATE tickets SET channel = 'وب' WHERE channel IS NULL;
