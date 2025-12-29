export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            companies: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    password_hash: string;
                    api_key: string;
                    webhook_secret: string;
                    plan: string;
                    settings: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    email: string;
                    password_hash: string;
                    api_key: string;
                    webhook_secret: string;
                    plan?: string;
                    settings?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    email?: string;
                    password_hash?: string;
                    api_key?: string;
                    webhook_secret?: string;
                    plan?: string;
                    settings?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            riders: {
                Row: {
                    id: string;
                    company_id: string;
                    external_id: string | null;
                    name: string;
                    phone: string | null;
                    email: string | null;
                    status: string;
                    latitude: number | null;
                    longitude: number | null;
                    battery_level: number | null;
                    vehicle_type: string | null;
                    last_seen: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    external_id?: string | null;
                    name: string;
                    phone?: string | null;
                    email?: string | null;
                    status?: string;
                    latitude?: number | null;
                    longitude?: number | null;
                    battery_level?: number | null;
                    vehicle_type?: string | null;
                    last_seen?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    external_id?: string | null;
                    name?: string;
                    phone?: string | null;
                    email?: string | null;
                    status?: string;
                    latitude?: number | null;
                    longitude?: number | null;
                    battery_level?: number | null;
                    vehicle_type?: string | null;
                    last_seen?: string | null;
                    created_at?: string;
                };
            };
            customers: {
                Row: {
                    id: string;
                    company_id: string;
                    external_id: string | null;
                    name: string;
                    phone: string | null;
                    email: string | null;
                    addresses: Json;
                    total_orders: number;
                    total_spent: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    external_id?: string | null;
                    name: string;
                    phone?: string | null;
                    email?: string | null;
                    addresses?: Json;
                    total_orders?: number;
                    total_spent?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    external_id?: string | null;
                    name?: string;
                    phone?: string | null;
                    email?: string | null;
                    addresses?: Json;
                    total_orders?: number;
                    total_spent?: number;
                    created_at?: string;
                };
            };
            products: {
                Row: {
                    id: string;
                    company_id: string;
                    sku: string | null;
                    name: string;
                    description: string | null;
                    price: number | null;
                    stock_quantity: number;
                    low_stock_threshold: number;
                    category: string | null;
                    image_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    sku?: string | null;
                    name: string;
                    description?: string | null;
                    price?: number | null;
                    stock_quantity?: number;
                    low_stock_threshold?: number;
                    category?: string | null;
                    image_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    sku?: string | null;
                    name?: string;
                    description?: string | null;
                    price?: number | null;
                    stock_quantity?: number;
                    low_stock_threshold?: number;
                    category?: string | null;
                    image_url?: string | null;
                    created_at?: string;
                };
            };
            orders: {
                Row: {
                    id: string;
                    company_id: string;
                    external_id: string | null;
                    customer_id: string | null;
                    rider_id: string | null;
                    status: string;
                    pickup_address: string | null;
                    delivery_address: string;
                    items: Json;
                    subtotal: number | null;
                    delivery_fee: number | null;
                    total: number | null;
                    payment_method: string | null;
                    payment_status: string;
                    notes: string | null;
                    scheduled_at: string | null;
                    picked_up_at: string | null;
                    delivered_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    external_id?: string | null;
                    customer_id?: string | null;
                    rider_id?: string | null;
                    status?: string;
                    pickup_address?: string | null;
                    delivery_address: string;
                    items?: Json;
                    subtotal?: number | null;
                    delivery_fee?: number | null;
                    total?: number | null;
                    payment_method?: string | null;
                    payment_status?: string;
                    notes?: string | null;
                    scheduled_at?: string | null;
                    picked_up_at?: string | null;
                    delivered_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    external_id?: string | null;
                    customer_id?: string | null;
                    rider_id?: string | null;
                    status?: string;
                    pickup_address?: string | null;
                    delivery_address?: string;
                    items?: Json;
                    subtotal?: number | null;
                    delivery_fee?: number | null;
                    total?: number | null;
                    payment_method?: string | null;
                    payment_status?: string;
                    notes?: string | null;
                    scheduled_at?: string | null;
                    picked_up_at?: string | null;
                    delivered_at?: string | null;
                    created_at?: string;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    company_id: string;
                    order_id: string | null;
                    type: string;
                    amount: number;
                    status: string;
                    payment_method: string | null;
                    rider_id: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    company_id: string;
                    order_id?: string | null;
                    type: string;
                    amount: number;
                    status: string;
                    payment_method?: string | null;
                    rider_id?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    company_id?: string;
                    order_id?: string | null;
                    type?: string;
                    amount?: number;
                    status?: string;
                    payment_method?: string | null;
                    rider_id?: string | null;
                    created_at?: string;
                };
            };
            location_history: {
                Row: {
                    id: string;
                    rider_id: string;
                    latitude: number;
                    longitude: number;
                    speed: number | null;
                    heading: number | null;
                    recorded_at: string;
                };
                Insert: {
                    id?: string;
                    rider_id: string;
                    latitude: number;
                    longitude: number;
                    speed?: number | null;
                    heading?: number | null;
                    recorded_at?: string;
                };
                Update: {
                    id?: string;
                    rider_id?: string;
                    latitude?: number;
                    longitude?: number;
                    speed?: number | null;
                    heading?: number | null;
                    recorded_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {};
    };
}

// Helper types
export type Company = Database['public']['Tables']['companies']['Row'];
export type Rider = Database['public']['Tables']['riders']['Row'];
export type Customer = Database['public']['Tables']['customers']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
