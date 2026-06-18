-- ==========================================
-- 00002_add_admin_flag.sql
-- Description: Adds is_admin flag to profiles table
-- ==========================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Optional: If you want to automatically make an existing user an admin right now, 
-- you can run this command (uncomment and replace the email):
-- UPDATE profiles SET is_admin = TRUE WHERE id IN (SELECT id FROM auth.users WHERE email = 'buddiescafecbe@gmail.com');
