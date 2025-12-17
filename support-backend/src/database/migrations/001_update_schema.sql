-- Migration: Update schema for username login and remove priority

-- 1. Add username column to users table and make email nullable (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables 
               WHERE table_schema = 'public' AND table_name = 'users') THEN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;
        
        -- Make email nullable if username column was just added or exists
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='email' AND is_nullable='NO') THEN
            ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
        END IF;

        -- 2. Create usernames for existing users (from their email)
        UPDATE users SET username = SPLIT_PART(email, '@', 1) WHERE username IS NULL AND email IS NOT NULL;

        -- 3. Make username NOT NULL after populating (only if there are no NULL usernames)
        IF NOT EXISTS (SELECT 1 FROM users WHERE username IS NULL) THEN
            ALTER TABLE users ALTER COLUMN username SET NOT NULL;
        END IF;
    END IF;
END $$;

-- 4. Update index for username
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 5. Handle priority column if it exists (for legacy databases)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='tickets' AND column_name='priority') THEN
        ALTER TABLE tickets ALTER COLUMN priority DROP NOT NULL;
        ALTER TABLE tickets ALTER COLUMN priority DROP DEFAULT;
        ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_priority_check;
    END IF;
END $$;

-- 6. Add solution field to tickets table (if not exists)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS solution TEXT;

-- 7. Handle channel column if it exists (for legacy databases)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='tickets' AND column_name='channel') THEN
        UPDATE tickets SET channel = 'وب' WHERE channel IS NULL;
    END IF;
END $$;
