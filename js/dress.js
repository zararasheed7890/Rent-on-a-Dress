/**
 * ============================================================================
 * ROAD (Rent On A Dress) — Dress Detail Page Controller (js/dress.js)
 * ============================================================================
 */

import { getDressByIdOrSlug, getDresses, createInquiry } from './supabase-client.js';
import { formatPrice, buildWhatsAppUrl } from './config.js';
import {
  initSharedLayout,
  renderDressCard,
  escapeHtml,
  showToast,
  WHATSAPP_ICON_SVG
} from './ui.js';

let currentDress = null;
let selectedSize = '';

document.addEventListener('DOMContentLoaded', async () => {
  initSharedLayout('shop');

  const params = new URLSearchParams(window.location.search);
  const identifier = params.get('slug') || params.get('id');

  const detailContainer = document.getElementById('dress-detail-mount');
  const relatedGrid = document.getElementById('related-dresses-grid');

  try {
    const allDresses = await getDresses();
    currentDress = identifier
      ? await getDressByIdOrSlug(identifier)
      : allDresses[0];

    if (!currentDress && allDresses.length > 0) {
      currentDress = allDresses[0];
    }

    if (!currentDress) {
      if (detailContainer) {
        detailContainer.innerHTML = `<div class="empty-state"><h2>Dress Not Found</h2><p><a href="shop.html" class="btn btn-primary" style="margin-top:16px;">Return to Collection</a></p></div>`;
      }
      return;
    }

    document.title = `${currentDress.name} | ROAD — Rent On A Dress`;
    const breadcrumbName = document.getElementById('breadcrumb-dress-name');
    if (breadcrumbName) breadcrumbName.textContent = currentDress.name;

    const sizes = Array.isArray(currentDress.sizes) && currentDress.sizes.length > 0
      ? currentDress.sizes
      : ['S', 'M', 'L'];
    selectedSize = sizes[0];

    const images = Array.isArray(currentDress.images) && currentDress.images.length > 0
      ? currentDress.images
      : ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=85'];

    const statusBadgeClass =
      currentDress.status === 'Available'
        ? 'badge-available'
        : currentDress.status === 'Rented'
        ? 'badge-rented'
        : 'badge-maintenance';

    if (detailContainer) {
      detailContainer.innerHTML = `
        <div class="gallery-wrapper">
          <div class="gallery-main">
            <img id="main-gallery-image" src="${escapeHtml(images[0])}" alt="${escapeHtml(currentDress.name)}" />
          </div>
          <div class="gallery-thumbs" id="gallery-thumbs">
            ${images
              .map(
                (imgUrl, idx) => `
                <button type="button" class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-img="${escapeHtml(imgUrl)}" aria-label="View image ${idx + 1}">
                  <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(currentDress.name)} view ${idx + 1}" />
                </button>
              `
              )
              .join('')}
          </div>
        </div>

        <div class="detail-info">
          <div>
            <div style="display:flex; flex-wrap:wrap; align-items:center; gap: 10px; margin-bottom: 10px;">
              <span class="eyebrow" style="margin-bottom:0;">${escapeHtml(currentDress.category_name || 'Evening')} &bull; ${escapeHtml(currentDress.color || 'Champagne')}</span>
              <span class="badge ${statusBadgeClass}">${escapeHtml(currentDress.status || 'Available')}</span>
            </div>
            <h1 class="detail-title">${escapeHtml(currentDress.name)}</h1>
          </div>

          <div class="detail-price-box">
            <div class="detail-price-main">${escapeHtml(formatPrice(currentDress.daily_price))} <span style="font-size: var(--text-sm); font-weight:400;">/ day</span></div>
            ${
              currentDress.retail_value
                ? `<div class="detail-price-sub">Retail Value: <del>${escapeHtml(formatPrice(currentDress.retail_value))}</del></div>`
                : ''
            }
          </div>

          <p style="color: var(--color-text-secondary); font-size: var(--text-base);">
            ${escapeHtml(currentDress.description)}
          </p>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
              <span class="form-label" style="margin-bottom:0;">Select Size</span>
              <a href="how-it-works.html" style="font-size: var(--text-xs); color: var(--color-gold-dark); text-decoration:underline;">Sizing &amp; Fit Guide</a>
            </div>
            <div class="size-selector" id="size-selector-group">
              ${sizes
                .map(
                  (sz, i) => `
                  <button type="button" class="size-btn ${i === 0 ? 'selected' : ''}" data-size="${escapeHtml(sz)}">
                    ${escapeHtml(sz)}
                  </button>
                `
                )
                .join('')}
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap: 12px; padding-top: 8px;">
            <button type="button" class="btn btn-primary btn-block" id="open-booking-modal-btn">
              Check Availability / Request This Dress
            </button>
            <button type="button" class="btn btn-whatsapp btn-block" id="direct-whatsapp-dress-btn">
              ${WHATSAPP_ICON_SVG} Chat &amp; Reserve via WhatsApp
            </button>
            <a href="contact.html?dress=${encodeURIComponent(currentDress.name)}" class="btn btn-outline btn-block">
              Book a Private Showroom Fitting
            </a>
          </div>

          <div class="detail-perks">
            <div class="detail-perk-item">✨ Complimentary Dry Cleaning</div>
            <div class="detail-perk-item">👗 Backup Size Available on Request</div>
            <div class="detail-perk-item">📦 Luxury Garment Bag Delivery</div>
            <div class="detail-perk-item">💎 100% Authentic Designer Piece</div>
          </div>

          <div style="border-top: 1px solid var(--color-border-subtle); padding-top: 16px; font-size: var(--text-xs); color: var(--color-text-secondary);">
            <strong>Fabric &amp; Care:</strong> ${escapeHtml(currentDress.fabric_care || 'Dry clean only — handled complimentary by ROAD.')}
          </div>
        </div>
      `;

      // Bind thumbnail switcher
      const mainImg = document.getElementById('main-gallery-image');
      const thumbsContainer = document.getElementById('gallery-thumbs');
      thumbsContainer?.addEventListener('click', e => {
        const thumbBtn = e.target.closest('.gallery-thumb');
        if (!thumbBtn || !mainImg) return;
        mainImg.src = thumbBtn.dataset.img;
        thumbsContainer.querySelectorAll('.gallery-thumb').forEach(b => b.classList.remove('active'));
        thumbBtn.classList.add('active');
      });

      // Bind size selector
      const sizeGroup = document.getElementById('size-selector-group');
      sizeGroup?.addEventListener('click', e => {
        const btn = e.target.closest('.size-btn');
        if (!btn) return;
        selectedSize = btn.dataset.size;
        sizeGroup.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });

      // Bind Booking Modal Open
      const openModalBtn = document.getElementById('open-booking-modal-btn');
      openModalBtn?.addEventListener('click', openBookingModal);

      // Bind Direct WhatsApp Dress Inquiry Button
      const directWaBtn = document.getElementById('direct-whatsapp-dress-btn');
      directWaBtn?.addEventListener('click', () => {
        const msg =
          `Hello ROAD Concierge! ✨\n` +
          `I would like to check availability for:\n` +
          `• Dress: ${currentDress.name}\n` +
          `• Preferred Size: ${selectedSize}\n` +
          `• Daily Rate: ${formatPrice(currentDress.daily_price)}/day\n\n` +
          `Please let me know if this piece is available for my event!`;
        window.open(buildWhatsAppUrl(msg), '_blank', 'noopener');
      });
    }

    // Render Related Dresses
    if (relatedGrid) {
      const related = allDresses
        .filter(d => String(d.id) !== String(currentDress.id))
        .sort((a, b) => {
          const sameCatA = a.category_name === currentDress.category_name ? 1 : 0;
          const sameCatB = b.category_name === currentDress.category_name ? 1 : 0;
          return sameCatB - sameCatA;
        })
        .slice(0, 3);

      relatedGrid.innerHTML = related.map(renderDressCard).join('');
    }
  } catch (err) {
    console.error('Error loading dress details:', err);
  }

  setupBookingModalHandlers();
});

