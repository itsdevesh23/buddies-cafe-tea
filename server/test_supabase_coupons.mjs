import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env.local' });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .limit(1);
    
  if (error) console.error(error);
  console.log("Coupons columns:", data.length > 0 ? Object.keys(data[0]) : "No data to infer columns");
}
run();
