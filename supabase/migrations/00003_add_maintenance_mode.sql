-- ==========================================
-- 00003_add_maintenance_mode.sql
-- Description: Adds maintenance_mode flag to settings table
-- ==========================================

ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT FALSE;