function openBookingModal() {
  if (!currentDress) return;
  const modal = document.getElementById('booking-modal');
  const dressTitleEl = document.getElementById('modal-dress-name');
  const sizeInput = document.getElementById('booking-size');
  const startInput = document.getElementById('booking-start-date');
  const endInput = document.getElementById('booking-end-date');

  if (dressTitleEl) {
    dressTitleEl.textContent = `${currentDress.name} (${formatPrice(currentDress.daily_price)}/day)`;
  }
  if (sizeInput) {
    sizeInput.value = selectedSize || 'M';
  }

  // Default tomorrow & day after tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextDay = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];
  if (startInput && !startInput.value) startInput.value = tomorrow;
  if (endInput && !endInput.value) endInput.value = nextDay;

  updateRentalEstimate();
  modal?.classList.add('open');
}

function updateRentalEstimate() {
  if (!currentDress) return;
  const startVal = document.getElementById('booking-start-date')?.value;
  const endVal = document.getElementById('booking-end-date')?.value;
  const summaryEl = document.getElementById('booking-price-summary');

  let days = 1;
  if (startVal && endVal) {
    const diff = (new Date(endVal) - new Date(startVal)) / (1000 * 60 * 60 * 24);
    days = diff >= 1 ? Math.round(diff) : 1;
  }

  const total = days * (Number(currentDress.daily_price) || 0);
  if (summaryEl) {
    summaryEl.innerHTML = `Estimated Rental: <strong>${days} day${days > 1 ? 's' : ''}</strong> &times; ${formatPrice(currentDress.daily_price)} = <strong>${formatPrice(total)}</strong>`;
    summaryEl.dataset.days = String(days);
    summaryEl.dataset.total = String(total);
  }
}

