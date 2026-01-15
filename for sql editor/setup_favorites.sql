-- Create Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID REFERENCES auth.users NOT NULL,
  destination_id TEXT NOT NULL, -- Assuming ID is text/uuid from destinations table
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, destination_id)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites" ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (auth.uid() = user_id);

-- Refresh Schema
NOTIFY pgrst, 'reload schema';
