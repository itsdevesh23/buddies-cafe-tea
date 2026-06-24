import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const jwtSecret = process.env.SUPABASE_JWT_SECRET; // Wait, I don't have the JWT secret locally, I only have SERVICE_ROLE_KEY.

// Let's check if SUPABASE_JWT_SECRET is in .env.local
console.log('JWT Secret exists?', !!process.env.SUPABASE_JWT_SECRET);
