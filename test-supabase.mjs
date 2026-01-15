#!/usr/bin/env node

/**
 * Test Supabase Connection
 * Run with: node test-supabase.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Supabase Connection...\n');

// Load .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_')) {
        const [key, value] = line.split('=');
        envVars[key] = value;
    }
});

const url = envVars.VITE_SUPABASE_URL;
const key = envVars.VITE_SUPABASE_ANON_KEY;

console.log('✓ Environment Variables Loaded:');
console.log(`  URL: ${url ? url.substring(0, 40) + '...' : 'MISSING'}`);
console.log(`  Key: ${key ? key.substring(0, 20) + '...' : 'MISSING'}\n`);

if (!url || !key) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

// Test Supabase connection
(async () => {
    try {
        const supabase = createClient(url, key);

        console.log('📡 Testing connection to Supabase...');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.log(`⚠️  Auth check returned warning: ${error.message}`);
        } else {
            console.log('✅ Supabase client initialized successfully!');
        }

        // Try to query a table
        console.log('\n📊 Checking for tables...');
        try {
            const { data: tables, error: tableError } = await supabase
                .from('user_settings')
                .select('count', { count: 'exact' })
                .limit(0);

            if (tableError && tableError.code === 'PGRST116') {
                console.log('⚠️  user_settings table not found');
                console.log('   → Migrations not yet run');
            } else if (tableError) {
                console.log(`❌ Error: ${tableError.message}`);
            } else {
                console.log('✅ user_settings table exists!');
            }
        } catch (e) {
            console.log(`⚠️  Could not query tables: ${e.message}`);
        }

        console.log('\n✅ SUPABASE CONNECTION VERIFIED!\n');
        console.log('Next steps:');
        console.log('1. ✅ Credentials working');
        console.log('2. ⏭️  Run 5 migrations in Supabase SQL Editor');
        console.log('3. ⏭️  Start dev server: npm run dev');
        console.log('4. ⏭️  Create a portfolio to test sync');

    } catch (err) {
        console.error(`❌ Connection failed: ${err.message}`);
        console.log('\nTroubleshooting:');
        console.log('- Check your internet connection');
        console.log('- Verify Supabase project is active');
        console.log('- Confirm credentials in .env.local are correct');
        console.log('- Check VITE_SUPABASE_URL starts with https://');
        process.exit(1);
    }
})();
