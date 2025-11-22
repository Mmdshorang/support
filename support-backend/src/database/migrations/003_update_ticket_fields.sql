-- Migration: Update ticket fields (remove priority/channel, add support type and read tracking)

-- 1. Add support_type column if missing
ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS support_type VARCHAR(20) DEFAULT 'remote';

DO $$
BEGIN
    ALTER TABLE tickets
        ADD CONSTRAINT tickets_support_type_check
        CHECK (support_type IN ('remote', 'inPerson'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Backfill support_type using previous channel data when possible (if channel exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='tickets' AND column_name='channel') THEN
        UPDATE tickets
        SET support_type = CASE
                WHEN channel IN ('حضوری', 'inPerson', 'مراجعه حضوری', 'تلفن') THEN 'inPerson'
                ELSE 'remote'
            END
        WHERE support_type IS NULL OR support_type NOT IN ('remote', 'inPerson');
    END IF;
END $$;

-- 2. Add read tracking columns
ALTER TABLE tickets
    ADD COLUMN IF NOT EXISTS last_user_read_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_admin_read_at TIMESTAMP;

-- 3. Drop obsolete columns
ALTER TABLE tickets
    DROP COLUMN IF EXISTS priority,
    DROP COLUMN IF EXISTS channel;

DROP INDEX IF EXISTS idx_tickets_priority;

