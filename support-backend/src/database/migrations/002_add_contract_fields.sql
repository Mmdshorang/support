-- Migration: add contract fields and user/customer linkage

-- 1. Add contract fields to customers table
ALTER TABLE customers
    ADD COLUMN IF NOT EXISTS contract_start_date DATE,
    ADD COLUMN IF NOT EXISTS contract_end_date DATE,
    ADD COLUMN IF NOT EXISTS contract_tier VARCHAR(20) DEFAULT 'standard';

-- Ensure contract tier always has an allowed value
DO $$
BEGIN
    ALTER TABLE customers
        ADD CONSTRAINT customers_contract_tier_check
        CHECK (contract_tier IN ('basic', 'standard', 'premium'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

UPDATE customers
SET contract_tier = COALESCE(contract_tier, 'standard');

-- 2. Add customer_id reference to users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS customer_id UUID UNIQUE;

DO $$
BEGIN
    ALTER TABLE users
        ADD CONSTRAINT users_customer_id_fkey
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Backfill customer_id for users that match by email
UPDATE users u
SET customer_id = c.id
FROM customers c
WHERE u.customer_id IS NULL AND c.email IS NOT NULL AND u.email = c.email;

