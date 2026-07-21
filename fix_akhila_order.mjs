import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pbopkpoyjwvlgnvrbrpj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBib3BrcG95and2bGdudnJicnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MTc3MSwiZXhwIjoyMDk1NTQ3NzcxfQ.ZyNj1yA8gLUW82PvX9XfhvPHBmlF2UxP-pb2t0jvv6w";
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixOrder() {
  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'Processing',
      razorpay_payment_id: 'pay_TEVh0Y6jmQfDms'
    })
    .eq('razorpay_order_id', 'order_TEVgfTeKtwe3g5');
    
  if (error) console.error(error);
  else console.log('Successfully fixed Akhilas order:', data);
}

fixOrder();
