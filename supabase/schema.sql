-- =============================================
-- SkinSense - Analysis History Schema
-- Run this in Supabase Dashboard → SQL Editor
-- =============================================

-- 分析歷史記錄
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Supabase auth user ID
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 皮膚分析結果
  skin_type TEXT,
  score INTEGER,
  ai_observation TEXT,
  goal_conflict TEXT,
  
  -- 用戶問卷答案（JSON 保存）
  questionnaire JSONB,
  
  -- 圖片 URL（可選，如果要保存）
  image_url TEXT,
  
  -- 分析結果完整數據（JSON 保存，包含 concerns, routine, ingredients 等）
  analysis_data JSONB
);

-- 開啟 RLS
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- 用戶只能看到自己的記錄
CREATE POLICY "Users can only see own history" ON analysis_history
  FOR ALL USING (user_id = auth.uid());

-- 允許插入（分析完成後自動保存）
CREATE POLICY "Users can insert own history" ON analysis_history
  FOR INSERT WITH CHECK (user_id = auth.uid());
