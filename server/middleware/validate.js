import { z } from 'zod';
import * as Sentry from '@sentry/node';

// ------------------------------------------------------------------
// Zod Schemas
// ------------------------------------------------------------------

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(6, "Password must be at least 6 characters long")
      .max(100),
    phone: z.string().max(25).optional().nullable().or(z.literal(""))
  }).passthrough()
});

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required").max(150),
    message: z.string().min(1, "Message is required").max(3000)
  }).passthrough()
});

export const bookingSchema = z.object({
  body: z.object({
    full_name: z.string().min(1, "Full name is required").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(5, "Phone number is too short").max(25),
    date: z.string().min(1, "Date is required").max(50),
    time: z.string().min(1, "Time is required").max(50),
    guests: z.number().int().min(1).max(50),
    special_requests: z.string().max(2000).optional().nullable().or(z.literal("")),
    experience_type: z.string().optional()
  }).passthrough()
});

export const orderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      id: z.string().optional().or(z.string()),
      originalId: z.string().optional(),
      name: z.string(),
      price: z.number(),
      quantity: z.number()
    }).passthrough()).min(1, "Order must have at least one item"),
    shippingInfo: z.object({
      firstName: z.string().min(1, "First name is required").max(100),
      lastName: z.string().max(100).optional().nullable().or(z.literal("")),
      email: z.string().email("Please provide a valid email address"),
      phone: z.string().min(5, "Phone number is too short").max(25, "Phone number is too long"),
      address: z.string().min(1, "Address is required").max(500),
      city: z.string().min(1, "City is required").max(100),
      state: z.string().min(1, "State is required").max(100),
      pinCode: z.string().min(3, "PIN code is too short").max(20)
    }).passthrough(),
    couponCode: z.string().max(50).optional().nullable().or(z.literal("")),
    paymentMethod: z.string().optional(),
    shippingCost: z.number().optional().nullable(),
    userId: z.string().optional().nullable()
  }).passthrough()
});

// ------------------------------------------------------------------
// Validation Middleware
// ------------------------------------------------------------------

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    if (error instanceof z.ZodError || error.issues) {
      const issues = error.issues || error.errors || [];
      // Log validation failures explicitly to Sentry for security auditing
      try {
        Sentry.captureMessage('Input Validation Failure', { 
          level: 'warning', 
          tags: { route: req.path },
          extra: { issues, ip: req.ip }
        });
      } catch (_) {}
      
      const formattedErrors = issues.map((err) => ({
        field: err.path ? err.path.join('.') : 'unknown',
        message: err.message,
      }));
      
      const firstErrorMessage = formattedErrors[0]?.message || 'Invalid input data';
      
      return res.status(400).json({ 
        error: firstErrorMessage, 
        details: formattedErrors 
      });
    }
    return res.status(500).json({ error: 'Internal Server Error during validation' });
  }
};

