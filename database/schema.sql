-- =====================================================
-- B2B Fleet Management SaaS - Optimized Database Schema
-- Run this in your Supabase SQL Editor
-- Optimized for Supabase Free Tier (500MB RAM)
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
    plan VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes: API key lookup is most critical (every API call)
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_api_key ON companies(api_key);
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_email ON companies(email);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active) WHERE is_active = true;

-- =====================================================
-- RIDERS TABLE (Delivery Agents)
-- =====================================================
CREATE TABLE IF NOT EXISTS riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'active', 'busy', 'break')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    battery_level SMALLINT CHECK (battery_level >= 0 AND battery_level <= 100),
    vehicle_type VARCHAR(50),
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Composite index for multi-tenant queries (company_id first!)
CREATE INDEX IF NOT EXISTS idx_riders_company_status ON riders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_riders_company_id ON riders(company_id);
-- Partial index for active riders only (saves RAM)
CREATE INDEX IF NOT EXISTS idx_riders_active ON riders(company_id, last_seen) 
    WHERE status IN ('active', 'busy');
-- External ID lookup for webhook integrations
CREATE INDEX IF NOT EXISTS idx_riders_external ON riders(company_id, external_id) 
    WHERE external_id IS NOT NULL;

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    addresses JSONB DEFAULT '[]',
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Composite indexes for tenant-scoped queries
CREATE INDEX IF NOT EXISTS idx_customers_company_id ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_company_phone ON customers(company_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_company_email ON customers(company_id, email) WHERE email IS NOT NULL;

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

-- Composite indexes
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_company_sku ON products(company_id, sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_company_category ON products(company_id, category) WHERE category IS NOT NULL;
-- Low stock alert query optimization
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(company_id, stock_quantity) 
    WHERE stock_quantity <= low_stock_threshold AND is_active = true;

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    external_id VARCHAR(255),
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

-- Critical composite indexes for order queries
CREATE INDEX IF NOT EXISTS idx_orders_company_id ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_company_status ON orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_company_created ON orders(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_rider ON orders(rider_id) WHERE rider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id) WHERE customer_id IS NOT NULL;
-- Pending orders (for assignment dashboard)
CREATE INDEX IF NOT EXISTS idx_orders_pending ON orders(company_id, created_at) 
    WHERE status = 'pending';
-- Active orders (currently being delivered)
CREATE INDEX IF NOT EXISTS idx_orders_active ON orders(company_id, rider_id) 
    WHERE status IN ('assigned', 'picked_up', 'in_transit');
-- External ID for webhook sync
CREATE INDEX IF NOT EXISTS idx_orders_external ON orders(company_id, external_id) 
    WHERE external_id IS NOT NULL;

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

CREATE INDEX IF NOT EXISTS idx_transactions_company ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_created ON transactions(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON transactions(order_id) WHERE order_id IS NOT NULL;

-- =====================================================
-- LOCATION HISTORY TABLE (Optimized for high volume)
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

-- Composite index for efficient time-range queries
CREATE INDEX IF NOT EXISTS idx_location_rider_time ON location_history(rider_id, recorded_at DESC);

-- =====================================================
-- AUTOMATIC CLEANUP FOR LOCATION HISTORY
-- Keeps only last 7 days to save storage/RAM
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_locations()
RETURNS void AS $$
BEGIN
    DELETE FROM location_history 
    WHERE recorded_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run daily via Supabase Edge Function or pg_cron
-- If you have pg_cron enabled:
-- SELECT cron.schedule('cleanup-locations', '0 3 * * *', 'SELECT cleanup_old_locations()');

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Multi-tenancy
-- =====================================================

-- Enable RLS on all tenant tables
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies (using service role bypasses RLS, so API works)
-- These are for direct Supabase client access if needed

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment customer stats (atomic operation)
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

-- Function to update timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for companies updated_at
DROP TRIGGER IF EXISTS companies_updated_at ON companies;
CREATE TRIGGER companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- ANALYTICS HELPER VIEWS (Faster dashboard queries)
-- =====================================================

-- Daily order stats per company
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

-- Active riders view
CREATE OR REPLACE VIEW active_riders AS
SELECT 
    id, company_id, name, phone, status, 
    latitude, longitude, battery_level, last_seen
FROM riders
WHERE status IN ('active', 'busy')
  AND last_seen >= NOW() - INTERVAL '10 minutes';

-- =====================================================
-- PERFORMANCE SETTINGS (Run as superuser if needed)
-- =====================================================
-- These are recommendations for Supabase free tier

-- Analyze tables for query planner
ANALYZE companies;
ANALYZE riders;
ANALYZE customers;
ANALYZE products;
ANALYZE orders;
ANALYZE transactions;
ANALYZE location_history;

-- =====================================================
-- ENABLE REALTIME (Manual step in Supabase Dashboard)
-- =====================================================
-- Go to Database > Replication
-- Enable replication for: riders, orders

-- =====================================================
-- END OF OPTIMIZED SCHEMA
-- =====================================================

-- To verify indexes after running:
-- SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
