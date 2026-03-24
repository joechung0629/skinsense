-- =====================================================
-- SkinSense Database Schema
-- =====================================================

-- Analysis History Table
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Analysis Results
  skin_type TEXT,
  ai_observation TEXT,
  goal_conflict TEXT,
  concerns JSONB,
  routine JSONB,
  ingredients JSONB,
  
  -- User's original questionnaire
  questionnaire JSONB
);

ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own history" ON analysis_history
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- =====================================================
-- Skincare Products Table
-- =====================================================
CREATE TABLE IF NOT EXISTS skincare_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'mask', 'other')),
  brand TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE skincare_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their products" ON skincare_products
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- =====================================================
-- Product Usage Logs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS product_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id UUID REFERENCES skincare_products(id) ON DELETE CASCADE,
  used_at DATE NOT NULL,
  routine_time TEXT DEFAULT 'both' CHECK (routine_time IN ('morning', 'evening', 'both'))
);

ALTER TABLE product_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their logs" ON product_usage_logs
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- =====================================================
-- Analysis-Product Links Table
-- =====================================================
-- Tracks which products the user was using when they did an analysis
CREATE TABLE IF NOT EXISTS analysis_product_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analysis_history(id) ON DELETE CASCADE,
  product_id UUID REFERENCES skincare_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(analysis_id, product_id)
);

ALTER TABLE analysis_product_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their links" ON analysis_product_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM analysis_history
      WHERE analysis_history.id = analysis_product_links.analysis_id
      AND analysis_history.user_id = auth.uid()::TEXT
    )
  );
