/**
 * ============================================================================
 * ROAD (Rent On A Dress) — Supabase Client & Data Service Layer
 * ============================================================================
 * Uses official @supabase/supabase-js v2 ES module.
 * Automatically queries live Supabase PostgreSQL, Auth, and Storage when
 * configured in js/config.js, with graceful local fallback prior to setup.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { CONFIG, isSupabaseConfigured } from './config.js';
import { INITIAL_CATEGORIES, INITIAL_DRESSES } from './seed-data.js';

let supabase = null;

if (isSupabaseConfigured()) {
  try {
    supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export { supabase };

// Local storage fallback keys (used only before Supabase credentials are set)
const LS_DRESSES = 'road_local_dresses';
const LS_CATEGORIES = 'road_local_categories';
const LS_INQUIRIES = 'road_local_inquiries';
const LS_DEMO_ADMIN = 'road_demo_admin_session';

function getLocalStore(key, initialData) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(initialData));
    return [...initialData];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [...initialData];
  }
}

function setLocalStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/* ============================================================================
   1. DRESSES CRUD
   ============================================================================ */

export async function getDresses() {
  if (supabase) {
    const { data, error } = await supabase
      .from('dresses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase dresses query notice (run supabase/schema.sql if tables are not created yet):', error.message);
      return getLocalStore(LS_DRESSES, INITIAL_DRESSES);
    }
    if (data && data.length > 0) return data;
    return INITIAL_DRESSES;
  }
  return getLocalStore(LS_DRESSES, INITIAL_DRESSES);
}

export async function getDressByIdOrSlug(identifier) {
  if (!identifier) return null;

  if (supabase) {
    // Try by slug or UUID id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    const column = isUuid ? 'id' : 'slug';
    const { data, error } = await supabase
      .from('dresses')
      .select('*')
      .eq(column, identifier)
      .maybeSingle();

    if (!error && data) return data;
  }

  const all = await getDresses();
  return all.find(d => String(d.id) === String(identifier) || d.slug === identifier) || null;
}

