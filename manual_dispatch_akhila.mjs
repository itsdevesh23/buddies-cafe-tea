import { createClient } from '@supabase/supabase-js';
import { generateCustomerReceipt, generateAdminAlert } from './server/emailTemplates.js';
import { Resend } from 'resend';

const resend = new Resend('re_EWQ1w6Uo_G3D6DEWCGswnKBKh67myjVdc');

const supabase = createClient(
  "https://pbopkpoyjwvlgnvrbrpj.supabase.co", 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBib3BrcG95and2bGdudnJicnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk3MTc3MSwiZXhwIjoyMDk1NTQ3NzcxfQ.ZyNj1yA8gLUW82PvX9XfhvPHBmlF2UxP-pb2t0jvv6w"
);

async function manualDispatch() {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', 'e9d66512-3ce2-4107-9b74-2b115c02d07c')
    .single();

  if (error || !order) {
    console.error('Failed to fetch order:', error);
    return;
  }

  const orderData = {
    orderId: order.id,
    userId: order.user_id,
    total: order.total_amount,
    shippingInfo: order.shipping_info,
    items: order.items,
    paymentMethod: order.payment_method
  };

  // 1. SHIPROCKET
  console.log('Authenticating Shiprocket...');
  let srToken;
  try {
    const authReq = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'buddiescafedanjoteas@gmail.com',
        password: 'md9ZNEFr6Q4*hb9!DQgSk$M8HBXSzZfz'
      })
    });
    const authData = await authReq.json();
    srToken = authData.token;
  } catch (err) {
    console.error('Shiprocket Auth Error:', err);
  }

  if (srToken) {
    const cleanPhone = (orderData.shippingInfo.phone || '9876543210').replace(/\D/g, '').slice(-10);
    const getWeightInKg = (name) => {
      if (!name) return 0.1;
      const matchKg = name.match(/([\d.]+)\s*(?:KG|LITER|L)\b/i);
      if (matchKg) return parseFloat(matchKg[1]);
      const matchGms = name.match(/(\d+)\s*(?:GMS|ML)\b/i);
      if (matchGms) return parseInt(matchGms[1]) / 1000;
      return 0.1;
    };
    const totalWeight = orderData.items.reduce((sum, item) => sum + (getWeightInKg(item.name) * item.quantity), 0);
    const finalWeight = Math.max(0.5, totalWeight);

    const payload = {
      order_id: orderData.orderId,
      order_date: new Date(order.created_at).toISOString().replace('T', ' ').substring(0, 19),
      pickup_location: 'work',
      billing_customer_name: orderData.shippingInfo.firstName,
      billing_last_name: orderData.shippingInfo.lastName,
      billing_address: orderData.shippingInfo.address,
      billing_city: orderData.shippingInfo.city,
      billing_pincode: orderData.shippingInfo.pinCode,
      billing_state: orderData.shippingInfo.state,
      billing_country: 'India',
      billing_email: orderData.shippingInfo.email || 'customer@buddiescafe.com',
      billing_phone: cleanPhone,
      shipping_is_billing: true,
      order_items: orderData.items.map(item => ({
        name: item.name,
        sku: item.id.toString(),
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: ''
      })),
      payment_method: 'Prepaid',
      sub_total: orderData.total,
      length: 10,
      breadth: 10,
      height: 10,
      weight: finalWeight
    };

    console.log('Sending to Shiprocket...');
    try {
      const srReq = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${srToken}`
        },
        body: JSON.stringify(payload)
      });
      const shiprocketResponse = await srReq.json();
      console.log('Shiprocket Response:', shiprocketResponse);
    } catch (err) {
      console.error('Shiprocket Create Error:', err);
    }
  }

  // 2. RESEND EMAIL
  console.log('Sending Email to', orderData.shippingInfo.email);
  try {
    const emailRes = await resend.emails.send({
      from: 'Buddies Cafe <orders@danjoteas.com>', 
      to: orderData.shippingInfo.email,
      subject: `Order Confirmation #${orderData.orderId}`,
      html: generateCustomerReceipt(orderData)
    });
    console.log('Customer Email Result:', emailRes);
    
    const adminEmailRes = await resend.emails.send({
      from: 'Buddies Cafe <orders@danjoteas.com>',
      to: 'buddiescafecbe@gmail.com',
      subject: `New Order Alert! #${orderData.orderId}`,
      html: generateAdminAlert(orderData)
    });
    console.log('Admin Email Result:', adminEmailRes);
  } catch (err) {
    console.error('Email Error:', err);
  }
}

manualDispatch();
