/**
 * ============================================================================
 * ROAD (Rent On A Dress) — Admin Panel Controller (js/admin.js)
 * ============================================================================
 * Protected by Supabase Auth.
 * Features: Dashboard Stats, Dresses CRUD + Supabase Storage Multi-Image Upload,
 * Categories CRUD, and Booking Inquiries Management.
 */

import {
  CONFIG,
  isSupabaseConfigured,
  saveSupabaseCredentials,
  formatPrice,
  buildWhatsAppUrl
} from './config.js';
import {
  getDresses,
  createDress,
  updateDress,
  deleteDress,
  getCategories,
  createCategory,
  deleteCategory,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
  uploadDressImages,
  signInAdmin,
  signOutAdmin,
  getCurrentSession
} from './supabase-client.js';
import { escapeHtml, showToast } from './ui.js';

let adminDresses = [];
let adminCategories = [];
let adminInquiries = [];
let modalImages = [];

document.addEventListener('DOMContentLoaded', async () => {
  updateConnectionStatusBadge();
  bindAuthHandlers();
  bindNavigationTabs();
  bindDressModalHandlers();
  bindCategoryFormHandlers();
  bindSupabaseConfigModal();

  const session = await getCurrentSession();
  if (session) {
    showDashboardView(session);
  } else {
    showLoginView();
  }
});

function updateConnectionStatusBadge() {
  const badges = document.querySelectorAll('.supabase-status-indicator');
  const connected = isSupabaseConfigured();
  badges.forEach(badge => {
    badge.className = `badge supabase-status-indicator ${connected ? 'badge-available' : 'badge-rented'}`;
    badge.textContent = connected ? '● Supabase Connected' : '● Local Demo Mode (Click to Connect Supabase)';
  });
}

function showLoginView() {
  document.getElementById('admin-auth-view')?.classList.remove('hidden');
  document.getElementById('admin-dashboard-view')?.classList.add('hidden');
}

async function showDashboardView(session) {
  document.getElementById('admin-auth-view')?.classList.add('hidden');
  document.getElementById('admin-dashboard-view')?.classList.remove('hidden');

  const emailEl = document.getElementById('admin-user-email');
  if (emailEl) {
    emailEl.textContent = session?.user?.email || 'Admin User';
  }

  await refreshAllAdminData();
}

function bindAuthHandlers() {
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('admin-logout-btn');

  loginForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('admin-email')?.value.trim();
    const password = document.getElementById('admin-password')?.value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
      }
      const session = await signInAdmin(email, password);
      showToast('Welcome to the ROAD Admin Portal.', 'success');
      await showDashboardView(session);
    } catch (err) {
      console.error('Login error:', err);
      showToast(err.message || 'Invalid login credentials.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to Dashboard';
      }
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    await signOutAdmin();
    showToast('Signed out of Admin Portal.', 'info');
    showLoginView();
  });
}

function bindNavigationTabs() {
  const navBtns = document.querySelectorAll('[data-admin-tab]');
  const sections = document.querySelectorAll('.admin-tab-section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.adminTab;
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      sections.forEach(sec => {
        sec.classList.toggle('hidden', sec.id !== `tab-${targetTab}`);
      });
    });
  });
}

export async function refreshAllAdminData() {
  try {
    const [dresses, categories, inquiries] = await Promise.all([
      getDresses(),
      getCategories(),
      getInquiries()
    ]);

    adminDresses = dresses;
    adminCategories = categories;
    adminInquiries = inquiries;

    renderStatsOverview();
    renderDressesTable();
    renderCategoriesTable();
    renderInquiriesTable();
    populateDressCategorySelect();
  } catch (err) {
    console.error('Error loading admin data:', err);
    showToast('Error loading dashboard data: ' + (err.message || ''), 'error');
  }
}

/* ============================================================================
   1. STATS & OVERVIEW
   ============================================================================ */

