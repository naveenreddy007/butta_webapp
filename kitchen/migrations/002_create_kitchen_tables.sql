-- Kitchen Module Database Schema
-- This creates all tables needed for the Kitchen Module API

-- =============================================================================
-- EVENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS kitchen_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  guest_count INTEGER NOT NULL CHECK (guest_count > 0),
  event_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  assigned_chef UUID REFERENCES kitchen_users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_kitchen_events_date ON kitchen_events(date);
CREATE INDEX IF NOT EXISTS idx_kitchen_events_status ON kitchen_events(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_events_assigned_chef ON kitchen_events(assigned_chef);

-- =============================================================================
-- STOCK TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS kitchen_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity >= 0),
  unit VARCHAR(50) NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE,
  batch_number VARCHAR(100),
  supplier VARCHAR(255),
  cost_per_unit DECIMAL(10,2) CHECK (cost_per_unit >= 0),
  is_active BOOLEAN DEFAULT true,
  min_stock DECIMAL(10,2) CHECK (min_stock >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for stock
CREATE INDEX IF NOT EXISTS idx_kitchen_stock_category ON kitchen_stock(category);
CREATE INDEX IF NOT EXISTS idx_kitchen_stock_expiry ON kitchen_stock(expiry_date);
CREATE INDEX IF NOT EXISTS idx_kitchen_stock_active ON kitchen_stock(is_active);
CREATE INDEX IF NOT EXISTS idx_kitchen_stock_name ON kitchen_stock(item_name);

-- =============================================================================
-- STOCK UPDATES TABLE (for tracking stock changes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS kitchen_stock_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stock_id UUID NOT NULL REFERENCES kitchen_stock(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('ADDED', 'REMOVED', 'USED', 'EXPIRED', 'DAMAGED')),
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  reason TEXT NOT NULL,
  updated_by UUID NOT NULL REFERENCES kitchen_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for stock updates
CREATE INDEX IF NOT EXISTS idx_kitchen_stock_updates_stock_id ON kitchen_stock_updates(stock_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_stock_updates_type ON kitchen_stock_updates(type);
CREATE INDEX IF NOT EXISTS idx_kitchen_stock_updates_date ON kitchen_stock_updates(created_at);

-- =============================================================================
-- INDENTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS kitchen_indents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES kitchen_events(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
  created_by UUID NOT NULL REFERENCES kitchen_users(id),
  approved_by UUID REFERENCES kitchen_users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for indents
CREATE INDEX IF NOT EXISTS idx_kitchen_indents_event_id ON kitchen_indents(event_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_indents_status ON kitchen_indents(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_indents_created_by ON kitchen_indents(created_by);

-- =============================================================================
-- INDENT ITEMS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS kitchen_indent_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indent_id UUID NOT NULL REFERENCES kitchen_indents(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
  unit VARCHAR(50) NOT NULL,
  received_quantity DECIMAL(10,2) DEFAULT 0 CHECK (received_quantity >= 0),
  is_received BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for indent items
CREATE INDEX IF NOT EXISTS idx_kitchen_indent_items_indent_id ON kitchen_indent_items(indent_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_indent_items_category ON kitchen_indent_items(category);

-- =============================================================================
-- COOKING LOGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS kitchen_cooking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES kitchen_events(id) ON DELETE CASCADE,
  dish_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  servings INTEGER NOT NULL CHECK (servings > 0),
  status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD')),
  assigned_to UUID NOT NULL REFERENCES kitchen_users(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_time INTEGER, -- in minutes
  notes TEXT,
  priority VARCHAR(50) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cooking logs
CREATE INDEX IF NOT EXISTS idx_kitchen_cooking_logs_event_id ON kitchen_cooking_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_cooking_logs_status ON kitchen_cooking_logs(status);
CREATE INDEX IF NOT EXISTS idx_kitchen_cooking_logs_assigned_to ON kitchen_cooking_logs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_kitchen_cooking_logs_priority ON kitchen_cooking_logs(priority);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================================================

-- Events table trigger
CREATE TRIGGER update_kitchen_events_updated_at 
  BEFORE UPDATE ON kitchen_events 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Stock table trigger
CREATE TRIGGER update_kitchen_stock_updated_at 
  BEFORE UPDATE ON kitchen_stock 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Indents table trigger
CREATE TRIGGER update_kitchen_indents_updated_at 
  BEFORE UPDATE ON kitchen_indents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Cooking logs table trigger
CREATE TRIGGER update_kitchen_cooking_logs_updated_at 
  BEFORE UPDATE ON kitchen_cooking_logs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE kitchen_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_stock_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_indents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_indent_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_cooking_logs ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "All users can read events" ON kitchen_events FOR SELECT USING (true);
CREATE POLICY "Managers can manage events" ON kitchen_events FOR ALL USING (
  EXISTS (SELECT 1 FROM kitchen_users WHERE id = auth.uid()::text AND role IN ('KITCHEN_MANAGER', 'ADMIN'))
);

-- Stock policies
CREATE POLICY "All users can read stock" ON kitchen_stock FOR SELECT USING (true);
CREATE POLICY "Managers can manage stock" ON kitchen_stock FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM kitchen_users WHERE id = auth.uid()::text AND role IN ('KITCHEN_MANAGER', 'ADMIN'))
);
CREATE POLICY "Managers can update stock" ON kitchen_stock FOR UPDATE USING (
  EXISTS (SELECT 1 FROM kitchen_users WHERE id = auth.uid()::text AND role IN ('KITCHEN_MANAGER', 'ADMIN'))
);
CREATE POLICY "All users can update stock quantity" ON kitchen_stock FOR UPDATE USING (true);

-- Stock updates policies
CREATE POLICY "All users can read stock updates" ON kitchen_stock_updates FOR SELECT USING (true);
CREATE POLICY "All users can create stock updates" ON kitchen_stock_updates FOR INSERT WITH CHECK (
  updated_by = auth.uid()::text
);

-- Indents policies
CREATE POLICY "All users can read indents" ON kitchen_indents FOR SELECT USING (true);
CREATE POLICY "Managers can manage indents" ON kitchen_indents FOR ALL USING (
  EXISTS (SELECT 1 FROM kitchen_users WHERE id = auth.uid()::text AND role IN ('KITCHEN_MANAGER', 'ADMIN'))
);

-- Indent items policies
CREATE POLICY "All users can read indent items" ON kitchen_indent_items FOR SELECT USING (true);
CREATE POLICY "Managers can manage indent items" ON kitchen_indent_items FOR ALL USING (
  EXISTS (SELECT 1 FROM kitchen_users WHERE id = auth.uid()::text AND role IN ('KITCHEN_MANAGER', 'ADMIN'))
);

-- Cooking logs policies
CREATE POLICY "All users can read cooking logs" ON kitchen_cooking_logs FOR SELECT USING (true);
CREATE POLICY "Managers can create cooking tasks" ON kitchen_cooking_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM kitchen_users WHERE id = auth.uid()::text AND role IN ('KITCHEN_MANAGER', 'ADMIN'))
);
CREATE POLICY "Assigned chefs can update their tasks" ON kitchen_cooking_logs FOR UPDATE USING (
  assigned_to = auth.uid()::text OR 
  EXISTS (SELECT 1 FROM kitchen_users WHERE id = auth.uid()::text AND role IN ('KITCHEN_MANAGER', 'ADMIN'))
);
CREATE POLICY "Managers can delete cooking tasks" ON kitchen_cooking_logs FOR DELETE USING (
  EXISTS (SELECT 1 FROM kitchen_users WHERE id = auth.uid()::text AND role IN ('KITCHEN_MANAGER', 'ADMIN'))
);

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample events
INSERT INTO kitchen_events (id, name, date, guest_count, event_type, assigned_chef) VALUES
  ('event-001', 'Smith Wedding Reception', '2024-12-15 18:00:00+00', 150, 'Wedding', '550e8400-e29b-41d4-a716-446655440001'),
  ('event-002', 'Corporate Annual Dinner', '2024-12-20 19:00:00+00', 200, 'Corporate', '550e8400-e29b-41d4-a716-446655440002'),
  ('event-003', 'Birthday Celebration', '2024-12-25 16:00:00+00', 50, 'Birthday', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample stock items
INSERT INTO kitchen_stock (id, item_name, category, quantity, unit, cost_per_unit, min_stock) VALUES
  ('stock-001', 'Basmati Rice', 'Grains', 100.00, 'kg', 2.50, 20.00),
  ('stock-002', 'Chicken Breast', 'Meat', 50.00, 'kg', 8.00, 10.00),
  ('stock-003', 'Tomatoes', 'Vegetables', 25.00, 'kg', 3.00, 5.00),
  ('stock-004', 'Onions', 'Vegetables', 30.00, 'kg', 2.00, 10.00),
  ('stock-005', 'Cooking Oil', 'Condiments', 20.00, 'liters', 5.00, 5.00)
ON CONFLICT (id) DO NOTHING;

-- Insert sample cooking tasks
INSERT INTO kitchen_cooking_logs (id, event_id, dish_name, category, servings, assigned_to, priority) VALUES
  ('cooking-001', 'event-001', 'Chicken Biryani', 'Main Course', 150, '550e8400-e29b-41d4-a716-446655440001', 'HIGH'),
  ('cooking-002', 'event-001', 'Vegetable Curry', 'Main Course', 50, '550e8400-e29b-41d4-a716-446655440001', 'NORMAL'),
  ('cooking-003', 'event-002', 'Grilled Chicken', 'Main Course', 200, '550e8400-e29b-41d4-a716-446655440002', 'HIGH')
ON CONFLICT (id) DO NOTHING;

-- Insert sample indent
INSERT INTO kitchen_indents (id, event_id, created_by, status) VALUES
  ('indent-001', 'event-001', '550e8400-e29b-41d4-a716-446655440002', 'APPROVED')
ON CONFLICT (id) DO NOTHING;

-- Insert sample indent items
INSERT INTO kitchen_indent_items (id, indent_id, item_name, category, quantity, unit) VALUES
  ('indent-item-001', 'indent-001', 'Extra Rice', 'Grains', 20.00, 'kg'),
  ('indent-item-002', 'indent-001', 'Fresh Vegetables', 'Vegetables', 15.00, 'kg')
ON CONFLICT (id) DO NOTHING;