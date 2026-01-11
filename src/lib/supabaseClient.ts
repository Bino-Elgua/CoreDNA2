import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to call edge functions
export async function callEdgeFunction<T>(
  functionName: string,
  payload: any
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    throw new Error(`Edge function error: ${error.message}`);
  }

  return data as T;
}
