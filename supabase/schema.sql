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

-- =====================================================
-- User Profiles Table
-- =====================================================
-- Stores user's questionnaire answers and basic profile for auto-fill
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Questionnaire answers
  skin_type_self TEXT,
  t_zone_oiliness TEXT,
  pore_size TEXT,
  acne_level TEXT,
  sensitivity TEXT,
  hydration TEXT,
  
  -- Basic info
  gender TEXT,
  age TEXT,
  climate TEXT,
  is_traveling BOOLEAN DEFAULT false,
  travel_climate TEXT,
  goal TEXT,
  skin_history TEXT
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile" ON user_profiles
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- Product Analyses Table
-- =====================================================
-- Stores ingredient analysis results for products
CREATE TABLE IF NOT EXISTS product_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  product_id UUID REFERENCES skincare_products(id) ON DELETE CASCADE,
  ingredient_analysis JSONB,
  analysis_result TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE product_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their analyses" ON product_analyses
  FOR ALL USING (user_id = auth.uid()::TEXT);

-- =====================================================
-- User Allergens Table
-- =====================================================
-- Stores user's personal allergen/irritant list
CREATE TABLE IF NOT EXISTS user_allergens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  allergen TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_allergens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their allergens" ON user_allergens
  FOR ALL USING (user_id = auth.uid()::TEXT);
