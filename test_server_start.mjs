import { spawn } from 'child_process';

const server = spawn('node', ['server/server.js']);

server.stdout.on('data', (data) => {
  console.log(`STDOUT: ${data}`);
});

server.stderr.on('data', (data) => {
  console.error(`STDERR: ${data}`);
});

setTimeout(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [
          {
            id: 'product-294096ae-e1be-48fe-a1c2-2f109529feec-50',
            originalId: 'product-294096ae-e1be-48fe-a1c2-2f109529feec',
            name: 'Agraharam Filter Coffee (50 gms)',
            price: 158,
            quantity: 1
          }
        ],
        shippingInfo: {
          firstName: 'Devesh',
          lastName: 'Munagala',
          email: 'test@example.com',
          phone: '9876543210',
          address: '123 Test St',
          city: 'Test City',
          state: 'Test State',
          pinCode: '123456'
        },
        paymentMethod: 'online',
        shippingCost: 50,
        couponCode: null
      })
    });
    
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    server.kill();
  }
}, 3000);
