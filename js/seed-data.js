/**
 * ============================================================================
 * ROAD (Rent On A Dress) — Fallback / Initial Luxury Catalogue Data
 * Used automatically if Supabase credentials are not yet configured or if
 * the database tables are empty prior to running supabase/schema.sql.
 * ============================================================================
 */

export const INITIAL_CATEGORIES = [
  {
    id: 'cat-evening',
    name: 'Evening',
    slug: 'evening',
    description: 'Floor-sweeping couture silhouettes crafted for black-tie galas and enchanting evenings.',
    image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'cat-cocktail',
    name: 'Cocktail',
    slug: 'cocktail',
    description: 'Playful yet poised midi and mini dresses designed for soirées, dinners, and rooftop celebrations.',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'cat-formal',
    name: 'Formal',
    slug: 'formal',
    description: 'Structured luxury gowns and red-carpet statements that command every room.',
    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'cat-bridal-guest',
    name: 'Bridal Guest',
    slug: 'bridal-guest',
    description: 'Romantic pastels, silk drapes, and delicate embellishments for wedding guests.',
    image_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=900&q=80'
  }
];

export const INITIAL_DRESSES = [
  {
    id: 'dress-1',
    name: 'Aurelia Champagne Silk Gown',
    slug: 'aurelia-champagne-silk-gown',
    description: 'Cut on the bias from liquid Mulberry silk charmeuse, the Aurelia Gown features a cowl neckline, delicate criss-cross back straps, and a sweeping train that catches candlelit rooms effortlessly.',
    daily_price: 8500,
    retail_value: 95000,
    category_name: 'Evening',
    color: 'Champagne',
    sizes: ['XS', 'S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=85'
    ],
    status: 'Available',
    stock: 2,
    is_featured: true,
    fabric_care: '100% Mulberry Silk. Complimentary specialist dry-cleaning included.'
  },
  {
    id: 'dress-2',
    name: 'Seraphina Blush Tulle Midi',
    slug: 'seraphina-blush-tulle-midi',
    description: 'Whisper-soft layers of pleated French tulle in a romantic petal blush hue. Complete with a boned corset bodice and sweetheart neckline for effortless grace at weddings and cocktail receptions.',
    daily_price: 6500,
    retail_value: 68000,
    category_name: 'Bridal Guest',
    color: 'Blush Pink',
    sizes: ['XS', 'S', 'M'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=85'
    ],
    status: 'Available',
    stock: 3,
    is_featured: true,
    fabric_care: 'French Tulle & Silk Organza lining. Handled by ROAD concierge care.'
  },
  {
    id: 'dress-3',
    name: 'Celeste Emerald Velvet Column',
    slug: 'celeste-emerald-velvet-column',
    description: 'Sculptural off-the-shoulder column gown crafted from plush Italian silk velvet in deep jewel emerald. Features an internal corset structure and a subtle side slit for poised movement.',
    daily_price: 9500,
    retail_value: 115000,
    category_name: 'Formal',
    color: 'Emerald',
    sizes: ['S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85'
    ],
    status: 'Available',
    stock: 1,
    is_featured: true,
    fabric_care: 'Italian Silk Blend Velvet. Steam only; professional cleaning included.'
  },
  {
    id: 'dress-4',
    name: 'Vivienne Noir Asymmetric Cocktail',
    slug: 'vivienne-noir-asymmetric-cocktail',
    description: 'Architectural one-shoulder cocktail dress in heavyweight crepe with a crystal-trimmed neckline bow. Tailored to flatter the waist and hit just below the knee.',
    daily_price: 5500,
    retail_value: 54000,
    category_name: 'Cocktail',
    color: 'Black',
    sizes: ['XS', 'S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85'
    ],
    status: 'Available',
    stock: 2,
    is_featured: true,
    fabric_care: 'Stretch Couture Crepe with Swarovski crystal trim.'
  },
  {
    id: 'dress-5',
    name: 'Dahlia Rose Gold Sequin Gown',
    slug: 'dahlia-rose-gold-sequin-gown',
    description: 'Hand-embroidered micro-sequins in warm rose gold over nude illusion mesh. Designed to shimmer under evening lights with a draped cape sleeve silhouette.',
    daily_price: 11000,
    retail_value: 130000,
    category_name: 'Evening',
    color: 'Gold',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85'
    ],
    status: 'Available',
    stock: 1,
    is_featured: false,
    fabric_care: 'Hand-beaded tulle. Do not iron; full care handled by ROAD.'
  },
  {
    id: 'dress-6',
    name: 'Margaux Ivory Satin Slip Midi',
    slug: 'margaux-ivory-satin-slip-midi',
    description: 'Minimalist Parisian elegance in luminous pearl-ivory duchesse satin. Features a draped boat neckline and low scoop back, ideal for engagement dinners and formal soirées.',
    daily_price: 5000,
    retail_value: 48000,
    category_name: 'Cocktail',
    color: 'Ivory',
    sizes: ['XS', 'S', 'M'],
    images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=85'
    ],
    status: 'Available',
    stock: 2,
    is_featured: false,
    fabric_care: 'Heavyweight Duchesse Satin. Dry clean included.'
  },
  {
    id: 'dress-7',
    name: 'Isolde Crimson Draped Ballgown',
    slug: 'isolde-crimson-draped-ballgown',
    description: 'Show-stopping ruby crimson chiffon gown with hand-pleated Grecian bodice and flowing floor-length skirt. Moves like poetry on the dancefloor.',
    daily_price: 9000,
    retail_value: 105000,
    category_name: 'Formal',
    color: 'Red',
    sizes: ['S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85'
    ],
    status: 'Available',
    stock: 1,
    is_featured: false,
    fabric_care: '100% Silk Chiffon. Specialist care included.'
  },
  {
    id: 'dress-8',
    name: 'Camille Dusty Rose Lace Gown',
    slug: 'camille-dusty-rose-lace-gown',
    description: 'Chantilly lace overlay in soft dusty rose with scalloped eyelash trim, sheer three-quarter sleeves, and a flattering A-line skirt.',
    daily_price: 7500,
    retail_value: 82000,
    category_name: 'Bridal Guest',
    color: 'Blush Pink',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=85'
    ],
    status: 'Available',
    stock: 2,
    is_featured: false,
    fabric_care: 'French Chantilly Lace. Specialist dry-cleaning included.'
  }
];
