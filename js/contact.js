/**
 * ============================================================================
 * ROAD (Rent On A Dress) — Contact & Booking Inquiry Controller (js/contact.js)
 * ============================================================================
 */

import { getDresses, createInquiry } from './supabase-client.js';
import { formatPrice, buildWhatsAppUrl } from './config.js';
import { initSharedLayout, escapeHtml, showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  initSharedLayout('contact');

  const dressSelect = document.getElementById('contact-dress-select');
  const form = document.getElementById('contact-inquiry-form');
  const waBtn = document.getElementById('contact-whatsapp-btn');

  const params = new URLSearchParams(window.location.search);
  const preselectedDress = params.get('dress') || '';

  try {
    const dresses = await getDresses();
    if (dressSelect) {
      dressSelect.innerHTML =
        `<option value="">General Inquiry / Private Showroom Fitting</option>` +
        dresses
          .map(
            d => `
            <option value="${escapeHtml(d.name)}" data-id="${escapeHtml(d.id)}" data-price="${escapeHtml(d.daily_price)}" ${
              preselectedDress && d.name.toLowerCase() === preselectedDress.toLowerCase() ? 'selected' : ''
            }>
              ${escapeHtml(d.name)} (${escapeHtml(formatPrice(d.daily_price))}/day)
            </option>
          `
          )
          .join('');
    }
  } catch (err) {
    console.error('Could not populate dress dropdown:', err);
  }

  function gatherContactPayload() {
    const selectedOpt = dressSelect?.selectedOptions?.[0];
    const dressName = dressSelect?.value || null;
    const dressId = selectedOpt?.dataset?.id || null;

    return {
      inquiry_type: dressName ? 'booking' : 'general',
      dress_id: dressId,
      dress_name: dressName,
      selected_size: document.getElementById('contact-size')?.value || null,
      customer_name: document.getElementById('contact-name')?.value.trim() || 'Guest',
      customer_email: document.getElementById('contact-email')?.value.trim() || 'whatsapp@guest.com',
      customer_phone: document.getElementById('contact-phone')?.value.trim() || '',
      start_date: document.getElementById('contact-start-date')?.value || null,
      end_date: document.getElementById('contact-end-date')?.value || null,
      rental_days: 1,
      message: document.getElementById('contact-message')?.value.trim() || ''
    };
  }

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const payload = gatherContactPayload();

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Inquiry...';
      }
      await createInquiry(payload);
      showToast('Thank you! Your inquiry has been sent to the ROAD Concierge team.', 'success');
      form.reset();
    } catch (err) {
      console.error('Inquiry submission failed:', err);
      showToast(err.message || 'Unable to submit inquiry. Please try again.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry to Concierge';
      }
    }
  });

  waBtn?.addEventListener('click', async () => {
    const payload = gatherContactPayload();
    if (payload.customer_name && payload.customer_phone) {
      try {
        await createInquiry(payload);
      } catch (e) {
        console.warn('Background inquiry save skipped:', e);
      }
    }

    const waText =
      `Hello ROAD Concierge! ✨\n` +
      `• Name: ${payload.customer_name}\n` +
      (payload.dress_name ? `• Dress: ${payload.dress_name}\n` : `• Inquiry: Private Fitting / Styling\n`) +
      (payload.selected_size ? `• Preferred Size: ${payload.selected_size}\n` : '') +
      (payload.start_date ? `• Dates: ${payload.start_date} to ${payload.end_date || payload.start_date}\n` : '') +
      (payload.message ? `• Message: ${payload.message}\n` : '');

    window.open(buildWhatsAppUrl(waText), '_blank', 'noopener');
  });
});
