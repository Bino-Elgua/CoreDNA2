#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_')) {
        const [key, value] = line.split('=');
        envVars[key] = value;
    }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

const tables = [
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

console.log('📋 Database Tables Status\n');

(async () => {
    let count = 0;
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('1').limit(1);
        const exists = !error || !error.message.includes('Could not find the table');
        console.log(`${exists ? '✅' : '❌'} ${table}`);
        if (exists) count++;
    }
    console.log(`\nFound: ${count}/${tables.length} tables`);
    
    if (count < tables.length) {
        console.log('\n⏳ Still need to run migrations:');
        console.log('   See supabase/migrations/ folder');
    }
})();