function renderStatsOverview() {
  const totalDressesEl = document.getElementById('stat-total-dresses');
  const availableDressesEl = document.getElementById('stat-available-dresses');
  const totalCategoriesEl = document.getElementById('stat-total-categories');
  const pendingInquiriesEl = document.getElementById('stat-pending-inquiries');

  if (totalDressesEl) totalDressesEl.textContent = String(adminDresses.length);
  if (availableDressesEl) {
    availableDressesEl.textContent = String(
      adminDresses.filter(d => d.status === 'Available').length
    );
  }
  if (totalCategoriesEl) totalCategoriesEl.textContent = String(adminCategories.length);
  if (pendingInquiriesEl) {
    pendingInquiriesEl.textContent = String(
      adminInquiries.filter(i => i.status === 'Pending').length
    );
  }
}

/* ============================================================================
   2. MANAGE DRESSES TABLE & MODAL
   ============================================================================ */

function renderDressesTable() {
  const tbody = document.getElementById('admin-dresses-tbody');
  if (!tbody) return;

  if (adminDresses.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 32px;">No dresses in catalogue yet. Click "+ Add New Dress" to create one.</td></tr>`;
    return;
  }

  tbody.innerHTML = adminDresses
    .map(dress => {
      const thumb = (dress.images && dress.images[0])
        || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=300&q=80';
      const sizes = Array.isArray(dress.sizes) ? dress.sizes.join(', ') : '';
      const statusBadge =
        dress.status === 'Available'
          ? 'badge-available'
          : dress.status === 'Rented'
          ? 'badge-rented'
          : 'badge-maintenance';

      return `
        <tr>
          <td>
            <div class="table-dress-cell">
              <img src="${escapeHtml(thumb)}" alt="${escapeHtml(dress.name)}" class="table-dress-thumb" />
              <div>
                <div style="font-weight: 600; color: var(--color-text-primary);">${escapeHtml(dress.name)}</div>
                <div style="font-size: var(--text-xs); color: var(--color-text-muted);">${escapeHtml(dress.color || '')} ${dress.is_featured ? '• ★ Featured' : ''}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(dress.category_name || 'Evening')}</td>
          <td style="font-weight: 600;">${escapeHtml(formatPrice(dress.daily_price))}</td>
          <td><span style="font-size: var(--text-xs);">${escapeHtml(sizes)}</span></td>
          <td>
            <span class="badge ${statusBadge}">${escapeHtml(dress.status || 'Available')}</span>
            <span style="font-size: var(--text-xs); color: var(--color-text-muted); margin-left:4px;">(Qty: ${Number(dress.stock ?? 1)})</span>
          </td>
          <td>
            <div class="action-btns">
              <button type="button" class="btn-icon" data-edit-dress="${escapeHtml(dress.id)}">Edit</button>
              <button type="button" class="btn-icon danger" data-delete-dress="${escapeHtml(dress.id)}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  tbody.querySelectorAll('[data-edit-dress]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dress = adminDresses.find(d => String(d.id) === String(btn.dataset.editDress));
      if (dress) openDressModal(dress);
    });
  });

  tbody.querySelectorAll('[data-delete-dress]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteDress;
      const dress = adminDresses.find(d => String(d.id) === String(id));
      if (!confirm(`Are you sure you want to delete "${dress?.name || 'this dress'}"?`)) return;
      try {
        await deleteDress(id);
        showToast('Dress deleted.', 'info');
        await refreshAllAdminData();
      } catch (err) {
        showToast(err.message || 'Failed to delete dress.', 'error');
      }
    });
  });
}

function populateDressCategorySelect() {
  const select = document.getElementById('dress-category-input');
  if (!select) return;
  const names = adminCategories.length > 0
    ? adminCategories.map(c => c.name)
    : ['Evening', 'Cocktail', 'Formal', 'Bridal Guest'];

  select.innerHTML = names
    .map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`)
    .join('');
}

function openDressModal(dress = null) {
  const modal = document.getElementById('dress-form-modal');
  const titleEl = document.getElementById('dress-modal-title');
  const form = document.getElementById('admin-dress-form');

  form?.reset();
  document.getElementById('dress-id-input').value = dress ? dress.id : '';
  if (titleEl) {
    titleEl.textContent = dress ? `Edit Dress: ${dress.name}` : 'Add New Couture Dress';
  }

  if (dress) {
    document.getElementById('dress-name-input').value = dress.name || '';
    document.getElementById('dress-price-input').value = dress.daily_price || '';
    document.getElementById('dress-retail-input').value = dress.retail_value || '';
    document.getElementById('dress-category-input').value = dress.category_name || 'Evening';
    document.getElementById('dress-color-input').value = dress.color || 'Champagne';
    document.getElementById('dress-status-input').value = dress.status || 'Available';
    document.getElementById('dress-stock-input').value = dress.stock ?? 1;
    document.getElementById('dress-featured-input').checked = Boolean(dress.is_featured);
    document.getElementById('dress-desc-input').value = dress.description || '';
    document.getElementById('dress-care-input').value = dress.fabric_care || '';

    const dressSizes = Array.isArray(dress.sizes) ? dress.sizes : ['S', 'M', 'L'];
    document.querySelectorAll('input[name="dress-sizes"]').forEach(cb => {
      cb.checked = dressSizes.includes(cb.value);
    });

    modalImages = Array.isArray(dress.images) ? [...dress.images] : [];
  } else {
    document.querySelectorAll('input[name="dress-sizes"]').forEach(cb => {
      cb.checked = ['S', 'M', 'L'].includes(cb.value);
    });
    modalImages = [];
  }

  renderModalImagePreviews();
  modal?.classList.add('open');
}

function renderModalImagePreviews() {
  const previewContainer = document.getElementById('dress-image-previews');
  if (!previewContainer) return;

  if (modalImages.length === 0) {
    previewContainer.innerHTML = `<p style="grid-column: 1 / -1; font-size: var(--text-xs); color: var(--color-text-muted);">No images added yet. Upload files or paste an image URL above.</p>`;
    return;
  }

  previewContainer.innerHTML = modalImages
    .map(
      (url, idx) => `
      <div class="image-preview-item">
        <img src="${escapeHtml(url)}" alt="Preview ${idx + 1}" />
        <button type="button" class="image-preview-remove" data-remove-img="${idx}" title="Remove image">&times;</button>
      </div>
    `
    )
    .join('');

  previewContainer.querySelectorAll('[data-remove-img]').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = Number(btn.dataset.removeImg);
      modalImages.splice(index, 1);
      renderModalImagePreviews();
    });
  });
}

