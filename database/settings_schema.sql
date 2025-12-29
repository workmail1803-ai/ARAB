-- Settings table for company preferences
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  business_type TEXT DEFAULT 'pickup',
  date_format TEXT DEFAULT 'DD MMM YYYY',
  time_format TEXT DEFAULT '12',
  distance_unit TEXT DEFAULT 'km',
  map_type TEXT DEFAULT 'google',
  real_time_tracking BOOLEAN DEFAULT true,
  show_delay_time BOOLEAN DEFAULT true,
  delay_minutes INTEGER DEFAULT 5,
  theme_navbar_color TEXT DEFAULT '#4F46E5',
  theme_button_color TEXT DEFAULT '#4F46E5',
  theme_menu_hover_color TEXT DEFAULT '#EEF2FF',
  default_dashboard_view TEXT DEFAULT 'map',
  enable_address_update BOOLEAN DEFAULT false,
  enable_qr_code BOOLEAN DEFAULT false,
  disable_ratings_tracking BOOLEAN DEFAULT false,
  enable_eta_tracking BOOLEAN DEFAULT true,
  disable_call_sms_tracking BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Notification settings matrix
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  sms_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT false,
  webhook_enabled BOOLEAN DEFAULT false,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, event_type)
);

-- Insert default settings for existing companies
INSERT INTO company_settings (company_id)
SELECT id FROM companies
WHERE id NOT IN (SELECT company_id FROM company_settings WHERE company_id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Disable RLS for now
ALTER TABLE company_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings DISABLE ROW LEVEL SECURITY;
