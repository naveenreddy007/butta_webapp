#!/usr/bin/env node

/**
 * Kitchen Module Setup Verification Script
 * 
 * This script helps verify that your environment is properly configured
 * for the Kitchen Module to work correctly.
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 Kitchen Module Setup Verification');
console.log('=====================================\n');

// Check environment variables
console.log('📋 Checking Environment Variables...');

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'DIRECT_URL'
];

let envCheckPassed = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value && value !== 'your_service_role_key_here' && !value.includes('YOUR_DATABASE_PASSWORD')) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing or placeholder`);
    envCheckPassed = false;
  }
});

if (!envCheckPassed) {
  console.log('\n❌ Environment variables check failed!');
  console.log('Please update your .env.local file with actual values.');
  console.log('See KITCHEN_SETUP_GUIDE.md for instructions.\n');
  process.exit(1);
}

console.log('\n✅ Environment variables check passed!\n');

// Test Supabase connection
console.log('🔌 Testing Supabase Connection...');

try {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test basic connection
  const { data, error } = await supabase.from('kitchen_users').select('count');
  
  if (error) {
    console.log(`❌ Supabase connection failed: ${error.message}`);
    console.log('Make sure you ran the database migration in Supabase Dashboard.\n');
    process.exit(1);
  } else {
    console.log('✅ Supabase connection successful!');
  }
} catch (err) {
  console.log(`❌ Supabase connection error: ${err.message}\n`);
  process.exit(1);
}

// Check if demo users exist
console.log('\n👥 Checking Demo Users...');

try {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  const { data: users, error } = await supabaseAdmin
    .from('kitchen_users')
    .select('email, name, role')
    .eq('is_active', true);
  
  if (error) {
    console.log(`❌ Error checking users: ${error.message}`);
  } else if (users.length === 0) {
    console.log('❌ No demo users found');
    console.log('Run: npm run kitchen:setup');
  } else {
    console.log(`✅ Found ${users.length} demo users:`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
    });
  }
} catch (err) {
  console.log(`❌ Error checking demo users: ${err.message}`);
}

// Check package.json dependencies
console.log('\n📦 Checking Dependencies...');

try {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@supabase/supabase-js',
    '@prisma/client',
    'react-router-dom'
  ];
  
  let depsCheckPassed = true;
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ ${dep}: Missing`);
      depsCheckPassed = false;
    }
  });
  
  if (!depsCheckPassed) {
    console.log('\n❌ Some dependencies are missing. Run: npm install');
  } else {
    console.log('\n✅ All required dependencies are installed!');
  }
} catch (err) {
  console.log(`❌ Error checking dependencies: ${err.message}`);
}

console.log('\n🎉 Setup Verification Complete!');
console.log('\nNext steps:');
console.log('1. Run: npm run dev');
console.log('2. Navigate to: http://localhost:5173/kitchen');
console.log('3. Login with: chef@butta.com / chef123');
console.log('\nHappy cooking! 🍳');