import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import { Resend } from 'resend';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { generateCustomerReceipt, generateAdminAlert, generateBookingAlert, generateBookingConfirmedEmail, generateBookingCancelledEmail, generateOrderCancellationEmail } from './emailTemplates.js';
import { validate, registerSchema, contactSchema, bookingSchema, orderSchema } from './middleware/validate.js';

// Load .env.local from the parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// ==========================================
// OBSERVABILITY (Sentry Error Tracking)
// ==========================================
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();

// ==========================================
// SECURITY MIDDLEWARE
// ==========================================

// Fix double slashes in URL (in case VITE_API_URL has a trailing slash)
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

// 1. CORS - Locked down to specific domains (Rule #32)
const allowedOrigins = [
  'http://localhost:5173', // Local Vite Dev
  'http://127.0.0.1:5173',
  'https://danjoteas.com',
  'https://www.danjoteas.com',
  process.env.FRONTEND_URL // Vercel/Netlify Live URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    // Or allow if the origin is in our allowed list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// --- HEALTH CHECK ENDPOINT (Rule #34) ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 2. Set Security HTTP Headers
app.use(helmet());

// 3. Body Parser (Reading data from body into req.body)
app.use(express.json({ limit: '10kb' })); 

// 4. Rate Limiting Zones (Tiered Architecture)

const zone1Limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Strict Limit: 5 requests / min
  message: { error: 'Too many high-risk requests. Please wait a minute.' },
  standardHeaders: true, legacyHeaders: false,
});

const zone2Limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Moderate Limit: 30 requests / min
  message: { error: 'Too many dynamic requests. Please slow down.' },
  standardHeaders: true, legacyHeaders: false,
});

const zone3Limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // Generous Limit: 120 requests / min
  message: { error: 'Too many browsing requests. Please wait a moment.' },
  standardHeaders: true, legacyHeaders: false,
});

const zone4Limiter = rateLimit({
  windowMs: 1 * 1000, // 1 second
  max: 40, // API Limit: 40 requests / sec
  message: { error: 'External API rate limit exceeded.' },
  standardHeaders: true, legacyHeaders: false,
});

// --- STRICT ABUSE LIMITERS ---
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour per IP
  message: { error: 'Too many registration attempts from this IP, please try again after an hour' },
  standardHeaders: true, legacyHeaders: false,
  handler: (req, res, next, options) => {
    Sentry.captureMessage(`Auth Rate Limit Exceeded: ${req.ip}`, { level: 'warning', tags: { route: req.path } });
    res.status(options.statusCode).json(options.message);
  }
});

const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per IP
  message: { error: 'Too many contact requests from this IP, please try again after an hour' },
  standardHeaders: true, legacyHeaders: false,
  handler: (req, res, next, options) => {
    Sentry.captureMessage(`Contact Form Rate Limit Exceeded: ${req.ip}`, { level: 'warning', tags: { route: req.path } });
    res.status(options.statusCode).json(options.message);
  }
});

const ticketLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour per IP
  message: { error: 'Too many support tickets created from this IP, please try again after an hour' },
  standardHeaders: true, legacyHeaders: false,
  handler: (req, res, next, options) => {
    Sentry.captureMessage(`Support Ticket Rate Limit Exceeded: ${req.ip}`, { level: 'warning', tags: { route: req.path } });
    res.status(options.statusCode).json(options.message);
  }
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 chat requests per 15 mins per IP
  message: { error: 'Too many AI chat requests. Please try again in 15 minutes.' },
  standardHeaders: true, legacyHeaders: false,
  handler: (req, res, next, options) => {
    Sentry.captureMessage(`AI Chat Rate Limit Exceeded: ${req.ip}`, { level: 'warning', tags: { route: req.path } });
    res.status(options.statusCode).json(options.message);
  }
});

// Apply generic browsing rate limiter as fallback
app.use(zone3Limiter);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Initialize Sanity Client
const sanityClient = createSanityClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'syoc9xav',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: process.env.VITE_SANITY_API_VERSION || '2024-05-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false
});

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// --- AUTHENTICATION MIDDLEWARES ---
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        if (user) req.user = user;
      }
    }
    next();
  } catch (error) {
    next(); // Optional, so just proceed if invalid token
  }
};

