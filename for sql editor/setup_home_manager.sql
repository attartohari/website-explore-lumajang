-- ==========================================
-- 4. HOME MANAGER CONFIGURATION SETUP
-- ==========================================

-- Create table to store page configurations (key-value store-ish)
-- section_key: e.g., 'home_hero', 'home_welcome', 'home_testimonials'
-- content: JSONB object containing all text/image URLs/settings
CREATE TABLE IF NOT EXISTS page_sections (
    section_key TEXT PRIMARY KEY,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read (everyone looks at the website)
DROP POLICY IF EXISTS "Allow public read page_sections" ON page_sections;
CREATE POLICY "Allow public read page_sections" 
ON page_sections FOR SELECT 
USING (true);

-- Policy: Allow authenticated insert/update (only admin)
DROP POLICY IF EXISTS "Allow auth insert page_sections" ON page_sections;
CREATE POLICY "Allow auth insert page_sections" 
ON page_sections FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow auth update page_sections" ON page_sections;
CREATE POLICY "Allow auth update page_sections" 
ON page_sections FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
