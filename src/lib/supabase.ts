import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Client-side Supabase client (lazy initialization to avoid build issues)
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        _supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
    return _supabase;
}

// For backward compatibility
export const supabase = typeof window !== 'undefined'
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null as unknown as SupabaseClient;

// Server-side Supabase client with service role (for API routes)
export function createServerClient(): SupabaseClient {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Debug: Log which key is being used
    if (!serviceKey) {
        console.error('[Supabase] WARNING: SUPABASE_SERVICE_ROLE_KEY not found, falling back to anon key');
    } else {
        console.log('[Supabase] Using service role key:', serviceKey.substring(0, 30) + '...');
    }

    const keyToUse = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

    return createClient(url, keyToUse, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
