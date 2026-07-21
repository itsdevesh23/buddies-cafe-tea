import fetch from 'node-fetch';

async function testPlaceOrder() {
  try {
    const res = await fetch('http://localhost:5000/api/place-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: 'order_TEblWI4ffxdJgp',
        razorpay_payment_id: 'pay_dummy',
        razorpay_signature: 'dummy_signature',
        couponCode: null
      })
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testPlaceOrder();
