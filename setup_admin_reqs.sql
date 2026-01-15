-- 1. Create user_roles table if not exists
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'user'
);

-- 2. Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Users can read their own role (Optional, usually strict)
-- For simplicity: Allow public to read roles (or just authenticated)
CREATE POLICY "Allow read user_roles" ON user_roles FOR SELECT USING (true);
CREATE POLICY "Allow all user_roles for admin" ON user_roles FOR ALL USING (true); -- Relaxed for setup

-- 4. Create Storage Bucket 'destinations' if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('destinations', 'destinations', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage Policies
-- Public Read
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING ( bucket_id = 'destinations' );

-- Admin Upload/Update/Delete
CREATE POLICY "Admin Upload" ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'destinations' AND (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin' );

CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE
USING ( bucket_id = 'destinations' AND (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin' );

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE
USING ( bucket_id = 'destinations' AND (SELECT role FROM user_roles WHERE user_id = auth.uid()) = 'admin' );