const requireAdmin = async (req, res, next) => {
  // First ensure they are authenticated
  requireAuth(req, res, async () => {
    try {
      // Check if user has is_admin flag in profiles table
      const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('is_admin')
        .eq('id', req.user.id)
        .single();
        
      if (error || !profile || !profile.is_admin) {
        Sentry.captureMessage('Unauthorized Admin Access Attempt', { 
          level: 'warning', 
          user: { id: req.user.id },
          tags: { route: req.path }
        });
        console.warn(`User ${req.user.id} attempted to access admin route without admin privileges.`);
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }
      
      next();
    } catch (err) {
      console.error('Admin Middleware Error:', err);
      res.status(500).json({ error: 'Internal server error checking admin status' });
    }
  });
};

// --- MAINTENANCE MODE MIDDLEWARE (Rule #48) ---
let cachedMaintenanceMode = false;
let lastMaintenanceCheck = 0;

app.use(async (req, res, next) => {
  // Allow admin routes and health check to pass through
  const adminRoutes = [
    '/api/admin',
    '/api/update-settings',
    '/api/update-product',
    '/api/create-coupon',
    '/api/toggle-coupon',
    '/api/delete-coupon',
    '/api/create-journal-post',
    '/api/update-journal-post',
    '/api/get-bookings',
    '/api/update-booking-status'
  ];

  if (adminRoutes.some(route => req.path.startsWith(route)) || req.path === '/health') {
    return next();
  }

  // Check DB every 30 seconds to avoid spamming Supabase
  const now = Date.now();
  if (now - lastMaintenanceCheck > 30000) {
    try {
      const { data } = await supabaseAdmin.from('site_settings').select('maintenance_mode').single();
      if (data) {
        cachedMaintenanceMode = data.maintenance_mode;
        lastMaintenanceCheck = now;
      }
    } catch (e) {
      console.error('Failed to fetch maintenance mode status', e);
    }
  }

  if (cachedMaintenanceMode) {
    return res.status(503).json({ error: 'Maintenance Mode: We will be back soon!' });
  }

  next();
});

app.post('/api/create-order', zone1Limiter, optionalAuth, async (req, res) => {
  try {
    const { items, couponCode, shippingInfo, paymentMethod, shippingCost } = req.body;
    
    // BOLA FIX: Never trust userId from client. If logged in, grab from token.
    const finalUserId = req.user ? req.user.id : null;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 1. Fetch real prices from Sanity
    let calculatedSubtotal = 0;
    for (const item of items) {
      let realId = item.originalId || item.id;
      // Fallback for old cart items without originalId (e.g. id: 'product-uuid-100')
      if (!item.originalId && realId.match(/-\d+$/)) {
        realId = realId.replace(/-\d+$/, '');
      }
      
      const sanityProduct = await sanityClient.fetch(`*[_type == "product" && _id == $id][0] { price, moq }`, { id: realId });
      if (!sanityProduct) {
        return res.status(400).json({ error: `Product ${item.name} not found in database.` });
      }
      const moq = sanityProduct.moq || 250;
      const packWeight = item.packWeight || moq;
      const packPrice = Math.round((sanityProduct.price / moq) * packWeight);
      
      calculatedSubtotal += packPrice * item.quantity;
    }

    let discount = 0;
    // 2. Validate Coupon
    if (couponCode) {
      const { data: couponData } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .is('deleted_at', null)
        .eq('is_active', true)
        .single();
      
      if (couponData && calculatedSubtotal >= (couponData.min_cart_value || 0)) {
        if (couponData.type === 'percentage') {
          discount = (calculatedSubtotal * couponData.discount_percent) / 100;
        } else if (couponData.type === 'fixed') {
          discount = couponData.discount_percent; // Treating discount_percent as fixed amount if type is fixed
        }
      }
    }

    // 3. Add Shipping
    let finalTotal = calculatedSubtotal - discount;
    let finalShippingCost = 0;

    if (finalTotal >= 4999) {
      finalShippingCost = 0; // Free shipping over 4999
    } else if (shippingCost !== undefined && shippingCost !== null && shippingCost >= 0) {
      finalShippingCost = Number(shippingCost);
    } else {
      const { data: settings } = await supabaseAdmin.from('site_settings').select('shipping_flat_rate').eq('id', 1).single();
      if (settings && settings.shipping_flat_rate) {
        finalShippingCost = settings.shipping_flat_rate;
      } else {
        finalShippingCost = 150;
      }
    }
    
    finalTotal += finalShippingCost;

    // 4. Create Razorpay Order (ONLY IF NOT COD)
    let order = null;

    if (paymentMethod !== 'cod') {
      const options = {
        amount: Math.round(finalTotal * 100), // Razorpay requires amount in paise
        currency: 'INR',
        receipt: 'rcpt_' + Math.floor(Math.random() * 1000000)
      };
      order = await razorpay.orders.create(options);
    }

    const orderId = crypto.randomUUID();

    // 5. Insert PENDING order into Supabase
    const supabaseOrderData = {
      id: orderId, // UUID primary key
      razorpay_order_id: order ? order.id : null,
      user_id: finalUserId,
      items: items,
      total_amount: finalTotal,
      shipping_info: {
        ...shippingInfo,
        shipping_cost: finalShippingCost,
        discount_amount: discount
      },
      status: 'Pending Payment',
      payment_status: 'Pending',
      payment_method: paymentMethod === 'cod' ? 'cod' : 'online'
    };

    const { error: insertError } = await supabaseAdmin.from('orders').insert([supabaseOrderData]);
    if (insertError) {
      console.error("Error creating pending order:", insertError);
      return res.status(500).json({ error: 'Failed to create pending order' });
    }

    res.json({
      id: orderId,
      razorpayOrderId: order ? order.id : null,
      amount: finalTotal,
      currency: 'INR'
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: error.message || 'Something went wrong!' });
  }
});

