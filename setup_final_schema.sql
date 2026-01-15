-- 1. Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read contact_messages" ON contact_messages FOR SELECT USING (
    (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin'
);


-- 2. Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    interests TEXT[], -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read newsletter" ON newsletter_subscribers FOR SELECT USING (
    (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin'
);

-- 3. Ensure Destinations Columns (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'timeline') THEN
        ALTER TABLE destinations ADD COLUMN timeline JSONB DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'status') THEN
        ALTER TABLE destinations ADD COLUMN status TEXT DEFAULT 'published';
    END IF;
END $$;
