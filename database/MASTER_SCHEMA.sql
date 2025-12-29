-- =====================================================
-- TOOKAN CLONE - MASTER DATABASE SCHEMA
-- =====================================================
-- Run this SINGLE file in your Supabase SQL Editor
-- It includes ALL tables, indexes, functions, and seed data
-- 
-- Generated: December 29, 2025
-- Optimized for Supabase Free Tier (500MB RAM)
-- =====================================================

-- =====================================================
-- PART 1: EXTENSIONS & CORE SCHEMA
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For faster text search

-- =====================================================
-- COMPANIES TABLE (Tenants)
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    api_key VARCHAR(100) UNIQUE NOT NULL,
    webhook_secret VARCHAR(100) NOT NULL,
    company_code VARCHAR(50),
    plan VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RIDERS TABLE (Delivery Agents)
-- =====================================================
CREATE TABLE IF NOT EXISTS riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    external_source VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'active', 'busy', 'break')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    battery_level SMALLINT CHECK (battery_level >= 0 AND battery_level <= 100),
    vehicle_type VARCHAR(50),
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    external_source VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    addresses JSONB DEFAULT '[]',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRODUCTS TABLE (Inventory)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sku VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2),
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    category VARCHAR(100),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    external_source VARCHAR(100),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed')),
    pickup_address TEXT,
    delivery_address TEXT NOT NULL,
    items JSONB DEFAULT '[]',
    subtotal DECIMAL(10, 2),
    delivery_fee DECIMAL(10, 2),
    total DECIMAL(10, 2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'cod', 'refunded', 'failed')),
    notes TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('payment', 'refund', 'cod_collection', 'payout')),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    payment_method VARCHAR(50),
    rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LOCATION HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS location_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2),
    heading SMALLINT CHECK (heading >= 0 AND heading <= 360),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 2: SETTINGS & PREFERENCES
-- =====================================================

-- Company Settings Table
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

-- Notification Settings
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

-- Map Settings
CREATE TABLE IF NOT EXISTS map_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    map_type TEXT DEFAULT 'openstreetmap', -- 'google', 'openstreetmap', 'mappr'
    real_time_tracking BOOLEAN DEFAULT false,
    web_key TEXT,
    android_key TEXT,
    ios_key TEXT,
    server_key TEXT,
    form_key TEXT,
    mappr_dashboard_url TEXT,
    default_latitude DECIMAL(10, 8) DEFAULT 24.7136, -- Riyadh
    default_longitude DECIMAL(11, 8) DEFAULT 46.6753, -- Riyadh
    default_zoom INTEGER DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)
);

-- =====================================================
-- PART 3: AGENT APP SESSIONS
-- =====================================================

-- Rider Credentials (For Agent App Login)
CREATE TABLE IF NOT EXISTS rider_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    pin_code VARCHAR(6) NOT NULL,
    password_hash VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rider_id)
);

-- Agent Sessions (Track Active App Sessions)
CREATE TABLE IF NOT EXISTS agent_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_type VARCHAR(50),
    device_model VARCHAR(100),
    app_version VARCHAR(20),
    os_version VARCHAR(20),
    push_token TEXT,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Agent Activity Log
CREATE TABLE IF NOT EXISTS agent_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    session_id UUID REFERENCES agent_sessions(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB DEFAULT '{}',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rider Devices Registry
CREATE TABLE IF NOT EXISTS rider_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(100),
    device_type VARCHAR(50),
    device_model VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    is_trusted BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rider_id, device_id)
);

-- =====================================================
-- PART 4: EXTERNAL INTEGRATIONS
-- =====================================================

