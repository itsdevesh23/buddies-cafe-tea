const { Client } = require('pg');

const connectionString = 'postgresql://postgres:Tea123estat@db.pbopkpoyjwvlgnvrbrpj.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
});

const setupDatabase = async () => {
  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL database.');

    const createTablesQuery = `
      -- Create Profiles Table
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        full_name TEXT,
        shipping_address JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Create Wishlists Table
      CREATE TABLE IF NOT EXISTS public.wishlists (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        product_slug TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, product_slug)
      );

      -- Create Orders Table
      CREATE TABLE IF NOT EXISTS public.orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        total_amount NUMERIC(10, 2) NOT NULL,
        shipping_info JSONB,
        items JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Add Payment and Shipping Tracking Columns safely
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT;
      ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

      -- Create Reservations Table
      CREATE TABLE IF NOT EXISTS public.reservations (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        type TEXT NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        guests INTEGER NOT NULL,
        special_requests TEXT,
        status TEXT DEFAULT 'confirmed',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Function to automatically create profile on signup
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, full_name)
        VALUES (new.id, new.raw_user_meta_data->>'full_name');
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Trigger for new user
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

    `;

    console.log('Creating tables and functions...');
    await client.query(createTablesQuery);
    console.log('Database setup complete!');

  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await client.end();
  }
};

setupDatabase();
