import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pbopkpoyjwvlgnvrbrpj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBib3BrcG95and2bGdudnJicnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MTc3MSwiZXhwIjoyMDk1NTQ3NzcxfQ.ZyNj1yA8gLUW82PvX9XfhvPHBmlF2UxP-pb2t0jvv6w";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) console.error(error);
  else console.dir(data, { depth: null });
}

checkOrders();
