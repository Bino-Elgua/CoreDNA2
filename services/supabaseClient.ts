import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Initialize Supabase and ensure tables exist
 */
export async function initializeSupabase() {
    try {
        // Test connection
        const { data, error } = await supabase.auth.getSession();
        if (error && error.code !== 'PGRST116') {
            console.warn('Supabase connection warning:', error.message);
        }
        console.log('Supabase client initialized');
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        throw error;
    }
}
