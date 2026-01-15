-- ==========================================
-- 7. TIMELINE & VISIT FLOW SUPPORT
-- ==========================================

DO $$
BEGIN
    -- Add timeline column if it doesn't exist
    -- Stores array of objects: [{ title, description, duration_hint }]
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'timeline') THEN
        ALTER TABLE destinations ADD COLUMN timeline JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add a structured 'category_type' if needed for rendering related logic better, 
    -- but 'category' text[] is likely sufficient. 
    -- Let's ensure 'price_note' exists for more complex ticket info if needed.
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'price_note') THEN
        ALTER TABLE destinations ADD COLUMN price_note TEXT;
    END IF;

END $$;

NOTIFY pgrst, 'reload schema';
