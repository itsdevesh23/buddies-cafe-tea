import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function makeAdmin(email) {
  console.log(`Searching for user with email: ${email}`);
  
  // Get all users
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching users:', authError);
    return;
  }
  
  const user = users.find(u => u.email === email);
  
  if (!user) {
    console.log(`User with email ${email} not found in auth.users!`);
    return;
  }
  
  console.log(`Found user: ID=${user.id}`);
  
  const { error: updateError } = await supabaseAdmin
    .from('profiles')
    .update({ is_admin: true })
    .eq('id', user.id);
    
  if (updateError) {
    console.error('Error updating profile:', updateError);
  } else {
    console.log(`Successfully made ${email} an admin in profiles!`);
  }
}

makeAdmin('deveshmunagala23@gmail.com');
