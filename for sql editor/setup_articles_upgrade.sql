-- ==========================================
-- 8. TIPS & ARTICLES UPGRADE
-- ==========================================

DO $$
BEGIN
    -- Upgrade ARTICLES table
    -- Add columns for feature-rich display
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'mood_tags') THEN
        ALTER TABLE articles ADD COLUMN mood_tags TEXT[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'excerpt') THEN
        ALTER TABLE articles ADD COLUMN excerpt TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'is_featured') THEN
        ALTER TABLE articles ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    END IF;

    -- Ensure category exists (already in setup_complete_cms.sql but idempotent check good)
    -- Ensure status check constraint includes 'archived' (already in setup_complete_cms.sql)

END $$;

-- Policies Refresh (Optional, but safe)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published" ON articles;
CREATE POLICY "Public read published" ON articles FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admin full articles" ON articles;
CREATE POLICY "Admin full articles" ON articles USING (auth.role() = 'authenticated');

-- SEED DATA (If empty)
-- We insert some starter articles if table is empty
INSERT INTO articles (title, slug, category, excerpt, content, status, is_featured, cover_image)
SELECT 
    'Panduan Trekking Pemula di Lumajang', 
    'panduan-trekking-pemula', 
    'Panduan', 
    'Persiapan fisik dan mental sebelum mendaki Semeru atau bukit-bukit di sekitarnya.', 
    '<p>Lumajang menawarkan banyak jalur trekking...</p>', 
    'published', 
    TRUE,
    'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'panduan-trekking-pemula');

INSERT INTO articles (title, slug, category, excerpt, content, status, is_featured, cover_image)
SELECT 
    'Budgeting Liburan: Hemat 50K-200K', 
    'budgeting-liburan-hemat', 
    'Tips Hemat', 
    'Cara menikmati keindahan alam tanpa menjebol kantong. Makan murah, penginapan terjangkau.', 
    '<p>Liburan tidak harus mahal...</p>', 
    'published', 
    TRUE,
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1000&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'budgeting-liburan-hemat');

INSERT INTO articles (title, slug, category, excerpt, content, status, cover_image)
SELECT 
    'Etika Wisata Alam: Jaga Kebersihan', 
    'etika-wisata-alam', 
    'Edukasi', 
    'Pentingnya membawa pulang sampahmu dan menghormati kearifan lokal.', 
    '<p>Alam Lumajang adalah titipan...</p>', 
    'published', 
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1000&auto=format&fit=crop'
WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'etika-wisata-alam');

-- 3 More Items as Drafts/Published
INSERT INTO articles (title, slug, category, excerpt, content, status, cover_image)
SELECT 'Checklist Musim Hujan', 'checklist-musim-hujan', 'Safety', 'Barang wajib bawa saat musim hujan.', '<p>Jas hujan, sepatu anti selip...</p>', 'published', 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000&auto=format&fit=crop' WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'checklist-musim-hujan');

INSERT INTO articles (title, slug, category, excerpt, content, status, cover_image)
SELECT 'Spot Golden Hour Terbaik', 'spot-golden-hour', 'Fotografi', 'Lokasi dan jam terbaik untuk foto sunrise.', '<p>Tumpak Sewu jam 9...</p>', 'draft', 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1000&auto=format&fit=crop' WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'spot-golden-hour');

INSERT INTO articles (title, slug, category, excerpt, content, status, cover_image)
SELECT 'Rencana Satu Hari Full', 'itinerary-satu-hari', 'Itinerary', 'Maksimalkan 24 jam di Lumajang.', '<p>Pagi ke Air Terjun...</p>', 'published', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop' WHERE NOT EXISTS (SELECT 1 FROM articles WHERE slug = 'itinerary-satu-hari');


NOTIFY pgrst, 'reload schema';
