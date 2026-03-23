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
