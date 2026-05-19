-- ============================================
-- SUPABASE SCHEMA FOR DEVSECOPS PROJECT
-- ============================================
-- Run this SQL in your Supabase project's SQL Editor

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create scan_reports table (migrating from Django ScanReport)
-- Note: user_id references auth.users(id) - Supabase's built-in auth table
CREATE TABLE IF NOT EXISTS scan_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    repo_url TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    compliance_score NUMERIC(5, 2),
    risk_level VARCHAR(50),
    report_json JSONB,
    scan_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for scan_reports
CREATE INDEX idx_scan_reports_user_id ON scan_reports(user_id);
CREATE INDEX idx_scan_reports_created_at ON scan_reports(created_at DESC);
CREATE INDEX idx_scan_reports_status ON scan_reports(scan_status);

-- 3. Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for search_history
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);

-- 4. Enable Row Level Security (RLS) for privacy
ALTER TABLE scan_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read/write their own scan reports
CREATE POLICY "Users can only see their own scan reports"
    ON scan_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own scan reports"
    ON scan_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own scan reports"
    ON scan_reports FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scan reports"
    ON scan_reports FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policy: Users can only read/write their own search history
CREATE POLICY "Users can only see their own search history"
    ON search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own search history"
    ON search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
    ON search_history FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Create functions for maintaining search history (keep last 10)
CREATE OR REPLACE FUNCTION maintain_search_history_limit()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM search_history
    WHERE user_id = NEW.user_id
    AND id NOT IN (
        SELECT id FROM search_history
        WHERE user_id = NEW.user_id
        ORDER BY created_at DESC
        LIMIT 10
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain history limit
CREATE TRIGGER trigger_maintain_search_history
AFTER INSERT ON search_history
FOR EACH ROW
EXECUTE FUNCTION maintain_search_history_limit();

-- ============================================
-- NOTES FOR SETUP
-- ============================================
-- 1. User authentication is handled by Supabase Auth
--    No need to create users table - auth.users exists by default
--
-- 2. After creating tables, update Django settings:
--    - Set SUPABASE_URL and SUPABASE_ANON_KEY in .env
--    - Use supabase-py client to connect
--
-- 3. RLS Policies ensure users can only see their own data
--
-- 4. search_history automatically maintains last 10 entries per user
--    via the trigger function
--
-- 5. For local development, you can temporarily disable RLS:
--    ALTER TABLE scan_reports DISABLE ROW LEVEL SECURITY;
--    ALTER TABLE search_history DISABLE ROW LEVEL SECURITY;
--    Remember to re-enable before production!
