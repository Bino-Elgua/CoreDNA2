import { supabase } from './supabaseClient';
import { GlobalSettings } from '../types';

const SETTINGS_TABLE = 'user_settings';
const DEFAULT_USER_ID = 'anonymous_user'; // For unauthenticated users

/**
 * Get settings from Supabase or localStorage fallback
 */
export async function getSettings(): Promise<GlobalSettings | null> {
    try {
        // Try to get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || DEFAULT_USER_ID;

        const { data, error } = await supabase
            .from(SETTINGS_TABLE)
            .select('settings')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Table doesn't exist yet or no record found - return null
                console.log('Settings table not yet initialized');
                return null;
            }
            console.warn('Error fetching settings from Supabase:', error);
            return null;
        }

        return data?.settings || null;
    } catch (error) {
        console.error('Failed to get settings from Supabase:', error);
        // Fall back to localStorage
        try {
            const stored = localStorage.getItem('core_dna_settings');
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }
}

/**
 * Save settings to Supabase
 */
export async function saveSettings(settings: GlobalSettings): Promise<boolean> {
    try {
        // Try to get authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || DEFAULT_USER_ID;

        // Sanitize settings to avoid serialization issues
        const sanitized = JSON.parse(JSON.stringify(settings));

        // Try upsert first (insert or update)
        const { error } = await supabase
            .from(SETTINGS_TABLE)
            .upsert(
                {
                    user_id: userId,
                    settings: sanitized,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id' }
            );

        if (error) {
            // If table doesn't exist, try to create record anyway
            if (error.code === 'PGRST116') {
                console.warn('Settings table not initialized. Trying insert...');
                const { error: insertError } = await supabase
                    .from(SETTINGS_TABLE)
                    .insert({
                        user_id: userId,
                        settings: sanitized,
                        updated_at: new Date().toISOString(),
                    });
                
                if (insertError) {
                    throw insertError;
                }
                return true;
            }
            throw error;
        }

        console.log('Settings saved to Supabase');
        return true;
    } catch (error: any) {
        console.error('Failed to save settings to Supabase:', error);
        
        // Fallback: save to localStorage
        try {
            const sanitized = JSON.parse(JSON.stringify(settings));
            localStorage.setItem('core_dna_settings', JSON.stringify(sanitized));
            console.log('Settings saved to localStorage (fallback)');
            return true;
        } catch (localError) {
            console.error('Failed to save to localStorage fallback:', localError);
            throw new Error(`Failed to save settings: ${error?.message || 'Unknown error'}`);
        }
    }
}

/**
 * Delete settings from Supabase
 */
export async function deleteSettings(): Promise<boolean> {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || DEFAULT_USER_ID;

        const { error } = await supabase
            .from(SETTINGS_TABLE)
            .delete()
            .eq('user_id', userId);

        if (error) {
            console.warn('Error deleting settings:', error);
        }

        localStorage.removeItem('core_dna_settings');
        return true;
    } catch (error) {
        console.error('Failed to delete settings:', error);
        return false;
    }
}
