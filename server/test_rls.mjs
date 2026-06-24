import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Create standard client (like the frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
  // Login as the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'deveshmunagala23@gmail.com',
    password: 'Password123!' // I don't know the password...
  });
  
  if (authError) {
    console.error('Cannot test RLS without password:', authError.message);
    
    // Test without auth
    console.log('Testing anonymous access...');
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', '31e35027-76b3-4a54-9cb9-ec4f57b4df8c')
      .single();
      
    console.log('Anon Result:', { data, error });
    return;
  }
}

testRLS();
