-- Create kitchen_users table for authentication and role management
CREATE TABLE IF NOT EXISTS kitchen_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'CHEF' CHECK (role IN ('CHEF', 'KITCHEN_MANAGER', 'ADMIN')),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_kitchen_users_email ON kitchen_users(email);

-- Create index on role for role-based queries
CREATE INDEX IF NOT EXISTS idx_kitchen_users_role ON kitchen_users(role);

-- Enable Row Level Security
ALTER TABLE kitchen_users ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON kitchen_users
  FOR SELECT USING (auth.uid()::text = id);

-- Kitchen managers and admins can read all profiles
CREATE POLICY "Managers can read all profiles" ON kitchen_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM kitchen_users 
      WHERE id = auth.uid()::text 
      AND role IN ('KITCHEN_MANAGER', 'ADMIN')
    )
  );

-- Only admins can insert new users
CREATE POLICY "Only admins can create users" ON kitchen_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM kitchen_users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON kitchen_users
  FOR UPDATE USING (auth.uid()::text = id)
  WITH CHECK (
    auth.uid()::text = id 
    AND (OLD.role = NEW.role OR EXISTS (
      SELECT 1 FROM kitchen_users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    ))
  );

-- Only admins can delete users
CREATE POLICY "Only admins can delete users" ON kitchen_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM kitchen_users 
      WHERE id = auth.uid()::text 
      AND role = 'ADMIN'
    )
  );

-- Insert demo users for testing
INSERT INTO kitchen_users (id, email, name, role, phone) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'chef@butta.com', 'John Chef', 'CHEF', '+1234567890'),
  ('550e8400-e29b-41d4-a716-446655440002', 'manager@butta.com', 'Sarah Manager', 'KITCHEN_MANAGER', '+1234567891'),
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@butta.com', 'Admin User', 'ADMIN', '+1234567892')
ON CONFLICT (email) DO NOTHING;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_kitchen_users_updated_at 
  BEFORE UPDATE ON kitchen_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();