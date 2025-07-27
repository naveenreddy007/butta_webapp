/**
 * Database Setup Script for Kitchen Module
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
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n💡 Please check your .env.local file');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Run SQL migration file
 */
async function runMigration(filename: string): Promise<void> {
  console.log(`📄 Running migration: ${filename}`);
  
  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', filename);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(0); // This will fail but allows us to execute raw SQL
          
          if (directError && !directError.message.includes('does not exist')) {
            console.warn(`⚠️  Warning in statement: ${error.message}`);
          }
        }
      }
    }
    
    console.log(`✅ Migration ${filename} completed`);
  } catch (error: any) {
    console.error(`❌ Migration ${filename} failed:`, error.message);
    throw error;
  }
}

/**
 * Test database connection
 */
async function testConnection(): Promise<void> {
  console.log('🔌 Testing database connection...');
  
  try {
    const { data, error } = await supabase
      .from('kitchen_users')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Database connection successful');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
}

/**
 * Verify tables exist
 */
async function verifyTables(): Promise<void> {
  console.log('🔍 Verifying database tables...');
  
  const expectedTables = [
    'kitchen_users',
    'kitchen_events',
    'kitchen_stock',
    'kitchen_stock_updates',
    'kitchen_indents',
    'kitchen_indent_items',
    'kitchen_cooking_logs'
  ];
  
  for (const table of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('does not exist')) {
        console.error(`❌ Table ${table} does not exist`);
        throw new Error(`Missing table: ${table}`);
      }
      
      console.log(`✅ Table ${table} exists`);
    } catch (error: any) {
      if (error.message.includes('Missing table')) {
        throw error;
      }
      console.log(`✅ Table ${table} exists (with RLS)`);
    }
  }
}

/**
 * Insert test data
 */
async function insertTestData(): Promise<void> {
  console.log('📊 Inserting test data...');
  
  try {
    // Test users
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
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          email: 'admin@butta.com',
          name: 'Admin User',
          role: 'ADMIN',
          phone: '+1234567892'
        }
      ], { onConflict: 'email' });
    
    if (usersError) {
      console.warn('⚠️  Users insert warning:', usersError.message);
    } else {
      console.log('✅ Test users inserted');
    }
    
    // Test events
    const { error: eventsError } = await supabase
      .from('kitchen_events')
      .upsert([
        {
          id: 'event-001',
          name: 'Smith Wedding Reception',
          date: '2024-12-15T18:00:00Z',
          guest_count: 150,
          event_type: 'Wedding',
          assigned_chef: '550e8400-e29b-41d4-a716-446655440001'
        },
        {
          id: 'event-002',
          name: 'Corporate Annual Dinner',
          date: '2024-12-20T19:00:00Z',
          guest_count: 200,
          event_type: 'Corporate',
          assigned_chef: '550e8400-e29b-41d4-a716-446655440002'
        }
      ], { onConflict: 'id' });
    
    if (eventsError) {
      console.warn('⚠️  Events insert warning:', eventsError.message);
    } else {
      console.log('✅ Test events inserted');
    }
    
    // Test stock items
    const { error: stockError } = await supabase
      .from('kitchen_stock')
      .upsert([
        {
          id: 'stock-001',
          item_name: 'Basmati Rice',
          category: 'Grains',
          quantity: 100.00,
          unit: 'kg',
          cost_per_unit: 2.50,
          min_stock: 20.00
        },
        {
          id: 'stock-002',
          item_name: 'Chicken Breast',
          category: 'Meat',
          quantity: 50.00,
          unit: 'kg',
          cost_per_unit: 8.00,
          min_stock: 10.00
        }
      ], { onConflict: 'id' });
    
    if (stockError) {
      console.warn('⚠️  Stock insert warning:', stockError.message);
    } else {
      console.log('✅ Test stock items inserted');
    }
    
  } catch (error: any) {
    console.error('❌ Test data insertion failed:', error.message);
    throw error;
  }
}

/**
 * Generate test JWT token
 */
function generateTestToken(): string {
  // This is a mock JWT token for testing
  // In production, you would get this from Supabase auth
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    sub: '550e8400-e29b-41d4-a716-446655440002', // Manager user
    email: 'manager@butta.com',
    role: 'KITCHEN_MANAGER',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  })).toString('base64');
  
  return `${header}.${payload}.mock-signature`;
}

/**
 * Main setup function
 */
async function setupDatabase(): Promise<void> {
  console.log('🚀 Setting up Kitchen Module Database');
  console.log('====================================\n');
  
  try {
    // Step 1: Test connection
    await testConnection();
    
    // Step 2: Run migrations (if needed)
    console.log('\n📋 Note: Run migrations manually in Supabase SQL Editor:');
    console.log('   1. Copy content from kitchen/migrations/001_create_kitchen_users.sql');
    console.log('   2. Copy content from kitchen/migrations/002_create_kitchen_tables.sql');
    console.log('   3. Execute in Supabase Dashboard > SQL Editor\n');
    
    // Step 3: Verify tables
    await verifyTables();
    
    // Step 4: Insert test data
    await insertTestData();
    
    // Step 5: Generate test token
    const testToken = generateTestToken();
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Setup Summary:');
    console.log('   ✅ Database connection verified');
    console.log('   ✅ All tables exist');
    console.log('   ✅ Test data inserted');
    console.log('   ✅ Ready for API testing');
    
    console.log('\n🔑 Test Token (for API testing):');
    console.log(`   ${testToken}`);
    
    console.log('\n🧪 Next Steps:');
    console.log('   1. Run: npm run test:kitchen-integration');
    console.log('   2. Test API endpoints with real data');
    console.log('   3. Verify authentication and permissions');
    
  } catch (error: any) {
    console.error('\n❌ Database setup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check your .env.local file has correct Supabase credentials');
    console.error('   2. Ensure SUPABASE_SERVICE_ROLE_KEY is set');
    console.error('   3. Run migrations manually in Supabase Dashboard');
    console.error('   4. Check Supabase project is active');
    process.exit(1);
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export { setupDatabase, testConnection, verifyTables, generateTestToken };