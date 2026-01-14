-- ==========================================
-- ASSIGN ADMIN ROLE
-- ==========================================
-- This script assigns the 'admin' role to the specified email.
-- It works by looking up the UUID in auth.users and inserting/updating user_roles.

DO $$
DECLARE
    target_email TEXT := 'attarutur.234@gmail.com';
    target_id UUID;
BEGIN
    -- 1. Get User ID
    SELECT id INTO target_id FROM auth.users WHERE email = target_email;

    IF target_id IS NOT NULL THEN
        -- 2. Insert or Update User Role
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_id, 'admin')
        ON CONFLICT (user_id) DO UPDATE
        SET role = 'admin';
        
        RAISE NOTICE 'Success: % is now an Admin (ID: %)', target_email, target_id;
    ELSE
        RAISE NOTICE 'Warning: User % not found in auth.users. Please ask them to Sign Up first.', target_email;
    END IF;
END $$;