function collectModalBookingPayload() {
  const startInput = document.getElementById('booking-start-date');
  const endInput = document.getElementById('booking-end-date');
  const summaryEl = document.getElementById('booking-price-summary');

  return {
    inquiry_type: 'booking',
    dress_id: currentDress.id,
    dress_name: currentDress.name,
    selected_size: document.getElementById('booking-size')?.value || selectedSize,
    customer_name: document.getElementById('booking-name')?.value.trim() || 'Guest',
    customer_email: document.getElementById('booking-email')?.value.trim() || 'whatsapp@guest.com',
    customer_phone: document.getElementById('booking-phone')?.value.trim() || '',
    start_date: startInput?.value || null,
    end_date: endInput?.value || null,
    rental_days: Number(summaryEl?.dataset.days || 1),
    estimated_total: Number(summaryEl?.dataset.total || currentDress.daily_price),
    message: document.getElementById('booking-notes')?.value.trim() || ''
  };
}

function setupBookingModalHandlers() {
  const modal = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('booking-modal-close');
  const form = document.getElementById('booking-inquiry-form');
  const waSubmitBtn = document.getElementById('booking-whatsapp-submit-btn');
  const startInput = document.getElementById('booking-start-date');
  const endInput = document.getElementById('booking-end-date');

  closeBtn?.addEventListener('click', () => modal?.classList.remove('open'));
  modal?.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });

  startInput?.addEventListener('change', updateRentalEstimate);
  endInput?.addEventListener('change', updateRentalEstimate);

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!currentDress) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const payload = collectModalBookingPayload();

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Request...';
      }
      await createInquiry(payload);
      showToast('Your dress reservation inquiry has been received! Our concierge will confirm shortly.', 'success');
      form.reset();
      modal?.classList.remove('open');
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
      showToast(err.message || 'Could not submit inquiry. Please try again.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Reservation Request';
      }
    }
  });

  // Also allow saving & launching directly into WhatsApp with full details
  waSubmitBtn?.addEventListener('click', async () => {
    if (!currentDress) return;
    const payload = collectModalBookingPayload();

    // Save to Supabase in the background if name & phone are provided
    if (payload.customer_name && payload.customer_phone) {
      try {
        await createInquiry(payload);
      } catch (e) {
        console.warn('Background inquiry save skipped:', e);
      }
    }

    const waText =
      `Hello ROAD Concierge! ✨\n` +
      `I want to reserve a dress:\n` +
      `• Dress: ${payload.dress_name}\n` +
      `• Size: ${payload.selected_size}\n` +
      `• Dates: ${payload.start_date || 'TBD'} to ${payload.end_date || 'TBD'} (${payload.rental_days} day(s))\n` +
      `• Est. Total: ${formatPrice(payload.estimated_total)}\n` +
      `• Name: ${payload.customer_name}\n` +
      `• Phone: ${payload.customer_phone || 'Via WhatsApp'}\n` +
      (payload.message ? `• Notes: ${payload.message}\n` : '');

    window.open(buildWhatsAppUrl(waText), '_blank', 'noopener');
    modal?.classList.remove('open');
  });
}