-- External Integrations (WooCommerce, Shopify, WordPress, Custom)
CREATE TABLE IF NOT EXISTS external_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- 'woocommerce', 'shopify', 'wordpress', 'custom'
    name VARCHAR(255) NOT NULL,
    api_url VARCHAR(500) NOT NULL,
    api_key VARCHAR(500),
    api_secret VARCHAR(500),
    webhook_secret VARCHAR(255),
    sync_riders BOOLEAN DEFAULT true,
    sync_orders BOOLEAN DEFAULT true,
    sync_customers BOOLEAN DEFAULT true,
    sync_interval_minutes INTEGER DEFAULT 5,
    riders_endpoint VARCHAR(255) DEFAULT '/wp-json/delivery/v1/riders',
    orders_endpoint VARCHAR(255) DEFAULT '/wp-json/wc/v3/orders',
    customers_endpoint VARCHAR(255) DEFAULT '/wp-json/wc/v3/customers',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    last_sync_status VARCHAR(50),
    last_sync_error TEXT,
    total_riders_synced INTEGER DEFAULT 0,
    total_orders_synced INTEGER DEFAULT 0,
    total_customers_synced INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration Sync Logs
CREATE TABLE IF NOT EXISTS integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES external_integrations(id) ON DELETE CASCADE,
    sync_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    records_fetched INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PART 5: SCHEMA MIGRATIONS (Add missing columns to existing tables)
-- =====================================================

-- Add company_code if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'company_code') THEN
        ALTER TABLE companies ADD COLUMN company_code VARCHAR(50);
    END IF;
END $$;

-- Add external_id and external_source to riders if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'riders' AND column_name = 'external_id') THEN
        ALTER TABLE riders ADD COLUMN external_id VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'riders' AND column_name = 'external_source') THEN
        ALTER TABLE riders ADD COLUMN external_source VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'riders' AND column_name = 'updated_at') THEN
        ALTER TABLE riders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add external_id and external_source to orders if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'external_source') THEN
        ALTER TABLE orders ADD COLUMN external_source VARCHAR(100);
    END IF;
END $$;

-- Add external_id and external_source to customers if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'external_id') THEN
        ALTER TABLE customers ADD COLUMN external_id VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'external_source') THEN
        ALTER TABLE customers ADD COLUMN external_source VARCHAR(100);
    END IF;
END $$;

-- =====================================================
-- PART 6: ALL INDEXES
-- =====================================================

