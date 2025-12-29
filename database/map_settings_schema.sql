-- Map Configuration settings table
CREATE TABLE IF NOT EXISTS map_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  map_type TEXT DEFAULT 'google', -- 'google' or 'mappr'
  real_time_tracking BOOLEAN DEFAULT false,
  web_key TEXT,
  android_key TEXT,
  ios_key TEXT,
  server_key TEXT,
  form_key TEXT,
  mappr_dashboard_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Insert default map settings for existing companies
INSERT INTO map_settings (company_id)
SELECT id FROM companies
WHERE id NOT IN (SELECT company_id FROM map_settings WHERE company_id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Disable RLS for now
ALTER TABLE map_settings DISABLE ROW LEVEL SECURITY;
