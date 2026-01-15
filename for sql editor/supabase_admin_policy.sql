-- ==========================================
-- SETUP ADMIN ACCESS (SELECT)
-- ==========================================

-- Allow Authenticated Users (Admins) to VIEW newsletter subscribers
-- Adjust this policy if you have specific "admin" roles.
-- For now, we allow any logged-in user to view the list.

DROP POLICY IF EXISTS "Allow authenticated view" ON newsletter_subscribers;

CREATE POLICY "Allow authenticated view"
ON newsletter_subscribers
FOR SELECT
TO authenticated
USING (true);

-- Also ensure admins can DELETE
DROP POLICY IF EXISTS "Allow authenticated delete" ON newsletter_subscribers;

CREATE POLICY "Allow authenticated delete"
ON newsletter_subscribers
FOR DELETE
TO authenticated
USING (true);

-- FORCE SCHEMA REFRESH
NOTIFY pgrst, 'reload schema';