// --- SHIPROCKET DYNAMIC AUTHENTICATOR ---
let cachedShiprocketToken = null;
let tokenExpiryTime = null;

async function getShiprocketToken() {
  // If token exists and hasn't expired (giving 1 day buffer for 10-day expiry), return it
  if (cachedShiprocketToken && tokenExpiryTime && Date.now() < tokenExpiryTime) {
    return cachedShiprocketToken;
  }

  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;
    
    if (!email || !password) {
      console.error('Shiprocket credentials missing from .env.local');
      return null;
    }

    const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
      signal: AbortSignal.timeout(5000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    
    if (data.token) {
      cachedShiprocketToken = data.token;
      // Shiprocket tokens expire in 10 days. We'll cache for 9 days to be extremely safe.
      tokenExpiryTime = Date.now() + (9 * 24 * 60 * 60 * 1000); 
      console.log('Successfully generated new Shiprocket JWT token.');
      return cachedShiprocketToken;
    } else {
      console.error('Failed to generate Shiprocket token:', data);
      return null;
    }
  } catch (error) {
    console.error('Error fetching Shiprocket token:', error);
    return null;
  }
}
// ----------------------------------------

// Shiprocket Shipping Rates Endpoint (Zone 2)
app.post('/api/shipping-rates', zone2Limiter, async (req, res) => {
  try {
    const { delivery_postcode, weight = 0.5, cod = 0 } = req.body;
    const pickup_postcode = '643001'; // Defaulting to Ooty Nilgiris PIN code

    if (!delivery_postcode) {
      return res.status(400).json({ error: 'Delivery postcode is required' });
    }

    const token = await getShiprocketToken();
    if (!token) {
      return res.status(500).json({ error: 'Failed to authenticate with Shiprocket' });
    }

    // Shiprocket Serviceability API URL
    const apiUrl = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickup_postcode}&delivery_postcode=${delivery_postcode}&weight=${weight}&cod=${cod}`;

    const response = await fetch(apiUrl, {
      signal: AbortSignal.timeout(5000),
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.status === 200 && data.data && data.data.available_courier_companies.length > 0) {
      // Find the cheapest courier
      const couriers = data.data.available_courier_companies;
      const cheapest = couriers.reduce((prev, curr) => {
        return (prev.rate < curr.rate) ? prev : curr;
      });

      res.json({
        success: true,
        rate: cheapest.rate,
        courier_name: cheapest.courier_name,
        estimated_delivery_days: cheapest.etd
      });
    } else {
      // Fallback if no couriers available or invalid PIN
      res.json({
        success: false,
        message: 'Delivery not available to this PIN code, or invalid PIN.',
        fallback_rate: 150 // Standard fallback rate
      });
    }

  } catch (error) {
    console.error('Shiprocket Error:', error);
    // Return a fallback shipping rate if the API fails so checkout doesn't break
    res.json({
      success: false,
      message: 'Failed to fetch live rates',
      fallback_rate: 150
    });
  }
});

// Helper to generate Shiprocket Order Payload
const generateShiprocketPayload = (orderData) => {
  // Shiprocket strictly requires 10-digit phone numbers for India, no +91 or spaces
  const cleanPhone = (orderData.shippingInfo.phone || '9876543210').replace(/\D/g, '').slice(-10);
  
  return {
    order_id: orderData.orderId,
    order_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    pickup_location: 'Primary', // Default to 'Primary'. Must match Shiprocket dashboard exactly.
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
    payment_method: orderData.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
    sub_total: orderData.total,
    length: 10,
    breadth: 10,
    height: 10,
    weight: orderData.items.reduce((sum, item) => sum + (0.5 * item.quantity), 0)
  };
};

// Final Order Processing Endpoint (Zone 1)
app.post('/api/place-order', zone1Limiter, validate(orderSchema), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, couponCode } = req.body;

    // 1. VERIFY RAZORPAY SIGNATURE
    const bodyText = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(bodyText.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid Payment Signature' });
    }

    // 1.5 INCREMENT COUPON USAGE IF APPLIED
    if (couponCode) {
      const { data: couponData } = await supabaseAdmin
        .from('coupons')
        .select('id, times_used, usage_limit')
        .eq('code', couponCode)
        .single();
        
      if (couponData) {
        const newUses = (couponData.times_used || 0) + 1;
        const updates = { times_used: newUses };
        
        // Auto-disable if limit is reached
        if (couponData.usage_limit && newUses >= couponData.usage_limit) {
          updates.is_active = false;
        }

        await supabaseAdmin.from('coupons').update(updates).eq('id', couponData.id);
      }
    }

    // 2. FETCH PENDING ORDER AND UPDATE IT TO PAID
    const { data: pendingOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (fetchError || !pendingOrder) {
      return res.status(400).json({ error: 'Order not found in database.' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        razorpay_payment_id,
        payment_status: 'paid',
        status: 'Processing'
      })
      .eq('id', pendingOrder.id);

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
    }

    // Create a mock orderData object for emails and Shiprocket
    const orderData = {
      orderId: pendingOrder.id,
      userId: pendingOrder.user_id,
      total: pendingOrder.total_amount,
      shippingInfo: pendingOrder.shipping_info,
      items: pendingOrder.items
    };

    // 2.5 DISPATCH EMAILS (Async)
    try {
      if (process.env.RESEND_API_KEY) {
        if (orderData.shippingInfo.email) {
          resend.emails.send({
            from: 'Buddies Cafe <orders@danjoteas.com>', 
            to: orderData.shippingInfo.email,
            subject: `Order Confirmation #${orderData.orderId}`,
            html: generateCustomerReceipt(orderData)
          }).catch(e => console.error('Customer Email Error:', e));
        }

        resend.emails.send({
          from: 'Buddies Cafe <orders@danjoteas.com>',
          to: 'buddiescafecbe@gmail.com',
          subject: `New Order Alert! #${orderData.orderId}`,
          html: generateAdminAlert(orderData)
        }).catch(e => console.error('Admin Email Error:', e));
      }
    } catch (emailErr) {
      console.error('Email Dispatch Error:', emailErr);
    }

    // 3. CREATE ORDER IN SHIPROCKET
    let shiprocketResponse = null;
    const srToken = await getShiprocketToken();
    
    if (srToken) {
      try {
        const payload = generateShiprocketPayload(orderData);
        const srReq = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
          signal: AbortSignal.timeout(5000),
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${srToken}`
          },
          body: JSON.stringify(payload)
        });
        shiprocketResponse = await srReq.json();
        console.log('Shiprocket Response:', shiprocketResponse);
      } catch (err) {
        console.error('Shiprocket API Error:', err);
      }
    } else {
      console.error('Could not create Shiprocket order because srToken is missing.');
    }

    res.json({ success: true, message: 'Order created', id: pendingOrder.id });
  } catch (error) {
    console.error('Place Order Error:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Get Order details by ID securely (for guests/tracking)
app.get('/api/order/:id', zone1Limiter, optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    // Basic UUID format validation
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid order ID format' });
    }

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // BOLA FIX: If order belongs to a user, strictly enforce ownership
    if (order.user_id && (!req.user || req.user.id !== order.user_id)) {
      return res.status(403).json({ error: 'Forbidden: You do not own this order' });
    }

    // Only return safe fields to prevent leaking full customer data
    res.json({
      id: order.id,
      status: order.status,
      created_at: order.created_at,
      items: order.items,
      total_amount: order.total_amount
    });
  } catch (error) {
    console.error('Fetch Order Error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Final Order Processing Endpoint (Cash On Delivery)
app.post('/api/place-cod-order', zone1Limiter, optionalAuth, async (req, res) => {
  try {
    const { orderId, couponCode } = req.body;

    // 1. INCREMENT COUPON USAGE IF APPLIED
    if (couponCode) {
      const { data: couponData } = await supabaseAdmin
        .from('coupons')
        .select('id, times_used, usage_limit')
        .eq('code', couponCode)
        .single();
        
      if (couponData) {
        const newUses = (couponData.times_used || 0) + 1;
        const updates = { times_used: newUses };
        
        // Auto-disable if limit is reached
        if (couponData.usage_limit && newUses >= couponData.usage_limit) {
          updates.is_active = false;
        }

        await supabaseAdmin.from('coupons').update(updates).eq('id', couponData.id);
      }
    }

    // 2. FETCH PENDING ORDER AND UPDATE IT TO PROCESSING
    const { data: pendingOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !pendingOrder) {
      return res.status(400).json({ error: 'Order not found in database.' });
    }

    // BOLA FIX: Enforce ownership before allowing COD checkout
    if (pendingOrder.user_id && (!req.user || req.user.id !== pendingOrder.user_id)) {
      return res.status(403).json({ error: 'Forbidden: You do not own this order' });
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: 'pending', // COD is unpaid until delivery
        payment_method: 'cod',
        status: 'Processing'
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
    }

    // Create a mock orderData object for emails and Shiprocket
    const orderData = {
      orderId: pendingOrder.id,
      userId: pendingOrder.user_id,
      total: pendingOrder.total_amount,
      shippingInfo: pendingOrder.shipping_info,
      items: pendingOrder.items,
      paymentMethod: 'cod'
    };

    // 3. DISPATCH EMAILS (Async)
    try {
      if (process.env.RESEND_API_KEY) {
        if (orderData.shippingInfo.email) {
          resend.emails.send({
            from: 'Buddies Cafe <orders@danjoteas.com>', 
            to: orderData.shippingInfo.email,
            subject: `Order Confirmation #${orderData.orderId}`,
            html: generateCustomerReceipt(orderData)
          }).catch(e => console.error('Customer Email Error:', e));
        }

        resend.emails.send({
          from: 'Buddies Cafe <orders@danjoteas.com>',
          to: 'buddiescafecbe@gmail.com',
          subject: `New COD Order! #${orderData.orderId}`,
          html: generateAdminAlert(orderData)
        }).catch(e => console.error('Admin Email Error:', e));
      }
    } catch (emailErr) {
      console.error('Email Dispatch Error:', emailErr);
    }

    // 4. CREATE ORDER IN SHIPROCKET
    let shiprocketResponse = null;
    const srToken = await getShiprocketToken();
    
    if (srToken) {
      const payload = generateShiprocketPayload(orderData);
      const srReq = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
        signal: AbortSignal.timeout(5000),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${srToken}`
        },
        body: JSON.stringify(payload)
      });
      shiprocketResponse = await srReq.json();
    }

    res.json({
      success: true,
      message: 'COD Order Placed Successfully',
      shiprocket: shiprocketResponse
    });

  } catch (error) {
    console.error('Place COD Order Error:', error);
    res.status(500).json({ error: 'Failed to process COD order' });
  }
});

// Cancel Order Endpoint (Zone 1)
app.post('/api/cancel-order', zone1Limiter, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID is required' });
    }

    // Get order from supabase
    const { data: pendingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !pendingOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    // Update status to 'Cancelled'
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('id', orderId);

    if (updateError) {
      return res.status(500).json({ success: false, error: 'Failed to update order status' });
    }

    // Create orderData for email
    const orderData = {
      orderId: pendingOrder.id,
      userId: pendingOrder.user_id,
      total: pendingOrder.total_amount,
      shippingInfo: pendingOrder.shipping_info,
      items: pendingOrder.items
    };

    // Send cancellation email
    if (process.env.RESEND_API_KEY && orderData.shippingInfo && orderData.shippingInfo.email) {
      resend.emails.send({
        from: 'Buddies Cafe <orders@danjoteas.com>',
        to: orderData.shippingInfo.email,
        subject: `Order Cancelled #${orderData.orderId}`,
        html: generateOrderCancellationEmail(orderData)
      }).catch(e => console.error('Cancellation Email Error:', e));
    }

    return res.json({ success: true, message: 'Order cancelled and email sent' });
  } catch (err) {
    console.error('Cancel Order Error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

// Sanity Product Updater Endpoint (Zone 1)
app.post('/api/update-product', zone1Limiter, requireAdmin, async (req, res) => {
  try {
    const { productId, updates } = req.body;
    if (!productId || !updates) {
      return res.status(400).json({ error: 'Missing productId or updates' });
    }

    const result = await sanityClient.patch(productId).set(updates).commit();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Sanity Update Error:', error);
    res.status(500).json({ error: error.message || 'Failed to update product' });
  }
});

// --- SECURE COUPON MANAGEMENT (Requires Service Role Key) ---

app.post('/api/create-coupon', zone1Limiter, requireAdmin, async (req, res) => {
  try {
    const { code, discount_percent, type = 'percentage', min_cart_value = 0, usage_limit = null } = req.body;
    if (!code || discount_percent === undefined) return res.status(400).json({ error: 'Missing code or discount' });

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert([{ 
        code: code.toUpperCase(), 
        discount_percent,
        type,
        min_cart_value,
        usage_limit: usage_limit === '' ? null : usage_limit
      }])
      .select();

    if (error) throw error;
    res.json({ success: true, coupon: data[0] });
  } catch (error) {
    console.error('Create Coupon Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create coupon' });
  }
});

app.post('/api/toggle-coupon', zone1Limiter, requireAdmin, async (req, res) => {
  try {
    const { id, is_active } = req.body;
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update({ is_active })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, coupon: data[0] });
  } catch (error) {
    console.error('Toggle Coupon Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/delete-coupon', zone1Limiter, requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;
    const { error } = await supabaseAdmin
      .from('coupons')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete Coupon Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- SECURE SITE SETTINGS (Requires Service Role Key) ---
app.post('/api/update-settings', zone1Limiter, requireAdmin, async (req, res) => {
  try {
    const { store_email, store_phone, shipping_flat_rate, announcement_text, bulk_weight_options, maintenance_mode } = req.body;
    
    // Always update the row where id = 1
    const { data, error } = await supabaseAdmin
      .from('site_settings')
      .update({ 
        store_email, 
        store_phone, 
        shipping_flat_rate, 
        announcement_text,
        bulk_weight_options,
        maintenance_mode
      })
      .eq('id', 1)
      .select();

    if (error) throw error;
    res.json({ success: true, settings: data[0] });
  } catch (error) {
    console.error('Update Settings Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- ADMIN DATABASE BACKUP ---
app.get('/api/admin/backup-sql', requireAdmin, async (req, res) => {
  try {
    const generateInsert = (table, rows) => {
      if (!rows || rows.length === 0) return '';
      const keys = Object.keys(rows[0]);
      return rows.map(row => {
        const values = keys.map(k => {
          const val = row[k];
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return val;
        });
        return `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values.join(', ')});`;
      }).join('\n');
    };

    const fetchAll = async (table) => {
      const { data } = await supabaseAdmin.from(table).select('*');
      return data || [];
    };

    const profiles = await fetchAll('profiles');
    const orders = await fetchAll('orders');
    const coupons = await fetchAll('coupons');
    const settings = await fetchAll('site_settings');

    let sqlContent = `-- Database Backup Generated at ${new Date().toISOString()}\n\n`;
    sqlContent += `-- PROFILES\n${generateInsert('profiles', profiles)}\n\n`;
    sqlContent += `-- ORDERS\n${generateInsert('orders', orders)}\n\n`;
    sqlContent += `-- COUPONS\n${generateInsert('coupons', coupons)}\n\n`;
    sqlContent += `-- SITE_SETTINGS\n${generateInsert('site_settings', settings)}\n\n`;

    res.setHeader('Content-disposition', 'attachment; filename=buddiescafe_backup.sql');
    res.setHeader('Content-type', 'application/sql');
    res.send(sqlContent);
  } catch (err) {
    console.error('Backup Error:', err);
    res.status(500).send('Error generating backup');
  }
});

// --- JOURNAL POST CREATION ---
app.post('/api/create-journal-post', zone1Limiter, requireAdmin, async (req, res) => {
  try {
    const { title, slug, excerpt, content } = req.body;
    
    const doc = {
      _type: 'journalPost',
      title,
      slug: { _type: 'slug', current: slug },
      excerpt,
      content,
      publishedAt: new Date().toISOString()
    };
    
    const response = await sanityClient.create(doc);
    res.json({ success: true, post: response });
  } catch (error) {
    console.error('Create Journal Post Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- JOURNAL POST UPDATE ---
app.post('/api/update-journal-post', zone1Limiter, requireAdmin, async (req, res) => {
  try {
    const { id, updates } = req.body;
    if (!id || !updates) return res.status(400).json({ error: 'Missing id or updates' });
    
    if (updates.slug) {
      updates.slug = { _type: 'slug', current: updates.slug };
    }
    
    const response = await sanityClient.patch(id).set(updates).commit();
    res.json({ success: true, post: response });
  } catch (error) {
    console.error('Update Journal Post Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- CONTACT FORM SYSTEM ---
app.post('/api/submit-contact', contactFormLimiter, validate(contactSchema), async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    await resend.emails.send({
      from: 'Buddies Cafe <orders@danjoteas.com>',
      to: process.env.STORE_OWNER_EMAIL || 'buddiescafecbe@gmail.com',
      reply_to: email,
      subject: `New Contact Message: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>New Message from the Website ☕</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr/>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Submit Contact Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- N8N AI CHATBOT PROXY ---
app.post('/api/chat', aiLimiter, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return res.status(500).json({ error: 'Webhook URL not configured on server' });
    }

    const response = await fetch(webhookUrl, {
      signal: AbortSignal.timeout(5000),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
      throw new Error('Network response from n8n was not ok');
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy Chat Error:', error);
    res.status(500).json({ error: error.message || 'Failed to communicate with AI' });
  }
});

// --- BOOKINGS SYSTEM ---
app.get('/api/get-bookings', requireAdmin, async (req, res) => {
  try {
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, bookings: data });
  } catch (error) {
    console.error('Get Bookings Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/customers', requireAdmin, async (req, res) => {
  try {
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) throw error;
    res.json({ success: true, users: data.users });
  } catch (error) {
    console.error('Get Admin Customers Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- AUTHENTICATION (BYPASS SUPABASE LIMITS) ---
app.post('/api/auth/register', authLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 1. Generate a signup verification link without sending an email via Supabase
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      data: { full_name: name, phone }
    });

    if (error) {
      if (error.status === 422 && error.message.includes('already registered')) {
         return res.status(400).json({ error: 'User already registered' });
      }
      throw error;
    }

    const verificationLink = data.properties.action_link;

    // 2. Send the custom email using Resend
    const resendResponse = await resend.emails.send({
      from: 'Buddies Cafe <orders@danjoteas.com>',
      to: email,
      subject: 'Verify your Buddies Cafe Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2e4a3b;">Welcome to Buddies Cafe! ☕</h2>
          <p>Hi ${name},</p>
          <p>Thanks for joining us! Please verify your email address to activate your account and start exploring our curated tea collection.</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #4ade80; color: #0f172a; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">
            Verify Email Address
          </a>
          <p style="color: #666; font-size: 0.9em;">If the button above doesn't work, paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 0.8em;">${verificationLink}</p>
        </div>
      `
    });

    if (resendResponse.error) {
      // If Resend fails (e.g., free tier limitation), we should delete the user to allow retrying later.
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      throw new Error(resendResponse.error.message);
    }

    res.json({ success: true, message: 'Account created! Please check your email for the verification link.' });
  } catch (error) {
    console.error('Auth Register Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/delete-account', zone2Limiter, requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Anonymize Orders (so Admin Dashboard sales don't break)
    await supabaseAdmin
      .from('orders')
      .update({ user_id: null })
      .eq('user_id', userId);

    // 2. Delete user entirely from Auth. 
    // This will CASCADE delete their row in public.profiles.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) throw deleteError;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

app.post('/api/submit-booking', contactFormLimiter, validate(bookingSchema), async (req, res) => {
  try {
    const { experience_type, guests, date, time, full_name, phone, email, special_requests } = req.body;
    
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .insert([
        {
          experience_type,
          guests: parseInt(guests),
          date,
          time,
          full_name,
          phone,
          email,
          special_requests,
          status: 'pending'
        }
      ])
      .select();

    if (error) throw error;

    // Send email alert to admin
    try {
      await resend.emails.send({
        from: 'Buddies Cafe <orders@danjoteas.com>',
        to: process.env.STORE_OWNER_EMAIL || 'buddiescafecbe@gmail.com',
        subject: `New Booking Request: ${full_name}`,
        html: generateBookingAlert(req.body)
      });
    } catch (emailError) {
      console.error('Failed to send booking email:', emailError);
    }

    res.json({ success: true, booking: data[0] });
  } catch (error) {
    console.error('Submit Booking Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/update-booking-status', zone1Limiter, requireAdmin, async (req, res) => {
  try {
    const { id, status } = req.body;
    
    const supabaseAdmin = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabaseAdmin
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    const booking = data[0];

    // Send email to customer
    try {
      if (status === 'confirmed') {
        await resend.emails.send({
          from: 'Buddies Cafe <orders@danjoteas.com>',
          to: booking.email,
          subject: 'Your Reservation is Confirmed! 🎉',
          html: generateBookingConfirmedEmail(booking)
        });
      } else if (status === 'cancelled') {
        await resend.emails.send({
          from: 'Buddies Cafe <orders@danjoteas.com>',
          to: booking.email,
          subject: 'Update regarding your reservation request',
          html: generateBookingCancelledEmail(booking)
        });
      }
    } catch (emailError) {
      console.error('Failed to send customer notification email:', emailError);
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- SENTRY ERROR HANDLER ---
// ==========================================
// POST /api/support-tickets - Submit a complaint
// ==========================================
app.post('/api/support-tickets', ticketLimiter, requireAuth, async (req, res) => {
  try {
    const { orderId, issueType, message, imageUrl } = req.body;
    
    // BOLA FIX: Never trust userId from client
    const userId = req.user.id;

    if (!orderId || !issueType || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .insert([
        {
          order_id: orderId,
          user_id: userId,
          issue_type: issueType,
          message: message,
          image_url: imageUrl || null
        }
      ])
      .select();

    if (error) throw error;
    res.json({ success: true, ticket: data[0] });
  } catch (error) {
    console.error('Create Support Ticket Error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
});

// ==========================================
// GET /api/support-tickets - Get all complaints (Admin)
// ==========================================
app.get('/api/support-tickets', requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .select(`
        *,
        profiles ( email, full_name )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Fetch Support Tickets Error:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

// ==========================================
// PUT /api/support-tickets/:id - Update ticket status (Admin)
// ==========================================
app.put('/api/support-tickets/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Missing status' });

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, ticket: data[0] });
  } catch (error) {
    console.error('Update Support Ticket Error:', error);
    res.status(500).json({ error: 'Failed to update support ticket' });
  }
});

// Must be after all routes, but before any other error-handling middlewares
Sentry.setupExpressErrorHandler(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Razorpay Key ID loaded: ${!!process.env.RAZORPAY_KEY_SECRET ? 'Yes' : 'No'}`);
});
