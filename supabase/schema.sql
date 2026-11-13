-- ============================================================================
-- ROAD (Rent On A Dress) — Complete Supabase PostgreSQL Schema, RLS & Storage
-- Run this entire script inside your Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- 1A. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1B. Dresses Table
CREATE TABLE IF NOT EXISTS public.dresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  daily_price NUMERIC(10, 2) NOT NULL CHECK (daily_price >= 0),
  retail_value NUMERIC(10, 2) DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL DEFAULT 'Evening',
  color TEXT NOT NULL DEFAULT 'Champagne',
  sizes TEXT[] NOT NULL DEFAULT ARRAY['S', 'M', 'L'],
  images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Rented', 'Maintenance')),
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  fabric_care TEXT DEFAULT 'Dry clean only (Included in your ROAD rental)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1C. Booking & Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type TEXT NOT NULL DEFAULT 'booking' CHECK (inquiry_type IN ('booking', 'general')),
  dress_id UUID REFERENCES public.dresses(id) ON DELETE SET NULL,
  dress_name TEXT,
  selected_size TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  rental_days INTEGER DEFAULT 1,
  estimated_total NUMERIC(10, 2),
  message TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast filtering and sorting
CREATE INDEX IF NOT EXISTS idx_dresses_category_name ON public.dresses(category_name);
CREATE INDEX IF NOT EXISTS idx_dresses_status ON public.dresses(status);
CREATE INDEX IF NOT EXISTS idx_dresses_featured ON public.dresses(is_featured);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- Trigger to auto-update updated_at on dresses
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_dresses_updated_at ON public.dresses;
CREATE TRIGGER set_dresses_updated_at
BEFORE UPDATE ON public.dresses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Categories Policies: Everyone can view; Authenticated Admin can insert/update/delete
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Dresses Policies: Everyone can view; Authenticated Admin can insert/update/delete
DROP POLICY IF EXISTS "Public can read dresses" ON public.dresses;
CREATE POLICY "Public can read dresses"
  ON public.dresses FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage dresses" ON public.dresses;
CREATE POLICY "Admins can manage dresses"
  ON public.dresses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Inquiries Policies: Public can submit inquiries (INSERT); Authenticated Admin can read/update/delete
DROP POLICY IF EXISTS "Public can submit inquiries" ON public.inquiries;
CREATE POLICY "Public can submit inquiries"
  ON public.inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view and manage inquiries" ON public.inquiries;