export async function createDress(dressPayload) {
  const slug = dressPayload.slug || `${slugify(dressPayload.name)}-${Date.now().toString().slice(-4)}`;
  const record = {
    name: dressPayload.name,
    slug,
    description: dressPayload.description || '',
    daily_price: Number(dressPayload.daily_price) || 0,
    retail_value: Number(dressPayload.retail_value) || 0,
    category_name: dressPayload.category_name || 'Evening',
    color: dressPayload.color || 'Champagne',
    sizes: Array.isArray(dressPayload.sizes) ? dressPayload.sizes : ['S', 'M', 'L'],
    images: Array.isArray(dressPayload.images) && dressPayload.images.length > 0
      ? dressPayload.images
      : ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85'],
    status: dressPayload.status || 'Available',
    stock: Number(dressPayload.stock ?? 1),
    is_featured: Boolean(dressPayload.is_featured),
    fabric_care: dressPayload.fabric_care || 'Dry clean only (Included in your ROAD rental)'
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('dresses')
      .insert([record])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const list = getLocalStore(LS_DRESSES, INITIAL_DRESSES);
  const created = { ...record, id: `dress-${Date.now()}`, created_at: new Date().toISOString() };
  list.unshift(created);
  setLocalStore(LS_DRESSES, list);
  return created;
}

export async function updateDress(id, updates) {
  if (supabase) {
    const { data, error } = await supabase
      .from('dresses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const list = getLocalStore(LS_DRESSES, INITIAL_DRESSES);
  const idx = list.findIndex(d => String(d.id) === String(id));
  if (idx === -1) throw new Error('Dress not found');
  list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
  setLocalStore(LS_DRESSES, list);
  return list[idx];
}

export async function deleteDress(id) {
  if (supabase) {
    const { error } = await supabase.from('dresses').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const list = getLocalStore(LS_DRESSES, INITIAL_DRESSES).filter(d => String(d.id) !== String(id));
  setLocalStore(LS_DRESSES, list);
  return true;
}

/* ============================================================================
   2. CATEGORIES CRUD
   ============================================================================ */

export async function getCategories() {
  if (supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('Supabase categories query notice:', error.message);
      return getLocalStore(LS_CATEGORIES, INITIAL_CATEGORIES);
    }
    if (data && data.length > 0) return data;
    return INITIAL_CATEGORIES;
  }
  return getLocalStore(LS_CATEGORIES, INITIAL_CATEGORIES);
}

export async function createCategory(catPayload) {
  const record = {
    name: catPayload.name.trim(),
    slug: slugify(catPayload.name),
    description: catPayload.description || '',
    image_url: catPayload.image_url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80'
  };

  if (supabase) {
    const { data, error } = await supabase
      .from('categories')
      .insert([record])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const list = getLocalStore(LS_CATEGORIES, INITIAL_CATEGORIES);
  const created = { ...record, id: `cat-${Date.now()}` };
  list.push(created);
  setLocalStore(LS_CATEGORIES, list);
  return created;
}

export async function deleteCategory(id) {
  if (supabase) {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const list = getLocalStore(LS_CATEGORIES, INITIAL_CATEGORIES).filter(c => String(c.id) !== String(id));
  setLocalStore(LS_CATEGORIES, list);
  return true;
}

/* ============================================================================
   3. BOOKING & CONTACT INQUIRIES
   ============================================================================ */

export async function createInquiry(payload) {
  const record = {
    inquiry_type: payload.inquiry_type || 'booking',
    dress_id: payload.dress_id && /^[0-9a-f-]{36}$/i.test(payload.dress_id) ? payload.dress_id : null,
    dress_name: payload.dress_name || null,
    selected_size: payload.selected_size || null,
    customer_name: payload.customer_name,
    customer_email: payload.customer_email,
    customer_phone: payload.customer_phone,
    start_date: payload.start_date || null,
    end_date: payload.end_date || null,
    rental_days: Number(payload.rental_days) || 1,
    estimated_total: payload.estimated_total ? Number(payload.estimated_total) : null,
    message: payload.message || '',
    status: 'Pending'
  };

  if (supabase) {
    const { error } = await supabase.from('inquiries').insert([record]);
    if (error) throw error;
    return record;
  }

  const list = getLocalStore(LS_INQUIRIES, []);
  const saved = { ...record, id: `inq-${Date.now()}`, created_at: new Date().toISOString() };
  list.unshift(saved);
  setLocalStore(LS_INQUIRIES, list);
  return saved;
}

export async function getInquiries() {
  if (supabase) {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase inquiries query notice:', error.message);
      return getLocalStore(LS_INQUIRIES, []);
    }
    return data || [];
  }
  return getLocalStore(LS_INQUIRIES, []);
}

export async function updateInquiryStatus(id, status) {
  if (supabase) {
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const list = getLocalStore(LS_INQUIRIES, []);
  const idx = list.findIndex(i => String(i.id) === String(id));
  if (idx !== -1) {
    list[idx].status = status;
    setLocalStore(LS_INQUIRIES, list);
  }
  return list[idx];
}

export async function deleteInquiry(id) {
  if (supabase) {
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const list = getLocalStore(LS_INQUIRIES, []).filter(i => String(i.id) !== String(id));
  setLocalStore(LS_INQUIRIES, list);
  return true;
}

/* ============================================================================
   4. SUPABASE STORAGE — MULTIPLE DRESS IMAGE UPLOAD
   ============================================================================ */

export async function uploadDressImages(files) {
  const uploadedUrls = [];

  for (const file of Array.from(files)) {
    if (supabase) {
      const ext = file.name.split('.').pop();
      const filePath = `dresses/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(CONFIG.STORAGE_BUCKET)
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(CONFIG.STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    } else {
      // Convert to Data URL in local demo mode before Supabase is connected
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      uploadedUrls.push(dataUrl);
    }
  }

  return uploadedUrls;
}

/* ============================================================================
   5. SUPABASE AUTHENTICATION (ADMIN PANEL)
   ============================================================================ */

export async function signInAdmin(email, password) {
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.session;
  }

  // Fallback demo login when Supabase is not yet connected
  if (email && password.length >= 4) {
    const demoSession = { user: { email, role: 'demo-admin' } };
    localStorage.setItem(LS_DEMO_ADMIN, JSON.stringify(demoSession));
    return demoSession;
  }
  throw new Error('Please enter a valid admin email and password.');
}

export async function signOutAdmin() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(LS_DEMO_ADMIN);
}

export async function getCurrentSession() {
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
  const raw = localStorage.getItem(LS_DEMO_ADMIN);
  return raw ? JSON.parse(raw) : null;
}
