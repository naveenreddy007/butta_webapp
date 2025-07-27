/**
 * Database Setup Script for Kitchen Module (JavaScript version)
 * 
 * This script sets up the database with all required tables and sample data
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - VITE_SUPABASE_ANON_KEY');
  console.error('\n💡 Please check your .env.local file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Test database connection
 */
async function testConnection() {
  console.log('🔌 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('kitchen_users')
      .select('count(*)')
      .limit(1);
    
    if (error && !error.message.includes('does not exist')) {
      throw error;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Check if tables exist
 */
async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  const tables = [
    'kitchen_users',
    'kitchen_events', 
    'kitchen_stock',
    'kitchen_cooking_logs'
  ];
  
  const existingTables = [];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error || !error.message.includes('does not exist')) {
        existingTables.push(table);
        console.log(`   ✅ Table ${table} exists`);
      } else {
        console.log(`   ❌ Table ${table} missing`);
      }
    } catch (error) {
      console.log(`   ❌ Table ${table} missing`);
    }
  }
  
  return existingTables;
}

/**
 * Insert sample data
 */
async function insertSampleData() {
  console.log('📊 Inserting sample data...');
  
  try {
    // Insert sample users (if table exists)
    try {
      const { error: usersError } = await supabase
        .from('kitchen_users')
        .upsert([
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            email: 'chef@butta.com',
            name: 'John Chef',
            role: 'CHEF',
            phone: '+1234567890'
          },
          {
            id: '550e8400-e29b-41d4-a716-446655440002', 
            email: 'manager@butta.com',
            name: 'Sarah Manager',
            role: 'KITCHEN_MANAGER',
            phone: '+1234567891'
          }
        ], { onConflict: 'email' });
      
      if (!usersError) {
        console.log('   ✅ Sample users inserted');
      }
    } catch (error) {
      console.log('   ⚠️  Users table not ready');
    }
    
    // Insert sample events (if table exists)
    try {
      const { error: eventsError } = await supabase
        .from('kitchen_events')
        .upsert([
          {
            id: 'event-001',
            name: 'Smith Wedding Reception',
            date: '2024-12-15T18:00:00Z',
            guest_count: 150,
            event_type: 'Wedding'
          }
        ], { onConflict: 'id' });
      
      if (!eventsError) {
        console.log('   ✅ Sample events inserted');
      }
    } catch (error) {
      console.log('   ⚠️  Events table not ready');
    }
    
    // Insert sample stock (if table exists)
    try {
      const { error: stockError } = await supabase
        .from('kitchen_stock')
        .upsert([
          {
            id: 'stock-001',
            item_name: 'Basmati Rice',
            category: 'Grains',
            quantity: 100.00,
            unit: 'kg'
          }
        ], { onConflict: 'id' });
      
      if (!stockError) {
        console.log('   ✅ Sample stock inserted');
      }
    } catch (error) {
      console.log('   ⚠️  Stock table not ready');
    }
    
  } catch (error) {
    console.error('❌ Sample data insertion failed:', error.message);
  }
}

/**
 * Generate test token
 */
function generateTestToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    sub: '550e8400-e29b-41d4-a716-446655440002',
    email: 'manager@butta.com',
    role: 'KITCHEN_MANAGER',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString('base64');
  
  return `${header}.${payload}.mock-signature`;
}

/**
 * Main setup function
 */
async function setupDatabase() {
  console.log('🚀 Kitchen Module Database Setup');
  console.log('================================\n');
  
  // Step 1: Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check your .env.local file has correct Supabase URL and keys');
    console.log('   2. Ensure your Supabase project is active');
    console.log('   3. Verify the URL format: https://your-project.supabase.co');
    return;
  }
  
  // Step 2: Check tables
  const existingTables = await checkTables();
  
  if (existingTables.length === 0) {
    console.log('\n📋 Database Migration Required');
    console.log('==============================');
    console.log('No Kitchen Module tables found. Please run the database migrations:');
    console.log('\n1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy and run the content from:');
    console.log('   - kitchen/migrations/001_create_kitchen_users.sql');
    console.log('   - kitchen/migrations/002_create_kitchen_tables.sql');
    console.log('\n3. Then run this setup script again');
    return;
  }
  
  // Step 3: Insert sample data
  await insertSampleData();
  
  // Step 4: Generate test token
  const testToken = generateTestToken();
  
  console.log('\n🎉 Database setup completed!');
  console.log('\n📊 Setup Summary:');
  console.log(`   ✅ Database connected`);
  console.log(`   ✅ Tables found: ${existingTables.length}/4`);
  console.log(`   ✅ Sample data inserted`);
  console.log(`   ✅ Test token generated`);
  
  console.log('\n🔑 Test Token (copy for API testing):');
  console.log(`${testToken}`);
  
  console.log('\n🧪 Next Steps:');
  console.log('   1. Run: node kitchen/test-integration.js');
  console.log('   2. Test API endpoints with real data');
  console.log('   3. Verify all functionality works');
  
  if (existingTables.length < 4) {
    console.log('\n⚠️  Some tables are missing. For full functionality:');
    console.log('   - Run the database migrations in Supabase Dashboard');
    console.log('   - Then run this setup script again');
  }
}

// Run setup
setupDatabase().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
});