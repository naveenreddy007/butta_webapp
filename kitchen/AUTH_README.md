# Kitchen Module Authentication System

## Overview

The Kitchen Module uses Supabase Auth for authentication with role-based access control. The system supports three user roles with different permission levels:

- **Chef**: Basic access to assigned cooking tasks and inventory viewing
- **Kitchen Manager**: Full kitchen operations including indent creation and stock management
- **Admin**: Complete system access including user management and configuration

## Architecture

### Components

1. **AuthProvider** (`hooks/useAuth.ts`): React context provider for authentication state
2. **ProtectedRoute** (`components/auth/ProtectedRoute.tsx`): Route protection component
3. **LoginForm** (`components/auth/LoginForm.tsx`): User login interface
4. **UserProfile** (`components/auth/UserProfile.tsx`): User profile dropdown
5. **AuthService** (`services/auth.service.ts`): Database operations for user management

### Database Schema

The `kitchen_users` table stores user profiles with the following structure:

```sql
CREATE TABLE kitchen_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'CHEF' CHECK (role IN ('CHEF', 'KITCHEN_MANAGER', 'ADMIN')),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)

The system implements RLS policies to ensure data security:

- Users can read their own profile
- Kitchen Managers and Admins can read all profiles
- Only Admins can create new users
- Users can update their own profile (except role changes)
- Only Admins can delete users

## Setup Instructions

### 1. Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Migration

Run the database migration to create the `kitchen_users` table:

```sql
-- Execute the contents of kitchen/migrations/001_create_kitchen_users.sql
```

### 3. Demo Users Setup

Run the setup script to create demo users:

```bash
# From the kitchen directory
npx ts-node scripts/setup-auth.ts
```

This creates three demo users:

| Role | Email | Password |
|------|-------|----------|
| Chef | chef@butta.com | chef123 |
| Kitchen Manager | manager@butta.com | manager123 |
| Admin | admin@butta.com | admin123 |

## Usage

### Basic Authentication Flow

1. **Login**: Users access `/kitchen/login` to authenticate
2. **Route Protection**: All kitchen routes are protected by `ProtectedRoute`
3. **Role-based Access**: Navigation and features are filtered by user role
4. **Session Management**: Authentication state is managed by `AuthProvider`

### Using the Auth Hook

```typescript
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, kitchenUser, loading, signIn, signOut, hasPermission } = useAuth();
  
  // Check if user has specific permission
  if (hasPermission(UserRole.KITCHEN_MANAGER)) {
    // Show manager-only features
  }
  
  return (
    <div>
      {kitchenUser && <p>Welcome, {kitchenUser.name}!</p>}
    </div>
  );
}
```

### Protecting Routes

```typescript
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserRole } from './types';

function AdminPage() {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <div>Admin-only content</div>
    </ProtectedRoute>
  );
}
```

### Role-based Navigation

The layout automatically filters navigation items based on user permissions:

```typescript
const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/kitchen', 
    icon: Home, 
    roles: [UserRole.CHEF, UserRole.KITCHEN_MANAGER, UserRole.ADMIN] 
  },
  { 
    name: 'Indents', 
    href: '/kitchen/indents', 
    icon: ClipboardList, 
    roles: [UserRole.KITCHEN_MANAGER, UserRole.ADMIN] 
  },
  // ... more items
];
```

## User Management

### Creating New Users (Admin Only)

```typescript
import { AuthService } from './services/auth.service';

const createUser = async () => {
  const { data, error } = await AuthService.createUser({
    email: 'newuser@butta.com',
    name: 'New User',
    role: UserRole.CHEF,
    phone: '+1234567890'
  });
  
  if (error) {
    console.error('Error creating user:', error);
  } else {
    console.log('User created:', data);
  }
};
```

### Updating User Profile

```typescript
const updateProfile = async (userId: string) => {
  const { data, error } = await AuthService.updateUserProfile(userId, {
    name: 'Updated Name',
    phone: '+0987654321'
  });
  
  if (error) {
    console.error('Error updating profile:', error);
  } else {
    console.log('Profile updated:', data);
  }
};
```

### Getting Users by Role

```typescript
const getChefs = async () => {
  const chefs = await AuthService.getUsersByRole(UserRole.CHEF);
  console.log('All chefs:', chefs);
};
```

## Security Considerations

1. **Password Policies**: Implement strong password requirements in production
2. **Session Management**: Sessions automatically expire based on Supabase settings
3. **Role Validation**: Always validate permissions on both client and server side
4. **Data Access**: RLS policies ensure users can only access appropriate data
5. **Audit Logging**: Consider implementing audit logs for sensitive operations

## Troubleshooting

### Common Issues

1. **Login Fails**: Check if user exists in both `auth.users` and `kitchen_users` tables
2. **Permission Denied**: Verify RLS policies are correctly configured
3. **Profile Not Found**: Ensure `kitchen_users` record exists for authenticated user
4. **Role Changes**: Only admins can modify user roles

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_DEBUG_AUTH=true
```

This will log authentication events to the browser console.

## Testing

### Unit Tests

Test authentication components and hooks:

```bash
npm test -- --testPathPattern=auth
```

### Integration Tests

Test complete authentication flows:

```bash
npm run test:integration -- --grep="authentication"
```

### Manual Testing

1. Test login with each demo user
2. Verify role-based navigation
3. Test permission checks
4. Verify logout functionality
5. Test protected route access

## Production Deployment

### Security Checklist

- [ ] Change all demo user passwords
- [ ] Enable email confirmation
- [ ] Configure password policies
- [ ] Set up proper CORS policies
- [ ] Enable audit logging
- [ ] Configure session timeouts
- [ ] Set up monitoring and alerts

### Environment Setup

1. Create production Supabase project
2. Run database migrations
3. Configure environment variables
4. Set up user accounts
5. Test authentication flow
6. Monitor for issues

## API Reference

### AuthService Methods

- `createUser(userData)`: Create new kitchen user
- `getUserProfile(userId)`: Get user profile by ID
- `updateUserProfile(userId, updates)`: Update user profile
- `getAllUsers()`: Get all active users (admin only)
- `deactivateUser(userId)`: Soft delete user
- `hasPermission(userRole, requiredRole)`: Check role permissions
- `getUsersByRole(role)`: Get users by specific role

### useAuth Hook

- `user`: Supabase auth user object
- `kitchenUser`: Kitchen user profile
- `loading`: Authentication loading state
- `signIn(email, password)`: Sign in user
- `signOut()`: Sign out user
- `hasPermission(role)`: Check if user has permission for role