function bindDressModalHandlers() {
  const addBtns = document.querySelectorAll('.open-add-dress-btn');
  const closeBtn = document.getElementById('dress-modal-close');
  const modal = document.getElementById('dress-form-modal');
  const fileInput = document.getElementById('dress-images-file-input');
  const addUrlBtn = document.getElementById('add-image-url-btn');
  const urlInput = document.getElementById('dress-image-url-input');
  const form = document.getElementById('admin-dress-form');

  addBtns.forEach(btn => btn.addEventListener('click', () => openDressModal(null)));
  closeBtn?.addEventListener('click', () => modal?.classList.remove('open'));
  modal?.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });

  // Upload multiple files to Supabase Storage
  fileInput?.addEventListener('change', async e => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const statusText = document.getElementById('upload-status-text');
    try {
      if (statusText) statusText.textContent = `Uploading ${files.length} image(s)...`;
      const urls = await uploadDressImages(files);
      modalImages.push(...urls);
      renderModalImagePreviews();
      showToast(`${urls.length} image(s) added!`, 'success');
    } catch (err) {
      console.error('Upload error:', err);
      showToast('Image upload failed: ' + (err.message || ''), 'error');
    } finally {
      if (statusText) statusText.textContent = 'Click to upload multiple dress photos (JPG, PNG, WebP)';
      fileInput.value = '';
    }
  });

  // Add image by direct URL
  addUrlBtn?.addEventListener('click', () => {
    const url = urlInput?.value.trim();
    if (!url) return;
    modalImages.push(url);
    urlInput.value = '';
    renderModalImagePreviews();
  });

  // Save Dress (Create or Update)
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('dress-id-input')?.value;
    const checkedSizes = Array.from(document.querySelectorAll('input[name="dress-sizes"]:checked')).map(
      cb => cb.value
    );

    const payload = {
      name: document.getElementById('dress-name-input')?.value.trim(),
      daily_price: Number(document.getElementById('dress-price-input')?.value) || 0,
      retail_value: Number(document.getElementById('dress-retail-input')?.value) || 0,
      category_name: document.getElementById('dress-category-input')?.value || 'Evening',
      color: document.getElementById('dress-color-input')?.value.trim() || 'Champagne',
      status: document.getElementById('dress-status-input')?.value || 'Available',
      stock: Number(document.getElementById('dress-stock-input')?.value ?? 1),
      is_featured: Boolean(document.getElementById('dress-featured-input')?.checked),
      description: document.getElementById('dress-desc-input')?.value.trim(),
      fabric_care: document.getElementById('dress-care-input')?.value.trim(),
      sizes: checkedSizes.length > 0 ? checkedSizes : ['S', 'M', 'L'],
      images: modalImages.length > 0
        ? modalImages
        : ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85']
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Dress...';
      }
      if (id) {
        await updateDress(id, payload);
        showToast('Dress updated!', 'success');
      } else {
        await createDress(payload);
        showToast('New dress added to collection!', 'success');
      }
      modal?.classList.remove('open');
      await refreshAllAdminData();
    } catch (err) {
      console.error('Error saving dress:', err);
      showToast(err.message || 'Could not save dress.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Dress';
      }
    }
  });
}

