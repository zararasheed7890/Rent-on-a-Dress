/**
 * ============================================================================
 * ROAD (Rent On A Dress) — Application & Supabase Configuration
 * ============================================================================
 * Connected to Supabase Project: scwazamgkrcznvvesebb
 */

const SAVED_URL = localStorage.getItem('ROAD_SUPABASE_URL') || '';
const SAVED_KEY = localStorage.getItem('ROAD_SUPABASE_ANON_KEY') || '';
const SAVED_WA = localStorage.getItem('ROAD_WHATSAPP_NUMBER') || '';

export const CONFIG = {
  BRAND_NAME: 'ROAD',
  BRAND_FULL_NAME: 'Rent On A Dress',

  // Live Supabase Project URL & Anon Key (derived from project ref: scwazamgkrcznvvesebb)
  SUPABASE_URL: SAVED_URL || 'https://scwazamgkrcznvvesebb.supabase.co',
  SUPABASE_ANON_KEY:
    SAVED_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd2F6YW1na3Jjem52dmVzZWJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1NzIwNjQsImV4cCI6MjExMDE0ODA2NH0.T8MHny_IG7SzsWKukR3unWb3Kv6dxeuQhEBGtrR5gE8',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_KZas0dzsjOVyMPKpuUc6bQ_RsI8MKtP',

  // Storage bucket name for dress images (created by supabase/schema.sql)
  STORAGE_BUCKET: 'dress-images',

  // Currency settings (PKR / Rs.)
  CURRENCY_SYMBOL: 'Rs.',
  CURRENCY_CODE: 'PKR',

  // Contact, WhatsApp & Showroom details
  SHOWROOM_PHONE: SAVED_WA || '+92 300 1234567',
  WHATSAPP_NUMBER: SAVED_WA || '923001234567',
  SHOWROOM_EMAIL: 'concierge@rentonadress.com',
  SHOWROOM_ADDRESS: 'Suite 4B, Fashion Avenue, Gulberg III, Lahore',
  SHOWROOM_HOURS: 'Mon – Sat: 11:00 AM – 8:00 PM'
};

/**
 * Helper to check if valid Supabase credentials have been provided
 */
export function isSupabaseConfigured() {
  return (
    Boolean(CONFIG.SUPABASE_URL) &&
    Boolean(CONFIG.SUPABASE_ANON_KEY) &&
    CONFIG.SUPABASE_URL !== 'YOUR_SUPABASE_PROJECT_URL' &&
    CONFIG.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_PUBLIC_KEY' &&
    CONFIG.SUPABASE_URL.startsWith('http')
  );
}

/**
 * Save Supabase credentials & WhatsApp number dynamically to localStorage
 */
export function saveSupabaseCredentials(url, anonKey, whatsappNumber) {
  if (url) localStorage.setItem('ROAD_SUPABASE_URL', url.trim());
  if (anonKey) localStorage.setItem('ROAD_SUPABASE_ANON_KEY', anonKey.trim());
  if (whatsappNumber !== undefined) {
    localStorage.setItem('ROAD_WHATSAPP_NUMBER', whatsappNumber.trim());
  }
}

/**
 * Format numeric price into clean currency string (e.g., "Rs. 8,500")
 */
export function formatPrice(amount) {
  const num = Number(amount) || 0;
  return `${CONFIG.CURRENCY_SYMBOL} ${num.toLocaleString('en-PK')}`;
}

/**
 * Builds a clean wa.me link with pre-filled text message
 */
export function buildWhatsAppUrl(message = '', targetPhone = '') {
  const rawPhone = targetPhone || CONFIG.WHATSAPP_NUMBER || '923001234567';
  let digits = String(rawPhone).replace(/[^0-9]/g, '');
  // Convert local Pakistani 03xx format to 923xx automatically
  if (digits.startsWith('03') && digits.length === 11) {
    digits = '92' + digits.slice(1);
  }
  const encodedMsg = encodeURIComponent(
    message || 'Hello ROAD Concierge! I would like to inquire about renting a dress.'
  );
  return `https://wa.me/${digits}?text=${encodedMsg}`;
}
