# Kitchen Module Database Setup Guide

This guide will help you set up the database for full integration testing of the Kitchen Module API.

## 🚀 Quick Setup (5 minutes)

### Step 1: Configure Environment Variables

1. **Check your `.env.local` file** has these variables:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Get your Service Role Key**:
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings > API
   - Copy the `service_role` key (not the `anon` key)
   - Add it to your `.env.local` file

### Step 2: Run Database Migrations

**Option A: Automatic Setup (Recommended)**
```bash
npm run kitchen:setup-db
```

**Option B: Manual Setup**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to SQL Editor
4. Copy and run the content from:
   - `kitchen/migrations/001_create_kitchen_users.sql`
   - `kitchen/migrations/002_create_kitchen_tables.sql`

### Step 3: Run Integration Tests

```bash
# Quick test (30 seconds)
npm run test:kitchen-integration

# Full test suite (2 minutes)
npm run test:kitchen-api
```

## 📋 Detailed Setup Instructions

### 1. Database Schema Overview

The Kitchen Module uses these tables:

| Table | Purpose | Records |
|-------|---------|---------|
| `kitchen_users` | User authentication and roles | 3 test users |
| `kitchen_events` | Event management | 3 sample events |
| `kitchen_stock` | Inventory management | 5 sample items |
| `kitchen_stock_updates` | Stock change tracking | Auto-generated |
| `kitchen_indents` | Purchase requisitions | 1 sample indent |
| `kitchen_indent_items` | Indent line items | 2 sample items |
| `kitchen_cooking_logs` | Cooking task management | 3 sample tasks |

### 2. Test Users Created

| Email | Role | Password | Purpose |
|-------|------|----------|---------|
| `chef@butta.com` | CHEF | N/A | Basic cooking operations |
| `manager@butta.com` | KITCHEN_MANAGER | N/A | Management operations |
| `admin@butta.com` | ADMIN | N/A | Full system access |

### 3. Sample Data Included

**Events:**
- Smith Wedding Reception (150 guests)
- Corporate Annual Dinner (200 guests)
- Birthday Celebration (50 guests)

**Stock Items:**
- Basmati Rice (100kg)
- Chicken Breast (50kg)
- Tomatoes (25kg)
- Onions (30kg)
- Cooking Oil (20L)

**Cooking Tasks:**
- Chicken Biryani (150 servings)
- Vegetable Curry (50 servings)
- Grilled Chicken (200 servings)

## 🧪 Testing Your Setup

### Quick Health Check
```bash
# Test database connection and basic functionality
node -e "
import('./kitchen/test-integration.js').then(m => 
  m.runQuickIntegrationTest()
)"
```

### Full API Test Suite
```bash
# Test all 21 API endpoints with real data
npm run test:kitchen-integration
```

### Individual Component Tests
```bash
# Test validation system
node kitchen/test-validation.js

# Test documentation
node kitchen/test-docs.js

# Test file structure
node kitchen/test-kitchen-api.js
```

## 🔧 Troubleshooting

### Common Issues

**1. "Missing environment variables"**
```bash
# Check your .env.local file exists and has:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**2. "Database connection failed"**
- Verify your Supabase project is active
- Check the URL and keys are correct
- Ensure your project has not been paused

**3. "Table does not exist"**
- Run the database migrations manually in Supabase SQL Editor
- Check Row Level Security policies are enabled

**4. "Authentication failed"**
- The test uses mock JWT tokens
- For production, integrate with Supabase Auth

### Getting Help

1. **Check the logs**: All test scripts provide detailed error messages
2. **Verify Supabase**: Go to your Supabase dashboard and check:
   - Project is active
   - Tables exist in the Table Editor
   - API keys are correct
3. **Run step by step**: Use the individual test scripts to isolate issues

## 🎯 What You Can Test

### ✅ With Database Setup

- **All 21 API endpoints** with real data
- **CRUD operations** (Create, Read, Update, Delete)
- **Data validation** with actual database constraints
- **Authentication** with role-based permissions
- **Stock alerts** with real inventory data
- **Cooking board** with actual tasks
- **Event management** with real events

### ⚡ Performance Testing

```bash
# Test API response times
npm run test:kitchen-integration

# Check database query performance
# (Monitor in Supabase Dashboard > Logs)
```

### 🔐 Security Testing

- JWT token validation
- Role-based access control
- Row Level Security policies
- Input sanitization
- SQL injection prevention

## 📊 Expected Test Results

### Successful Setup Should Show:
```
🧪 Kitchen Module Integration Tests
==================================

📋 Running Database Connection Tests...
   ✅ Database Connection (45ms)
   ✅ Users Table Access (32ms)
   ✅ Events Table Access (28ms)
   ✅ Stock Table Access (31ms)

📋 Running Events API Tests...
   ✅ GET /api/kitchen/events (156ms)
   ✅ GET /api/kitchen/events/:id (89ms)
   ✅ POST /api/kitchen/events (234ms)

📋 Running Stock API Tests...
   ✅ GET /api/kitchen/stock (123ms)
   ✅ GET /api/kitchen/stock/alerts (98ms)
   ✅ POST /api/kitchen/stock (187ms)

🎯 Integration Test Summary
===========================
Total Tests: 15
Passed: 15
Failed: 0
Success Rate: 100.0%

🎉 All integration tests passed!
✅ Kitchen Module API is fully functional
```

## 🚀 Next Steps After Setup

1. **Frontend Integration**: Connect React components to the API
2. **Authentication**: Integrate with Supabase Auth for real users
3. **Real-time Features**: Add live updates using Supabase subscriptions
4. **Performance Optimization**: Add caching and query optimization
5. **Production Deployment**: Deploy to staging/production environment

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Run the diagnostic scripts
3. Check Supabase dashboard for errors
4. Review the API documentation in `kitchen/api/README.md`

The Kitchen Module API is designed to be robust and well-tested. With proper database setup, you'll have a fully functional kitchen management system ready for production use!