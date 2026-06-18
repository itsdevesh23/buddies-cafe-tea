const email = 'website_api@buddiescafe.com';
const password = 'azOA3BXyu2%l4b97T*gK8V4eA$oodR%P';

async function testAuth() {
  console.log('Using Email:', email);
  
  console.log('Using Email:', email);
  
  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  
  if (data.token) {
    console.log('SUCCESS! Token generated:', data.token.substring(0, 20) + '...');
    
    // Test the serviceability API using this real token
    const apiUrl = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=643001&delivery_postcode=110001&weight=0.5&cod=0`;
    const rateRes = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
    const rateData = await rateRes.json();
    console.log('Rate Test Result:', rateData.status === 200 ? 'SUCCESS' : 'FAILED');
    if (rateData.status === 200) {
      console.log('Cheapest Courier:', rateData.data.available_courier_companies[0].courier_name);
      console.log('Rate:', rateData.data.available_courier_companies[0].rate);
    } else {
      console.log(JSON.stringify(rateData, null, 2));
    }

  } else {
    console.log('FAILED to generate token. Invalid credentials?', data);
  }
}

testAuth();
