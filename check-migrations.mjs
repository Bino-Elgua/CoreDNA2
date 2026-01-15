#!/usr/bin/env node

/**
 * Check which migrations have been run
 * Run with: node check-migrations.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
const supabase = createClient(url, key);

const tablesToCheck = [
    'user_settings',
    'portfolios',
    'campaigns',
    'portfolio_leads',
    'portfolio_assets',
    'portfolio_notes',
    'activity_log',
    'offline_queue',
    'teams'
];

console.log('📋 Checking Supabase Tables...\n');

(async () => {
    const results = {};

    for (const table of tablesToCheck) {
        try {
            const { error } = await supabase
                .from(table)
                .select('count', { count: 'exact' })
                .limit(0);

            if (error && error.code === 'PGRST116') {
                results[table] = '❌ NOT FOUND';
            } else if (error) {
                results[table] = `⚠️  ${error.message}`;
            } else {
                results[table] = '✅ EXISTS';
            }
        } catch (e) {
            results[table] = `❌ ${e.message}`;
        }
    }

    console.log('Migration Status:');
    console.log('═'.repeat(50));
    
    let completed = 0;
    let missing = 0;

    for (const [table, status] of Object.entries(results)) {
        console.log(`${status} ${table}`);
        if (status.includes('✅')) completed++;
        if (status.includes('❌')) missing++;
    }

    console.log('═'.repeat(50));
    console.log(`\nTotal: ${completed} tables exist, ${missing} missing\n`);

    if (missing > 0) {
        console.log('📝 To run migrations:');
        console.log('1. Go to Supabase Dashboard > SQL Editor');
        console.log('2. For each file in supabase/migrations/:');
        console.log('   - Copy entire SQL file');
        console.log('   - Paste in SQL Editor');
        console.log('   - Click RUN');
        console.log('\nFiles to run:');
        console.log('  • 001_create_settings_table.sql');
        console.log('  • 002_create_portfolios_table.sql');
        console.log('  • 003_create_campaigns_and_assets.sql');
        console.log('  • 004_add_tier_system.sql');
        console.log('  • 005_create_notes_and_activity.sql');
        console.log('\nThen run this script again to verify.');
    } else {
        console.log('🎉 All migrations completed! Ready to use.');
    }
})();
