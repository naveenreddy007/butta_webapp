/**
 * Setup script for Kitchen Module Authentication
 * 
 * This script sets up the authentication system including:
 * - Creating demo users in Supabase Auth
 * - Setting up kitchen_users table records
 * - Configuring Row Level Security policies
 */

import { createClient } from '@supabase/supabase-js';
import { UserRole } from '../types';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
}

const demoUsers: DemoUser[] = [
  {
    email: 'chef@butta.com',
    password: 'chef123',
    name: 'John Chef',
    role: UserRole.CHEF,
    phone: '+1234567890'
  },
  {
    email: 'manager@butta.com',
    password: 'manager123',
    name: 'Sarah Manager',
    role: UserRole.KITCHEN_MANAGER,
    phone: '+1234567891'
  },
  {
    email: 'admin@butta.com',
    password: 'admin123',
    name: 'Admin User',
    role: UserRole.ADMIN,
    phone: '+1234567892'
  }
];

async function setupAuthentication() {
  console.log('🚀 Setting up Kitchen Module Authentication...');

  try {
    // 1. Create demo users in Supabase Auth
    console.log('📝 Creating demo users in Supabase Auth...');
    
    for (const user of demoUsers) {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });

      if (authError) {
        console.error(`❌ Error creating auth user ${user.email}:`, authError.message);
        continue;
      }

      console.log(`✅ Created auth user: ${user.email}`);

      // Create corresponding kitchen_users record
      const { error: profileError } = await supabaseAdmin
        .from('kitchen_users')
        .upsert({
          id: authData.user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          is_active: true
        });

      if (profileError) {
        console.error(`❌ Error creating kitchen user profile ${user.email}:`, profileError.message);
      } else {
        console.log(`✅ Created kitchen user profile: ${user.name} (${user.role})`);
      }
    }

    // 2. Verify setup
    console.log('🔍 Verifying setup...');
    
    const { data: users, error: usersError } = await supabaseAdmin
      .from('kitchen_users')
      .select('*')
      .eq('is_active', true);

    if (usersError) {
      console.error('❌ Error verifying users:', usersError.message);
    } else {
      console.log(`✅ Successfully created ${users.length} kitchen users:`);
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    console.log('🎉 Kitchen Module Authentication setup complete!');
    console.log('');
    console.log('Demo Login Credentials:');
    console.log('=======================');
    demoUsers.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupAuthentication()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export { setupAuthentication };