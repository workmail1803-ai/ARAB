-- =====================================================
-- PREFERENCES/SETTINGS SCHEMA FOR TOOKAN CLONE
-- Supabase-Optimized with Proper Indexes
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Ensure settings column exists on companies table
-- The settings column stores all preferences as JSONB for flexibility
ALTER TABLE companies ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- 2. Create GIN index on settings for efficient JSONB queries
-- This allows fast queries like: WHERE settings->>'business_type' = 'appointment'
CREATE INDEX IF NOT EXISTS idx_companies_settings ON companies USING GIN (settings);

-- 3. Create partial index for specific settings queries (optional but optimized)
CREATE INDEX IF NOT EXISTS idx_companies_business_type ON companies ((settings->>'business_type'));

-- 4. Create function to initialize default settings
-- This ensures new companies get proper defaults
CREATE OR REPLACE FUNCTION initialize_company_settings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.settings IS NULL OR NEW.settings = '{}'::jsonb THEN
        NEW.settings = jsonb_build_object(
            'business_type', 'pickup_delivery',
            'map_configuration', jsonb_build_object(
                'provider', 'google',
                'radius_limit', 50,
                'real_time_tracking', true,
                'zoom_level', 12,
                'keys', jsonb_build_object(
                    'web_key', '',
                    'android_key', '',
                    'ios_key', '',
                    'server_key', ''
                )
            ),
            'date_format', 'DD MMM YYYY',
            'time_format', '12h',
            'distance_unit', 'km',
            'default_view', 'map',
            'task_delay', jsonb_build_object(
                'enabled', false,
                'threshold_minutes', 10
            ),
            'pane_customization', jsonb_build_object(
                'agent_pane', jsonb_build_object(
                    'line1', 'fleet_name',
                    'line2', 'phone',
                    'line3', 'tags'
                ),
                'task_pane', jsonb_build_object(
                    'mode', 'pickup',
                    'line1', 'job_time',
                    'line2', 'customer_name',
                    'line3', 'address'
                ),
                'tracking_pane', jsonb_build_object(
                    'line1', 'fleet_name',
                    'line2', 'job_type',
                    'line3', 'job_address'
                )
            ),
            'tracking_link', jsonb_build_object(
                'show_rating', false,
                'single_link', true,
                'show_company_name', true,
                'show_eta', true,
                'allow_calling', false,
                'header_text', ''
            ),
            'barcode_enabled', false,
            'auto_allocation', false,
            'customer_data_protection', false,
            'callback_url', ''
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for new company signup
DROP TRIGGER IF EXISTS trigger_init_company_settings ON companies;
CREATE TRIGGER trigger_init_company_settings
    BEFORE INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION initialize_company_settings();

-- 6. Update existing companies with default settings (for existing data)
UPDATE companies 
SET settings = jsonb_build_object(
    'business_type', 'pickup_delivery',
    'map_configuration', jsonb_build_object(
        'provider', 'google',
        'radius_limit', 50,
        'real_time_tracking', true,
        'zoom_level', 12,
        'keys', jsonb_build_object(
            'web_key', '',
            'android_key', '',
            'ios_key', '',
            'server_key', ''
        )
    ),
    'date_format', 'DD MMM YYYY',
    'time_format', '12h',
    'distance_unit', 'km',
    'default_view', 'map',
    'task_delay', jsonb_build_object(
        'enabled', false,
        'threshold_minutes', 10
    ),
    'pane_customization', jsonb_build_object(
        'agent_pane', jsonb_build_object(
            'line1', 'fleet_name',
            'line2', 'phone',
            'line3', 'tags'
        ),
        'task_pane', jsonb_build_object(
            'mode', 'pickup',
            'line1', 'job_time',
            'line2', 'customer_name',
            'line3', 'address'
        ),
        'tracking_pane', jsonb_build_object(
            'line1', 'fleet_name',
            'line2', 'job_type',
            'line3', 'job_address'
        )
    ),
    'tracking_link', jsonb_build_object(
        'show_rating', false,
        'single_link', true,
        'show_company_name', true,
        'show_eta', true,
        'allow_calling', false,
        'header_text', ''
    ),
    'barcode_enabled', false,
    'auto_allocation', false,
    'customer_data_protection', false,
    'callback_url', ''
)
WHERE settings IS NULL OR settings = '{}'::jsonb OR NOT settings ? 'business_type';

-- 7. Create helper function to safely update nested settings
CREATE OR REPLACE FUNCTION update_company_settings(
    p_company_id UUID,
    p_updates JSONB
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    UPDATE companies
    SET settings = settings || p_updates,
        updated_at = NOW()
    WHERE id = p_company_id
    RETURNING settings INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 8. Grant RPC access (for calling from client if needed)
-- Note: Your API uses service role, so this is optional
-- GRANT EXECUTE ON FUNCTION update_company_settings TO authenticated;

-- =====================================================
-- VERIFY INSTALLATION
-- =====================================================
-- Run this to check if settings were applied:
-- SELECT id, name, settings->>'business_type' as business_type FROM companies;

-- Check indexes:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'companies';