/* ============================================================================
   3. MANAGE CATEGORIES
   ============================================================================ */

function renderCategoriesTable() {
  const tbody = document.getElementById('admin-categories-tbody');
  if (!tbody) return;

  tbody.innerHTML = adminCategories
    .map(
      cat => `
      <tr>
        <td style="font-weight: 600;">${escapeHtml(cat.name)}</td>
        <td><code>${escapeHtml(cat.slug)}</code></td>
        <td style="max-width: 340px; color: var(--color-text-secondary);">${escapeHtml(cat.description || '')}</td>
        <td>
          <button type="button" class="btn-icon danger" data-delete-category="${escapeHtml(cat.id)}">Delete</button>
        </td>
      </tr>
    `
    )
    .join('');

  tbody.querySelectorAll('[data-delete-category]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteCategory;
      if (!confirm('Delete this category?')) return;
      try {
        await deleteCategory(id);
        showToast('Category deleted.', 'info');
        await refreshAllAdminData();
      } catch (err) {
        showToast(err.message || 'Could not delete category.', 'error');
      }
    });
  });
}

function bindCategoryFormHandlers() {
  const form = document.getElementById('admin-category-form');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('cat-name-input')?.value.trim();
    const description = document.getElementById('cat-desc-input')?.value.trim();
    const image_url = document.getElementById('cat-image-input')?.value.trim();

    if (!name) return;
    try {
      await createCategory({ name, description, image_url });
      showToast(`Category "${name}" created!`, 'success');
      form.reset();
      await refreshAllAdminData();
    } catch (err) {
      showToast(err.message || 'Failed to create category.', 'error');
    }
  });
}

/* ============================================================================
   4. MANAGE BOOKING / INQUIRY REQUESTS
   ============================================================================ */