-- Companies Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_api_key ON companies(api_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_company_code ON companies(company_code) WHERE company_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- Riders Indexes
CREATE INDEX IF NOT EXISTS idx_riders_company_id ON riders(company_id);
CREATE INDEX IF NOT EXISTS idx_riders_company_status ON riders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_riders_status ON riders(status);
CREATE INDEX IF NOT EXISTS idx_riders_phone ON riders(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_riders_external_id ON riders(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_riders_active ON riders(company_id, last_seen) WHERE status IN ('active', 'busy');
CREATE INDEX IF NOT EXISTS idx_riders_external ON riders(company_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_riders_location ON riders(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_riders_updated_at ON riders(updated_at DESC);

-- Customers Indexes
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_phone ON customers(company_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_company_email ON customers(company_id, email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_external_id ON customers(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at DESC);

-- Products Indexes
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_company_sku ON products(company_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_company_category ON products(company_id, category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(company_id, stock_quantity) WHERE stock_quantity <= low_stock_threshold AND is_active = true;

-- Orders Indexes
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_company_status ON orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_company_created ON orders(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON orders(rider_id) WHERE rider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id) WHERE rider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id) WHERE customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_pending ON orders(company_id, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(company_id, rider_id) WHERE status IN ('assigned', 'picked_up', 'in_transit');
CREATE INDEX IF NOT EXISTS idx_orders_external ON orders(company_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_external_id ON orders(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_scheduled_at ON orders(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_company ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_created ON transactions(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(order_id) WHERE order_id IS NOT NULL;

-- Location History Indexes
CREATE INDEX IF NOT EXISTS idx_location_rider_time ON location_history(rider_id, recorded_at DESC);

-- Settings Indexes
CREATE INDEX IF NOT EXISTS idx_company_settings_company ON company_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_company ON notification_settings(company_id);
CREATE INDEX IF NOT EXISTS idx_map_settings_company ON map_settings(company_id);

-- Agent Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_rider_credentials_rider ON rider_credentials(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_credentials_company ON rider_credentials(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_rider ON agent_sessions(rider_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_company ON agent_sessions(company_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_token ON agent_sessions(session_token) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_sessions_device ON agent_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_active ON agent_sessions(company_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_sessions_rider_active ON agent_sessions(rider_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_sessions_expires ON agent_sessions(expires_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agent_activity_rider ON agent_activity_log(rider_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_activity_company ON agent_activity_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_activity_type ON agent_activity_log(company_id, activity_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rider_devices_rider ON rider_devices(rider_id);
CREATE INDEX IF NOT EXISTS idx_rider_devices_device ON rider_devices(device_id);

-- External Integrations Indexes
CREATE INDEX IF NOT EXISTS idx_external_integrations_company ON external_integrations(company_id);
CREATE INDEX IF NOT EXISTS idx_external_integrations_active ON external_integrations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_external_integrations_type ON external_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_external_integrations_last_sync ON external_integrations(last_sync_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_integration ON integration_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_created ON integration_sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_sync_logs_status ON integration_sync_logs(status);

-- JSONB Indexes for Settings
CREATE INDEX IF NOT EXISTS idx_companies_settings ON companies USING GIN (settings);
CREATE INDEX IF NOT EXISTS idx_companies_business_type ON companies ((settings->>'business_type'));

-- Composite Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_riders_company_location_updated ON riders(company_id, updated_at DESC) WHERE status != 'offline' AND latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_company_pending ON orders(company_id, created_at DESC) WHERE status IN ('pending', 'assigned', 'in_progress');
CREATE INDEX IF NOT EXISTS idx_orders_company_date ON orders(company_id, created_at);
CREATE INDEX IF NOT EXISTS idx_integrations_active_sync ON external_integrations(company_id, sync_interval_minutes) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_orders_not_completed ON orders(company_id, status, created_at) WHERE status NOT IN ('delivered', 'cancelled');

-- =====================================================
-- PART 7: FUNCTIONS & TRIGGERS
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old locations (keep 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_locations()
RETURNS void AS $$
BEGIN
    DELETE FROM location_history 
    WHERE recorded_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Cleanup old agent activity (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_agent_activity()
RETURNS void AS $$
BEGIN
    DELETE FROM agent_activity_log 
    WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Increment customer stats
CREATE OR REPLACE FUNCTION increment_customer_stats(
    p_customer_id UUID,
    p_amount DECIMAL
)
RETURNS VOID AS $$
BEGIN
    UPDATE customers
    SET 
        total_orders = total_orders + 1,
        total_spent = total_spent + COALESCE(p_amount, 0)
    WHERE id = p_customer_id;
END;
$$ LANGUAGE plpgsql;

-- Initialize company settings with defaults
CREATE OR REPLACE FUNCTION initialize_company_settings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.settings IS NULL OR NEW.settings = '{}'::jsonb THEN
        NEW.settings = jsonb_build_object(
            'business_type', 'pickup_delivery',
            'map_configuration', jsonb_build_object(
                'provider', 'openstreetmap',
                'radius_limit', 50,
                'real_time_tracking', true,
                'zoom_level', 12,
                'default_lat', 24.7136,
                'default_lng', 46.6753
            ),
            'date_format', 'DD MMM YYYY',
            'time_format', '12h',
            'distance_unit', 'km',
            'default_view', 'map',
            'task_delay', jsonb_build_object(
                'enabled', false,
                'threshold_minutes', 10
            ),
            'tracking_link', jsonb_build_object(
                'show_rating', false,
                'single_link', true,
                'show_company_name', true,
                'show_eta', true,
                'allow_calling', false
            ),
            'barcode_enabled', false,
            'auto_allocation', false
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Validate Agent Session
CREATE OR REPLACE FUNCTION validate_agent_session(p_session_token VARCHAR)
RETURNS TABLE(
    rider_id UUID,
    company_id UUID,
    session_id UUID,
    is_valid BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.rider_id,
        s.company_id,
        s.id as session_id,
        (s.is_active AND (s.expires_at IS NULL OR s.expires_at > NOW())) as is_valid
    FROM agent_sessions s
    WHERE s.session_token = p_session_token;
END;
$$ LANGUAGE plpgsql;

-- Update Agent Heartbeat (location update from app)
CREATE OR REPLACE FUNCTION update_agent_heartbeat(
    p_session_token VARCHAR,
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_battery_level SMALLINT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_rider_id UUID;
    v_session_id UUID;
BEGIN
    SELECT rider_id, id INTO v_rider_id, v_session_id
    FROM agent_sessions
    WHERE session_token = p_session_token
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW());
    
    IF v_rider_id IS NULL THEN
        RETURN FALSE;
    END IF;
    
    UPDATE agent_sessions SET last_active = NOW() WHERE id = v_session_id;
    
    UPDATE riders
    SET 
        latitude = p_latitude,
        longitude = p_longitude,
        battery_level = COALESCE(p_battery_level, battery_level),
        last_seen = NOW(),
        status = CASE WHEN status = 'offline' THEN 'active' ELSE status END
    WHERE id = v_rider_id;
    
    INSERT INTO location_history (rider_id, latitude, longitude)
    VALUES (v_rider_id, p_latitude, p_longitude);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Update company settings helper
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

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Drop existing triggers first (idempotent)
DROP TRIGGER IF EXISTS companies_updated_at ON companies;
DROP TRIGGER IF EXISTS riders_updated_at ON riders;
DROP TRIGGER IF EXISTS rider_credentials_updated_at ON rider_credentials;
DROP TRIGGER IF EXISTS trigger_init_company_settings ON companies;

-- Create triggers
CREATE TRIGGER companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER riders_updated_at
    BEFORE UPDATE ON riders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER rider_credentials_updated_at
    BEFORE UPDATE ON rider_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_init_company_settings
    BEFORE INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION initialize_company_settings();

-- =====================================================
-- PART 8: VIEWS
-- =====================================================

-- Daily Order Stats View
CREATE OR REPLACE VIEW daily_order_stats AS
SELECT 
    company_id,
    DATE(created_at) as date,
    COUNT(*) as total_orders,
    COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COALESCE(SUM(total) FILTER (WHERE status = 'delivered'), 0) as revenue
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY company_id, DATE(created_at);

-- Active Riders View
CREATE OR REPLACE VIEW active_riders AS
SELECT 
    id, company_id, name, phone, status, 
    latitude, longitude, battery_level, last_seen
FROM riders
WHERE status IN ('active', 'busy')
  AND last_seen >= NOW() - INTERVAL '10 minutes';

-- Active Agents with Session Info View
CREATE OR REPLACE VIEW active_agents_view AS
SELECT 
    r.id as rider_id,
    r.company_id,
    r.name,
    r.phone,
    r.status,
    r.latitude,
    r.longitude,
    r.battery_level,
    r.vehicle_type,
    r.last_seen,
    s.id as session_id,
    s.device_type,
    s.device_model,
    s.app_version,
    s.last_active as session_last_active,
    s.push_token IS NOT NULL as has_push_token
FROM riders r
LEFT JOIN agent_sessions s ON r.id = s.rider_id AND s.is_active = true
WHERE r.status IN ('active', 'busy')
  AND r.last_seen >= NOW() - INTERVAL '10 minutes';

-- =====================================================
-- PART 9: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on tenant tables
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rider_devices ENABLE ROW LEVEL SECURITY;

-- Disable RLS for settings (simpler access)
ALTER TABLE company_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE map_settings DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 10: DEMO SEED DATA
-- =====================================================

-- First, delete existing demo data if present (clean slate)
DELETE FROM rider_credentials WHERE company_id IN (SELECT id FROM companies WHERE email = 'demo@example.com');
DELETE FROM orders WHERE company_id IN (SELECT id FROM companies WHERE email = 'demo@example.com');
DELETE FROM customers WHERE company_id IN (SELECT id FROM companies WHERE email = 'demo@example.com');
DELETE FROM riders WHERE company_id IN (SELECT id FROM companies WHERE email = 'demo@example.com');
DELETE FROM map_settings WHERE company_id IN (SELECT id FROM companies WHERE email = 'demo@example.com');
DELETE FROM companies WHERE email = 'demo@example.com';

-- Create demo company (Riyadh-based)
INSERT INTO companies (id, name, email, password_hash, api_key, webhook_secret, company_code, plan, settings, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'شركة توصيل الرياض', -- Riyadh Delivery Company
    'demo@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X.VGh5Q3UZLZW0ICG', -- Password: demo1234
    'tk_demo_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    'whsec_demo_abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    'RIYADH',
    'professional',
    '{"timezone": "Asia/Riyadh", "currency": "SAR", "language": "ar"}',
    true
);

-- Create demo riders in Riyadh
INSERT INTO riders (id, company_id, name, phone, email, status, latitude, longitude, battery_level, vehicle_type, last_seen)
VALUES 
    ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', 'أحمد الراكب', '+966501234567', 'ahmed@demo.com', 'active', 24.7136, 46.6753, 85, 'motorcycle', NOW()),
    ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', 'محمد السائق', '+966501234568', 'mohammed@demo.com', 'active', 24.7400, 46.6500, 92, 'car', NOW()),
    ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', 'خالد الدراج', '+966501234569', 'khaled@demo.com', 'busy', 24.6900, 46.7000, 45, 'bicycle', NOW()),
    ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111111', 'عمر الفان', '+966501234570', 'omar@demo.com', 'offline', 24.7200, 46.6900, 100, 'van', NOW()),
    ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111111', 'فهد السريع', '+966501234571', 'fahad@demo.com', 'active', 24.7000, 46.7100, 67, 'motorcycle', NOW());

-- Create demo customers in Riyadh
INSERT INTO customers (id, company_id, name, phone, email, addresses, total_orders, total_spent)
VALUES 
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111', 'سارة الزبون', '+966551234567', 'sara@customer.com', '[{"label": "المنزل", "address": "حي العليا، الرياض"}]', 5, 499.95),
    ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111', 'فاطمة المشتري', '+966551234568', 'fatima@customer.com', '[{"label": "المكتب", "address": "طريق الملك فهد، الرياض"}]', 3, 299.97),
    ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111', 'نورة العميل', '+966551234569', 'noura@customer.com', '[{"label": "المنزل", "address": "حي النزهة، الرياض"}]', 8, 799.92);

-- Create demo orders
INSERT INTO orders (id, company_id, external_id, customer_id, rider_id, status, pickup_address, delivery_address, items, subtotal, delivery_fee, total, payment_method, payment_status, notes, created_at)
VALUES 
    ('44444444-4444-4444-4444-444444444401', '11111111-1111-1111-1111-111111111111', 'ORD-001', '33333333-3333-3333-3333-333333333301', NULL, 'pending', 'مطعم الأصيل، طريق التخصصي', 'حي العليا، الرياض', '[{"name": "كبسة", "qty": 2, "price": 45.00}]', 90.00, 15.00, 105.00, 'card', 'paid', 'بدون بصل', NOW() - INTERVAL '10 minutes'),
    ('44444444-4444-4444-4444-444444444402', '11111111-1111-1111-1111-111111111111', 'ORD-002', '33333333-3333-3333-3333-333333333302', NULL, 'pending', 'مخبز الفرن الذهبي', 'طريق الملك فهد، الرياض', '[{"name": "خبز طازج", "qty": 5, "price": 5.00}]', 25.00, 10.00, 35.00, 'card', 'paid', 'استلام من الباب', NOW() - INTERVAL '5 minutes'),
    ('44444444-4444-4444-4444-444444444403', '11111111-1111-1111-1111-111111111111', 'ORD-003', '33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', 'assigned', 'سوبرماركت التموين', 'حي النزهة، الرياض', '[{"name": "مواد غذائية", "qty": 1, "price": 150.00}]', 150.00, 20.00, 170.00, 'cod', 'cod', 'اتصل عند الوصول', NOW() - INTERVAL '15 minutes'),
    ('44444444-4444-4444-4444-444444444404', '11111111-1111-1111-1111-111111111111', 'ORD-004', '33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222203', 'in_transit', 'مقهى القهوة العربية', 'حي العليا، الرياض', '[{"name": "قهوة عربية", "qty": 4, "price": 20.00}]', 80.00, 10.00, 90.00, 'card', 'paid', 'مشروبات ساخنة', NOW() - INTERVAL '25 minutes'),
    ('44444444-4444-4444-4444-444444444405', '11111111-1111-1111-1111-111111111111', 'ORD-005', '33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', 'delivered', 'مطعم المشويات', 'طريق الملك فهد، الرياض', '[{"name": "مشاوي مشكلة", "qty": 1, "price": 120.00}]', 120.00, 15.00, 135.00, 'card', 'paid', 'تم التوصيل بنجاح', NOW() - INTERVAL '2 hours'),
    ('44444444-4444-4444-4444-444444444406', '11111111-1111-1111-1111-111111111111', 'ORD-006', '33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222201', 'delivered', 'حلويات السعادة', 'حي النزهة، الرياض', '[{"name": "كنافة", "qty": 2, "price": 40.00}]', 80.00, 10.00, 90.00, 'card', 'paid', 'كعكة عيد ميلاد', NOW() - INTERVAL '4 hours');

-- Update delivered orders timestamps
UPDATE orders SET delivered_at = created_at + INTERVAL '30 minutes' WHERE status = 'delivered' AND delivered_at IS NULL;
UPDATE orders SET picked_up_at = created_at + INTERVAL '10 minutes' WHERE status IN ('delivered', 'in_transit') AND picked_up_at IS NULL;

-- Create rider credentials (PIN: 123456 for all)
INSERT INTO rider_credentials (id, rider_id, company_id, pin_code, is_active)
VALUES 
    ('55555555-5555-5555-5555-555555555501', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111', '123456', true),
    ('55555555-5555-5555-5555-555555555502', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111', '123456', true),
    ('55555555-5555-5555-5555-555555555503', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111', '123456', true),
    ('55555555-5555-5555-5555-555555555504', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111111', '123456', true),
    ('55555555-5555-5555-5555-555555555505', '22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111111', '123456', true);

-- Create map settings for demo company (OpenStreetMap, Riyadh center)
INSERT INTO map_settings (company_id, map_type, real_time_tracking, default_latitude, default_longitude, default_zoom)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'openstreetmap',
    true,
    24.7136,
    46.6753,
    12
);

-- =====================================================
-- PART 11: ANALYZE TABLES
-- =====================================================
ANALYZE companies;
ANALYZE riders;
ANALYZE customers;
ANALYZE products;
ANALYZE orders;
ANALYZE transactions;
ANALYZE location_history;
ANALYZE rider_credentials;
ANALYZE agent_sessions;
ANALYZE agent_activity_log;
ANALYZE rider_devices;
ANALYZE external_integrations;
ANALYZE integration_sync_logs;
ANALYZE company_settings;
ANALYZE notification_settings;
ANALYZE map_settings;

-- =====================================================
-- DEMO LOGIN CREDENTIALS
-- =====================================================
-- 
-- 🔐 Dashboard Login:
--    Email: demo@example.com
--    Password: demo1234
--    API Key: tk_demo_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
--
-- 📱 Agent App Login (for any rider):
--    Company Code: RIYADH
--    Phone: +966501234567 (Ahmed), +966501234568 (Mohammed), etc.
--    PIN: 123456
--
-- 🗺️ Map: OpenStreetMap centered on Riyadh, Saudi Arabia
--    Latitude: 24.7136
--    Longitude: 46.6753
--
-- =====================================================
-- END OF MASTER SCHEMA
-- =====================================================