CREATE POLICY "Admins can view and manage inquiries"
  ON public.inquiries FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 3. STORAGE BUCKET & POLICIES FOR DRESS IMAGES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('dress-images', 'dress-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to dress images
DROP POLICY IF EXISTS "Public Access to Dress Images" ON storage.objects;
CREATE POLICY "Public Access to Dress Images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dress-images');

-- Allow authenticated admins to upload dress images
DROP POLICY IF EXISTS "Admins can upload Dress Images" ON storage.objects;
CREATE POLICY "Admins can upload Dress Images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dress-images');

-- Allow authenticated admins to update/delete dress images
DROP POLICY IF EXISTS "Admins can update Dress Images" ON storage.objects;
CREATE POLICY "Admins can update Dress Images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'dress-images');

DROP POLICY IF EXISTS "Admins can delete Dress Images" ON storage.objects;
CREATE POLICY "Admins can delete Dress Images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'dress-images');

-- ============================================================================
-- 4. INITIAL LUXURY SEED DATA (Categories & Dresses in PKR)
-- ============================================================================

INSERT INTO public.categories (name, slug, description, image_url)
VALUES
  ('Evening', 'evening', 'Floor-sweeping couture silhouettes crafted for black-tie galas and enchanting evenings.', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80'),
  ('Cocktail', 'cocktail', 'Playful yet poised midi and mini dresses designed for soirées, dinners, and rooftop celebrations.', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80'),
  ('Formal', 'formal', 'Structured luxury gowns and red-carpet statements that command every room.', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80'),
  ('Bridal Guest', 'bridal-guest', 'Romantic pastels, silk drapes, and delicate embellishments for wedding guests.', 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.dresses (name, slug, description, daily_price, retail_value, category_name, color, sizes, images, status, stock, is_featured, fabric_care)
VALUES
  (
    'Aurelia Champagne Silk Gown',
    'aurelia-champagne-silk-gown',
    'Cut on the bias from liquid Mulberry silk charmeuse, the Aurelia Gown features a cowl neckline, delicate criss-cross back straps, and a sweeping train that catches candlelit rooms effortlessly.',
    8500,
    95000,
    'Evening',
    'Champagne',
    ARRAY['XS', 'S', 'M', 'L'],
    ARRAY[
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85'
    ],
    'Available',
    2,
    true,
    '100% Mulberry Silk. Complimentary specialist dry-cleaning included.'
  ),
  (
    'Seraphina Blush Tulle Midi',
    'seraphina-blush-tulle-midi',
    'Whisper-soft layers of pleated French tulle in a romantic petal blush hue. Complete with a boned corset bodice and sweetheart neckline for effortless grace at weddings and cocktail receptions.',
    6500,
    68000,
    'Bridal Guest',
    'Blush Pink',
    ARRAY['XS', 'S', 'M'],
    ARRAY[
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=85'
    ],
    'Available',
    3,
    true,
    'French Tulle & Silk Organza lining. Handled by ROAD concierge care.'
  ),
  (
    'Celeste Emerald Velvet Column',
    'celeste-emerald-velvet-column',
    'Sculptural off-the-shoulder column gown crafted from plush Italian silk velvet in deep jewel emerald. Features an internal corset structure and a subtle side slit for poised movement.',
    9500,
    115000,
    'Formal',
    'Emerald',
    ARRAY['S', 'M', 'L'],
    ARRAY[
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85'
    ],
    'Available',
    1,
    true,
    'Italian Silk Blend Velvet. Steam only; professional cleaning included.'
  ),
  (
    'Vivienne Noir Asymmetric Cocktail',
    'vivienne-noir-asymmetric-cocktail',
    'Architectural one-shoulder cocktail dress in heavyweight crepe with a crystal-trimmed neckline bow. Tailored to flatter the waist and hit just below the knee.',
    5500,
    54000,
    'Cocktail',
    'Black',
    ARRAY['XS', 'S', 'M', 'L'],
    ARRAY[
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85'
    ],
    'Available',
    2,
    true,
    'Stretch Couture Crepe with Swarovski crystal trim.'
  ),
  (
    'Dahlia Rose Gold Sequin Gown',
    'dahlia-rose-gold-sequin-gown',
    'Hand-embroidered micro-sequins in warm rose gold over nude illusion mesh. Designed to shimmer under evening lights with a draped cape sleeve silhouette.',
    11000,
    130000,
    'Evening',
    'Gold',
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY[
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85'
    ],
    'Available',
    1,
    false,
    'Hand-beaded tulle. Do not iron; full care handled by ROAD.'
  ),
  (
    'Margaux Ivory Satin Slip Midi',
    'margaux-ivory-satin-slip-midi',
    'Minimalist Parisian elegance in luminous pearl-ivory duchesse satin. Features a draped boat neckline and low scoop back, ideal for engagement dinners and formal soirées.',
    5000,
    48000,
    'Cocktail',
    'Ivory',
    ARRAY['XS', 'S', 'M'],
    ARRAY[
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85'
    ],
    'Available',
    2,
    false,
    'Heavyweight Duchesse Satin. Dry clean included.'
  ),
  (
    'Isolde Crimson Draped Ballgown',
    'isolde-crimson-draped-ballgown',
    'Show-stopping ruby crimson chiffon gown with hand-pleated Grecian bodice and flowing floor-length skirt. Moves like poetry on the dancefloor.',
    9000,
    105000,
    'Formal',
    'Red',
    ARRAY['S', 'M', 'L'],
    ARRAY[
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85'
    ],
    'Available',
    1,
    false,
    '100% Silk Chiffon. Specialist care included.'
  ),
  (
    'Camille Dusty Rose Lace Gown',
    'camille-dusty-rose-lace-gown',
    'Chantilly lace overlay in soft dusty rose with scalloped eyelash trim, sheer three-quarter sleeves, and a flattering A-line skirt.',
    7500,
    82000,
    'Bridal Guest',
    'Blush Pink',
    ARRAY['S', 'M', 'L', 'XL'],
    ARRAY[
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85'
    ],
    'Available',
    2,
    false,
    'French Chantilly Lace. Specialist dry-cleaning included.'
  )
ON CONFLICT (slug) DO NOTHING;
