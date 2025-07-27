# 🍳 Kitchen Module Setup Guide

## 📋 Prerequisites

You have provided your Supabase details:
- **Project URL**: `https://kbonzhebgmehulkdkyas.supabase.co`
- **Anon Key**: Already configured ✅

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies

```bash
cd event-menu-planner
npm install
```

This will install all required packages including:
- `@supabase/supabase-js` - Supabase client
- `@prisma/client` - Database ORM
- `react-router-dom` - Routing
- Additional UI components

### Step 2: Get Missing Environment Variables

#### 2.1 Get Your Database Password

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `kbonzhebgmehulkdkyas`
3. Navigate to **Settings** → **Database**
4. Scroll down to **Connection string**
5. Copy the password from the connection string
6. Update your `.env.local` file:

```env
# Replace YOUR_DATABASE_PASSWORD with your actual password
DATABASE_URL="postgresql://postgres.kbonzhebgmehulkdkyas:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.kbonzhebgmehulkdkyas:YOUR_ACTUAL_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

#### 2.2 Get Your Service Role Key

1. In Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Find the **Service Role Key** (secret key)
4. Copy the key
5. Update your `.env.local` file:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
```

### Step 3: Set Up Database

#### 3.1 Run Database Migration

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `kitchen/migrations/001_create_kitchen_users.sql`
4. Click **Run** to execute the migration

This will create:
- `kitchen_users` table
- Row Level Security policies
- Demo user records
- Necessary indexes

#### 3.2 Generate Prisma Client

```bash
npm run db:generate
```

#### 3.3 Push Schema to Database (Optional)

```bash
npm run db:push
```

### Step 4: Create Demo Users

Run the authentication setup script:

```bash
npm run kitchen:setup
```

This creates three demo users:
- **Chef**: chef@butta.com / chef123
- **Manager**: manager@butta.com / manager123
- **Admin**: admin@butta.com / admin123

### Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 6: Test Kitchen Module

1. Navigate to `http://localhost:5173/kitchen`
2. You should be redirected to the login page
3. Try logging in with demo credentials:
   - Email: `chef@butta.com`
   - Password: `chef123`

## 🔧 Your Current Configuration

Based on your Supabase details, here's your configuration:

```env
# ✅ Already configured
VITE_SUPABASE_URL=https://kbonzhebgmehulkdkyas.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtib256aGViZ21laHVsa2RreWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODY1MjQsImV4cCI6MjA2OTE2MjUyNH0.7yYNyj8i6B0ZZ5C17VsA4SinMUjaOnADPA_T_qBWh-c

# ❌ Need to get these from Supabase Dashboard
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL="postgresql://postgres.kbonzhebgmehulkdkyas:YOUR_DATABASE_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.kbonzhebgmehulkdkyas:YOUR_DATABASE_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

## 🎯 Quick Test Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Database password updated in `.env.local`
- [ ] Service role key updated in `.env.local`
- [ ] Database migration executed in Supabase
- [ ] Prisma client generated (`npm run db:generate`)
- [ ] Demo users created (`npm run kitchen:setup`)
- [ ] Development server started (`npm run dev`)
- [ ] Kitchen login page accessible at `/kitchen`
- [ ] Can log in with demo credentials

## 🐛 Troubleshooting

### Common Issues

**"Connection refused" error**
- Check if your IP is whitelisted in Supabase
- Verify database password is correct

**"Invalid API key" error**
- Ensure service role key is correct
- Check if key has proper permissions

**"Table doesn't exist" error**
- Make sure you ran the database migration
- Check if tables were created in Supabase Dashboard

**Login fails**
- Verify demo users were created
- Check browser console for errors
- Enable debug mode: `VITE_DEBUG_AUTH=true`

### Debug Commands

```bash
# View database in browser
npm run db:studio

# Check Prisma schema
npx prisma validate --schema=./kitchen/schema.prisma

# Reset and recreate database (careful!)
npx prisma db push --force-reset --schema=./kitchen/schema.prisma
```

## 📱 Kitchen Module Features

Once set up, you'll have access to:

### 🔐 Authentication System
- Role-based login (Chef, Manager, Admin)
- Secure session management
- Route protection

### 📊 Dashboard
- Today's events overview
- Active cooking tasks
- Stock alerts
- Quick actions

### 📝 Indent Management
- Auto-calculate quantities
- Stock availability checking
- Manual adjustments

### 👨‍🍳 Cooking Board
- Kanban-style task tracking
- Real-time status updates
- Chef assignments

### 📦 Stock Management
- Inventory tracking
- Low stock alerts
- Expiry monitoring

## 🚀 Next Steps

After successful setup:

1. **Customize Demo Data**: Update demo users and test data
2. **Configure Real-time**: Test real-time features
3. **Set Up Production**: Configure production environment
4. **Add More Features**: Implement additional kitchen workflows

## 📞 Need Help?

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Check Supabase Dashboard logs
4. Enable debug mode for detailed logging

---

**Ready to cook? 🍳 Let's get your Kitchen Module running!**