function renderInquiriesTable() {
  const tbody = document.getElementById('admin-inquiries-tbody');
  const recentTbody = document.getElementById('admin-recent-inquiries-tbody');

  const rowsHtml =
    adminInquiries.length === 0
      ? `<tr><td colspan="7" style="text-align:center; padding: 32px; color: var(--color-text-muted);">No booking or contact inquiries received yet.</td></tr>`
      : adminInquiries
          .map(inq => {
            const dates = inq.start_date
              ? `${escapeHtml(inq.start_date)} &rarr; ${escapeHtml(inq.end_date || inq.start_date)}`
              : 'Flexible / Fitting';
            const replyMsg = `Hello ${inq.customer_name || ''}! ✨ This is the ROAD (Rent On A Dress) Concierge regarding your inquiry for "${inq.dress_name || 'Private Fitting'}"${inq.selected_size ? ` (Size ${inq.selected_size})` : ''}.`;
            const waReplyUrl = buildWhatsAppUrl(replyMsg, inq.customer_phone);

            return `
            <tr>
              <td>
                <div style="font-weight: 600;">${escapeHtml(inq.customer_name)}</div>
                <div style="font-size: var(--text-xs); color: var(--color-text-secondary);">${escapeHtml(inq.customer_email)} &bull; ${escapeHtml(inq.customer_phone)}</div>
              </td>
              <td>
                <div style="font-weight: 500;">${escapeHtml(inq.dress_name || 'General Inquiry')}</div>
                ${inq.selected_size ? `<span class="size-pill-mini">Size: ${escapeHtml(inq.selected_size)}</span>` : ''}
              </td>
              <td style="font-size: var(--text-xs);">${dates}</td>
              <td style="font-weight: 600;">${inq.estimated_total ? escapeHtml(formatPrice(inq.estimated_total)) : '—'}</td>
              <td style="max-width: 240px; font-size: var(--text-xs); color: var(--color-text-secondary);">${escapeHtml(inq.message || '—')}</td>
              <td>
                <select class="form-control" style="padding: 0.35rem 0.6rem; font-size: var(--text-xs);" data-inquiry-status="${escapeHtml(inq.id)}">
                  ${['Pending', 'Confirmed', 'Completed', 'Cancelled']
                    .map(
                      st => `<option value="${st}" ${inq.status === st ? 'selected' : ''}>${st}</option>`
                    )
                    .join('')}
                </select>
              </td>
              <td>
                <div class="action-btns">
                  <a href="${escapeHtml(waReplyUrl)}" target="_blank" rel="noopener" class="btn-icon wa" title="Reply to client on WhatsApp">WhatsApp</a>
                  <button type="button" class="btn-icon danger" data-delete-inquiry="${escapeHtml(inq.id)}">Delete</button>
                </div>
              </td>
            </tr>
          `;
          })
          .join('');

  if (tbody) tbody.innerHTML = rowsHtml;
  if (recentTbody) recentTbody.innerHTML = rowsHtml;

  document.querySelectorAll('[data-inquiry-status]').forEach(sel => {
    sel.addEventListener('change', async e => {
      const id = sel.dataset.inquiryStatus;
      const newStatus = e.target.value;
      try {
        await updateInquiryStatus(id, newStatus);
        showToast(`Inquiry status updated to ${newStatus}.`, 'success');
        await refreshAllAdminData();
      } catch (err) {
        showToast(err.message || 'Failed to update status.', 'error');
      }
    });
  });

  document.querySelectorAll('[data-delete-inquiry]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.deleteInquiry;
      if (!confirm('Remove this inquiry record?')) return;
      try {
        await deleteInquiry(id);
        showToast('Inquiry deleted.', 'info');
        await refreshAllAdminData();
      } catch (err) {
        showToast(err.message || 'Failed to delete inquiry.', 'error');
      }
    });
  });
}

/* ============================================================================
   5. SUPABASE CONNECTION SETTINGS MODAL
   ============================================================================ */

function bindSupabaseConfigModal() {
  const openBtns = document.querySelectorAll('.open-supabase-config-btn');
  const modal = document.getElementById('supabase-config-modal');
  const closeBtn = document.getElementById('supabase-config-close');
  const form = document.getElementById('supabase-config-form');
  const urlInput = document.getElementById('cfg-supabase-url');
  const keyInput = document.getElementById('cfg-supabase-key');
  const waInput = document.getElementById('cfg-whatsapp-number');

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (urlInput && isSupabaseConfigured()) urlInput.value = CONFIG.SUPABASE_URL;
      if (keyInput && isSupabaseConfigured()) keyInput.value = CONFIG.SUPABASE_ANON_KEY;
      if (waInput) waInput.value = CONFIG.SHOWROOM_PHONE || '+92 300 1234567';
      modal?.classList.add('open');
    });
  });

  closeBtn?.addEventListener('click', () => modal?.classList.remove('open'));
  modal?.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const url = urlInput?.value.trim();
    const key = keyInput?.value.trim();
    const wa = waInput?.value.trim();
    saveSupabaseCredentials(url, key, wa);
    showToast('Settings saved! Reloading...', 'success');
    setTimeout(() => window.location.reload(), 700);
  });
}
