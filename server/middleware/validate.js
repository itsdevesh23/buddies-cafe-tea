import { z } from 'zod';
import * as Sentry from '@sentry/node';

// ------------------------------------------------------------------
// Zod Schemas
// ------------------------------------------------------------------

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is too short").max(100, "Name is too long"),
    email: z.string().email("Invalid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters long")
      .max(100)
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    phone: z.string().max(20).optional().nullable()
  }).passthrough()
});

export const contactSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1).max(150),
    message: z.string().min(1).max(3000)
  }).passthrough()
});

export const bookingSchema = z.object({
  body: z.object({
    full_name: z.string().min(1).max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(5).max(20),
    date: z.string().min(1).max(50),
    time: z.string().min(1).max(50),
    guests: z.number().int().min(1).max(50),
    special_requests: z.string().max(2000).optional().nullable(),
    experience_type: z.string().optional()
  }).passthrough()
});

export const orderSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      id: z.string().uuid().optional().or(z.string()),
      originalId: z.string().optional(),
      name: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive()
    })).min(1, "Order must have at least one item"),
    shippingInfo: z.object({
      firstName: z.string().min(1).max(100),
      lastName: z.string().max(100).optional().nullable(),
      email: z.string().email(),
      phone: z.string().min(5).max(20),
      address: z.string().min(5).max(500),
      city: z.string().min(2).max(100),
      state: z.string().min(2).max(100),
      pinCode: z.string().min(4).max(20)
    }),
    couponCode: z.string().max(50).optional().nullable().or(z.literal(""))
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
    if (error instanceof z.ZodError) {
      // Log validation failures explicitly to Sentry for security auditing
      Sentry.captureMessage('Input Validation Failure', { 
        level: 'warning', 
        tags: { route: req.path },
        extra: { issues: error.errors, ip: req.ip }
      });
      
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      return res.status(400).json({ 
        error: 'Invalid input data', 
        details: formattedErrors 
      });
    }
    return res.status(500).json({ error: 'Internal Server Error during validation' });
  }
};
