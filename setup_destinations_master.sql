-- Enable RLS
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Add or Alter Columns to match requirements
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'ticket_price') THEN
        ALTER TABLE destinations ADD COLUMN ticket_price TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'est_time') THEN
        ALTER TABLE destinations ADD COLUMN est_time TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'trek_level') THEN
        ALTER TABLE destinations ADD COLUMN trek_level TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'moods') THEN
        ALTER TABLE destinations ADD COLUMN moods TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'destinations' AND column_name = 'status') THEN
        ALTER TABLE destinations ADD COLUMN status TEXT DEFAULT 'published';
    END IF;
END $$;

-- Policies (Re-apply safely)
DROP POLICY IF EXISTS "Public read published destinations" ON destinations;
CREATE POLICY "Public read published destinations" ON destinations FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admin full access destinations" ON destinations;
CREATE POLICY "Admin full access destinations" ON destinations FOR ALL USING (
    (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin'
);

-- Seed Data (Upsert based on slug)
INSERT INTO destinations (name, slug, category, short_desc, hero_path, thumbnail_path, ticket_price, est_time, trek_level, moods, lat, lng, status)
VALUES
(
    'Air Terjun Tumpak Sewu', 'tumpak-sewu', ARRAY['Alam', 'Air Terjun'], 
    'Surga tersembunyi dengan panorama air terjun berundak yang memukau dunia.',
    'assets/images/destinasi/tumpak sewu.png', 'assets/images/destinasi/tumpak sewu.png',
    'Rp 20.000/orang', '2-3 Jam', 'Sedang', ARRAY['healing', 'waterfall', 'adventure'], -8.232, 112.917, 'published'
),
(
    'Puncak B29 Argosari', 'b29', ARRAY['Pegunungan', 'Camping'], 
    'Negeri di atas awan dengan pemandangan Bromo yang menakjubkan.',
    'assets/images/destinasi/b29.png', 'assets/images/destinasi/b29.png',
    'Rp 5.000/orang', '1-2 Hari', 'Mudah', ARRAY['mountain', 'family', 'healing'], -7.986, 113.007, 'published'
),
(
    'Ranu Pani', 'ranu-pani', ARRAY['Danau', 'Alam'], 
    'Danau vulkanik yang tenang di kaki Gunung Semeru, gerbang pendakian.',
    'assets/images/destinasi/ranupani.png', 'assets/images/destinasi/ranupani.png',
    'Gratis', '1 Jam', 'Mudah', ARRAY['healing', 'family', 'easy'], -8.013, 112.951, 'published'
),
(
    'Ranu Kumbolo', 'ranu-kumbolo', ARRAY['Danau', 'Camping'], 
    'Permata Semeru, tempat singgah para pendaki dengan sunrise ajaib.',
    'assets/images/destinasi/ranukumbolo.png', 'assets/images/destinasi/ranukumbolo.png',
    'Termasuk Tiket TNBTS', '4-5 Jam', 'Sulit', ARRAY['adventure', 'mountain', 'healing'], -8.064, 112.917, 'published'
),
(
    'Pantai Watu Pecak', 'watu-pecak', ARRAY['Pantai', 'Keluarga'], 
    'Keindahan pantai selatan dengan ombak yang menantang dan pasir hitam.',
    'assets/images/destinasi/watupecak.png', 'assets/images/destinasi/watupecak.png',
    'Rp 5000/orang', 'Sepuasnya', 'Mudah', ARRAY['beach', 'family', 'budget'], -8.271, 113.166, 'published'
),
(
    'Gunung Semeru', 'gunung-semeru', ARRAY['Pegunungan', 'Extreme'], 
    'Puncak tertinggi di Pulau Jawa, Mahameru yang legendaris.',
    'assets/images/destinasi/viewsemeru.png', 'assets/images/destinasi/viewsemeru.png',
    'Booking Online TNBTS', '2-3 Hari', 'Sulit', ARRAY['adventure', 'mountain', 'extreme'], -8.108, 112.922, 'published'
),
(
    'Air Terjun Kapas Biru', 'kapas-biru', ARRAY['Air Terjun', 'Alam'], 
    'Aliran air deras berwarna kebiruan di tengah tebing hijau.',
    'assets/images/destinasi/kapasbiru.png', 'assets/images/destinasi/kapasbiru.png',
    'Rp 10.000/orang', '2 Jam', 'Sedang', ARRAY['waterfall', 'healing', 'budget'], -8.225, 112.930, 'published'
),
(
    'Kebun Teh Kertowono', 'kebun-teh-kertowono', ARRAY['Perkebunan', 'Sejarah'], 
    'Hamparan hijau perkebunan teh peninggalan Belanda yang sejuk.',
    'assets/images/destinasi/kebunteh.png', 'assets/images/destinasi/kebunteh.png',
    'Gratis', '1 Jam', 'Mudah', ARRAY['family', 'healing', 'easy'], -8.038, 113.109, 'published'
),
(
    'Goa Tetes', 'goa-tetes', ARRAY['Goa', 'Air Terjun'], 
    'Keunikan stalaktit dan stalagmit dengan aliran air yang tak henti.',
    'assets/images/destinasi/goatetes.png', 'assets/images/destinasi/goatetes.png',
    'Rp 5.000/orang', '2 Jam', 'Sedang', ARRAY['adventure', 'waterfall', 'budget'], -8.230, 112.915, 'published'
),
(
    'Pantai Bambang', 'pantai-bambang', ARRAY['Pantai', 'Keluarga'], 
    'Pasir hitam eksotis dan luas, cocok untuk bermain layang-layang.',
    'assets/images/destinasi/pantaibambang.png', 'assets/images/destinasi/pantaibambang.png',
    'Rp 5000/orang', 'Sepuasnya', 'Mudah', ARRAY['beach', 'family', 'budget'], -8.250, 113.083, 'published'
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    short_desc = EXCLUDED.short_desc,
    hero_path = EXCLUDED.hero_path,
    thumbnail_path = EXCLUDED.thumbnail_path,
    ticket_price = EXCLUDED.ticket_price,
    est_time = EXCLUDED.est_time,
    trek_level = EXCLUDED.trek_level,
    moods = EXCLUDED.moods,
    lat = EXCLUDED.lat,
    lng = EXCLUDED.lng,
    status = EXCLUDED.status;
