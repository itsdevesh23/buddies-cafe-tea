import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pbopkpoyjwvlgnvrbrpj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBib3BrcG95and2bGdudnJicnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MTc3MSwiZXhwIjoyMDk1NTQ3NzcxfQ.ZyNj1yA8gLUW82PvX9XfhvPHBmlF2UxP-pb2t0jvv6w";
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrder() {
  const { data, error } = await supabase
    .from('orders')
    .select('items')
    .eq('id', 'aa2947df-1ea6-420c-a749-88faac50decb')
    .single();
    
  if (error) console.error(error);
  else console.dir(data, { depth: null });
}

checkOrder();
