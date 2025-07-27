# Supabase Setup Guide for Kitchen Module

## 🚀 Quick Setup Steps

### 1. Get Your Database Password

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `kbonzhebgmehulkdkyas`
3. Navigate to **Settings** → **Database**
4. Scroll down to **Connection string**
5. Copy the password from the connection string
6. Replace `YOUR_DATABASE_PASSWORD` in your `.env.local` file

### 2. Get Your Service Role Key

1. In your Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Find the **Service Role Key** (secret key)
4. Copy the key
5. Replace `your_service_role_key_here` in your `.env.local` file

### 3. Update Your .env.local File

Your `.env.local` file should look like this after updates:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kbonzhebgmehulkdkyas.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtib256aGViZ21laHVsa2RreWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODY1MjQsImV4cCI6MjA2OTE2MjUyNH0.7yYNyj8i6B0ZZ5C17VsA4SinMUjaOnADPA_T_qBWh-c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE

# Database URLs (replace YOUR_ACTUAL_PASSWORD)
DATABASE_URL="postgresql://postgres.kbonzhebgmehulkdkyas:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.kbonzhebgmehulkdkyas:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

## 🗄️ Database Setup

### Step 1: Run the Kitchen Users Migration

1. Open Supabase Dashboard → **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `kitchen/migrations/001_create_kitchen_users.sql`
4. Run the query

### Step 2: Verify Tables Created

Check that these tables were created:
- `kitchen_users`

### Step 3: Set Up Demo Users

Run the setup script to create demo users:

```bash
cd event-menu-planner
npm install
npx ts-node kitchen/scripts/setup-auth.ts
```

## 🔧 Prisma Configuration

### Update Prisma Schema

The Prisma schema is already configured in `kitchen/schema.prisma`. To sync it with your database:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (if needed)
npx prisma db push

# View your database
npx prisma studio
```

## ✅ Verification Steps

### 1. Test Supabase Connection

Create a simple test file to verify connection:

```javascript
// test-supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kbonzhebgmehulkdkyas.supabase.co';
const supabaseKey = 'your_anon_key_here';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('kitchen_users').select('count');
    if (error) {
      console.error('❌ Connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful!');
    }
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
}

testConnection();
```

### 2. Test Authentication

Try logging in with demo credentials:
- **Chef**: chef@butta.com / chef123
- **Manager**: manager@butta.com / manager123
- **Admin**: admin@butta.com / admin123

### 3. Check Database Tables

In Supabase Dashboard → **Table Editor**, verify:
- `kitchen_users` table exists
- Demo users are created
- RLS policies are active

## 🔒 Security Checklist

- [ ] Service role key is kept secret (never commit to git)
- [ ] Database password is secure
- [ ] RLS policies are enabled
- [ ] Demo passwords will be changed in production

## 🐛 Troubleshooting

### Common Issues

**Connection Refused**
- Check if your IP is whitelisted in Supabase
- Verify database password is correct

**Authentication Errors**
- Ensure service role key is correct
- Check if RLS policies are properly configured

**Migration Errors**
- Make sure you have the correct permissions
- Try running migrations one by one

### Debug Mode

Enable debug mode in `.env.local`:
```env
NEXT_PUBLIC_DEBUG_AUTH=true
```

This will show detailed authentication logs in the browser console.

## 📞 Need Help?

If you encounter issues:

1. Check the Supabase Dashboard logs
2. Enable debug mode
3. Verify all environment variables are set
4. Check the browser console for errors

## 🚀 Next Steps

After setup is complete:

1. Test the Kitchen Module login
2. Verify role-based access works
3. Test real-time features
4. Set up production environment variables
5. Configure email notifications (optional)

---

**Important**: Keep your `.env.local` file secure and never commit it to version control!