/**
 * ============================================================================
 * ROAD (Rent On A Dress) — Shared UI Components, WhatsApp Widget & Helpers
 * ============================================================================
 */

import { CONFIG, formatPrice, buildWhatsAppUrl } from './config.js';

export function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const WHATSAPP_ICON_SVG = `
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.124.556 4.119 1.528 5.847l-1.528 5.583 5.715-1.499c1.678.911 3.601 1.434 5.654 1.434 6.627 0 12-5.373 12-12 0-6.627-5.373-12-11.369-11.365z"/>
  </svg>
`;

/**
 * Injects the shared luxury announcement bar, sticky navbar, mobile drawer,
 * footer, and Floating WhatsApp Concierge Chat Widget
 */
export function initSharedLayout(activePage = 'home') {
  const headerPlaceholder = document.getElementById('site-header-mount');
  const footerPlaceholder = document.getElementById('site-footer-mount');

  const defaultWaLink = buildWhatsAppUrl(
    'Hello ROAD Concierge! I would like to inquire about renting a dress.'
  );

  if (headerPlaceholder) {
    headerPlaceholder.innerHTML = `
      <div class="announcement-bar">
        Complimentary Dry Cleaning &amp; Garment Bag &nbsp;|&nbsp; <span>WhatsApp Concierge: ${escapeHtml(CONFIG.SHOWROOM_PHONE)}</span>
      </div>
      <header class="site-header" id="main-header">
        <div class="container nav-container">
          <a href="index.html" class="brand-logo" aria-label="ROAD - Rent On A Dress Home">
            <span class="brand-logo-main">ROAD</span>
            <span class="brand-logo-sub">Rent On A Dress</span>
          </a>

          <nav class="nav-links" aria-label="Primary Navigation">
            <a href="index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
            <a href="shop.html" class="nav-link ${activePage === 'shop' ? 'active' : ''}">The Collection</a>
            <a href="how-it-works.html" class="nav-link ${activePage === 'how' ? 'active' : ''}">How It Works</a>
            <a href="about.html" class="nav-link ${activePage === 'about' ? 'active' : ''}">About Us</a>
            <a href="contact.html" class="nav-link ${activePage === 'contact' ? 'active' : ''}">Book / Inquire</a>
          </nav>

          <div class="nav-actions">
            <a href="shop.html" class="btn btn-primary btn-sm">Rent A Dress</a>
            <a href="admin.html" class="btn btn-outline btn-sm hide-on-mobile" title="Admin Portal">Admin</a>
            <button type="button" class="mobile-menu-toggle" id="mobile-menu-open" aria-label="Open Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div class="mobile-drawer-backdrop" id="mobile-backdrop"></div>
      <aside class="mobile-drawer" id="mobile-drawer" aria-label="Mobile Navigation">
        <div>
          <div class="mobile-drawer-header">
            <div class="brand-logo">
              <span class="brand-logo-main">ROAD</span>
              <span class="brand-logo-sub">Rent On A Dress</span>
            </div>
            <button type="button" class="modal-close" id="mobile-menu-close" aria-label="Close Menu">&times;</button>
          </div>
          <nav class="mobile-nav-list">
            <a href="index.html">Home</a>
            <a href="shop.html">The Collection</a>
            <a href="how-it-works.html">How It Works</a>
            <a href="about.html">About Us</a>
            <a href="contact.html">Contact &amp; Inquiry</a>
            <a href="admin.html">Admin Portal</a>
          </nav>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a href="${escapeHtml(defaultWaLink)}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-block">
            ${WHATSAPP_ICON_SVG} Chat on WhatsApp
          </a>
          <a href="shop.html" class="btn btn-primary btn-block">Explore Collection</a>
        </div>
      </aside>
    `;

    const headerEl = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 12) {
        headerEl?.classList.add('scrolled');
      } else {
        headerEl?.classList.remove('scrolled');
      }
    });

    const openBtn = document.getElementById('mobile-menu-open');
    const closeBtn = document.getElementById('mobile-menu-close');
    const backdrop = document.getElementById('mobile-backdrop');
    const drawer = document.getElementById('mobile-drawer');

    const toggleDrawer = open => {
      drawer?.classList.toggle('open', open);
      backdrop?.classList.toggle('open', open);
    };

    openBtn?.addEventListener('click', () => toggleDrawer(true));
    closeBtn?.addEventListener('click', () => toggleDrawer(false));
    backdrop?.addEventListener('click', () => toggleDrawer(false));
  }

  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <a href="index.html" class="brand-logo">
                <span class="brand-logo-main">ROAD</span>
                <span class="brand-logo-sub">Rent On A Dress</span>
              </a>
              <p>Curated luxury evening, cocktail, and formal dresses for unforgettable nights. Wear designer couture for a fraction of the retail price—with complimentary dry cleaning.</p>
            </div>

            <div>
              <h3 class="footer-heading">Collection</h3>
              <ul class="footer-links">
                <li><a href="shop.html?category=Evening">Evening Gowns</a></li>
                <li><a href="shop.html?category=Cocktail">Cocktail Dresses</a></li>
                <li><a href="shop.html?category=Formal">Black-Tie Formal</a></li>
                <li><a href="shop.html?category=Bridal+Guest">Bridal Guest</a></li>
                <li><a href="shop.html">View All Dresses</a></li>
              </ul>
            </div>

            <div>
              <h3 class="footer-heading">Maison ROAD</h3>
              <ul class="footer-links">
                <li><a href="how-it-works.html">How Renting Works</a></li>
                <li><a href="about.html">Our Story &amp; Sustainability</a></li>
                <li><a href="contact.html">Private Fitting &amp; Contact</a></li>
                <li><a href="admin.html">Admin Dashboard</a></li>
              </ul>
            </div>

            <div>
              <h3 class="footer-heading">Concierge</h3>
              <ul class="footer-links">
                <li><a href="${escapeHtml(defaultWaLink)}" target="_blank" rel="noopener" style="color: #4CD964; font-weight: 600;">WhatsApp: ${escapeHtml(CONFIG.SHOWROOM_PHONE)}</a></li>
                <li><a href="mailto:${escapeHtml(CONFIG.SHOWROOM_EMAIL)}">${escapeHtml(CONFIG.SHOWROOM_EMAIL)}</a></li>
                <li style="color: rgba(250,246,242,0.68); font-size: var(--text-xs); margin-top: 6px;">
                  ${escapeHtml(CONFIG.SHOWROOM_ADDRESS)}<br>
                  ${escapeHtml(CONFIG.SHOWROOM_HOURS)}
                </li>
              </ul>
            </div>
          </div>

          <div class="footer-bottom">
            <span>&copy; ${new Date().getFullYear()} ROAD (Rent On A Dress). All rights reserved.</span>
            <span>Crafted for timeless celebrations &bull; Powered by Supabase</span>
          </div>
        </div>
      </footer>
    `;
  }

  initWhatsAppFloatingWidget();
}

/**
 * Injects the interactive Floating WhatsApp Concierge Chat Widget on all public pages
 */
function initWhatsAppFloatingWidget() {
  if (document.getElementById('road-wa-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'road-wa-widget';
  widget.className = 'wa-widget-container';
  widget.innerHTML = `
    <div class="wa-chat-popover" id="wa-chat-popover" role="dialog" aria-label="ROAD WhatsApp Concierge">
      <div class="wa-chat-header">
        <div style="display:flex; align-items:center; gap: 10px;">
          <div class="wa-chat-avatar">R</div>
          <div>
            <div style="font-weight: 600; font-size: var(--text-sm); line-height: 1.2;">ROAD Styling Concierge</div>
            <div style="font-size: 0.7rem; opacity: 0.85;">● Online &bull; Replies within minutes</div>
          </div>
        </div>
        <button type="button" id="wa-popover-close" style="color: #FFF; font-size: 1.25rem; opacity: 0.85;" aria-label="Close chat">&times;</button>
      </div>

      <div class="wa-chat-body">
        <div class="wa-chat-bubble">
          Welcome to <strong>ROAD (Rent On A Dress)</strong> ✨<br/>
          How may our styling concierge help you today?
        </div>
        <div class="wa-quick-prompts">
          <button type="button" class="wa-quick-btn" data-wa-prompt="Hi ROAD! I want to check dress availability for an upcoming event.">
            👗 Check dress availability for my event
          </button>
          <button type="button" class="wa-quick-btn" data-wa-prompt="Hi ROAD! I would like to book a private showroom fitting.">
            🥂 Book a private showroom fitting
          </button>
          <button type="button" class="wa-quick-btn" data-wa-prompt="Hi ROAD! Can you help me with sizing and delivery details?">
            📏 Ask about sizing &amp; delivery
          </button>
        </div>
      </div>

      <form class="wa-chat-footer" id="wa-widget-form">
        <input type="text" id="wa-widget-input" class="wa-chat-input" placeholder="Type a message..." aria-label="WhatsApp message" />
        <button type="submit" class="wa-chat-send">Send</button>
      </form>
    </div>

    <button type="button" class="wa-fab-btn" id="wa-fab-toggle" aria-label="Chat on WhatsApp">
      ${WHATSAPP_ICON_SVG}
      <span class="wa-fab-label">WhatsApp Concierge</span>
    </button>
  `;

  document.body.appendChild(widget);

  const popover = document.getElementById('wa-chat-popover');
  const fabBtn = document.getElementById('wa-fab-toggle');
  const closeBtn = document.getElementById('wa-popover-close');
  const form = document.getElementById('wa-widget-form');
  const input = document.getElementById('wa-widget-input');

  fabBtn?.addEventListener('click', () => {
    popover?.classList.toggle('open');
    if (popover?.classList.contains('open')) {
      input?.focus();
    }
  });

  closeBtn?.addEventListener('click', () => {
    popover?.classList.remove('open');
  });

  widget.querySelectorAll('[data-wa-prompt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.waPrompt;
      window.open(buildWhatsAppUrl(msg), '_blank', 'noopener');
    });
  });

  form?.addEventListener('submit', e => {
    e.preventDefault();
    const text = input?.value.trim() || 'Hello ROAD Concierge! I have a question about renting a dress.';
    window.open(buildWhatsAppUrl(text), '_blank', 'noopener');
    if (input) input.value = '';
  });
}

/**
 * Renders a single Dress Card HTML string (with integrated WhatsApp button)
 */
export function renderDressCard(dress) {
  const firstImage = (dress.images && dress.images[0])
    || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80';
  const sizes = Array.isArray(dress.sizes) ? dress.sizes : [];
  const detailUrl = `dress.html?slug=${encodeURIComponent(dress.slug || dress.id)}`;

  const statusClass =
    dress.status === 'Available'
      ? 'badge-available'
      : dress.status === 'Rented'
      ? 'badge-rented'
      : 'badge-maintenance';

  const waMessage = `Hi ROAD Concierge! I'm interested in renting the "${dress.name}" (${formatPrice(dress.daily_price)}/day). Is it available for my upcoming dates?`;
  const waUrl = buildWhatsAppUrl(waMessage);

  return `
    <article class="dress-card">
      <a href="${detailUrl}" class="dress-card-media">
        <div class="dress-card-badges">
          ${dress.is_featured ? '<span class="badge badge-gold">Featured</span>' : ''}
          <span class="badge ${statusClass}">${escapeHtml(dress.status || 'Available')}</span>
        </div>
        <img src="${escapeHtml(firstImage)}" alt="${escapeHtml(dress.name)}" loading="lazy" />
        <span class="dress-card-quick">View &amp; Check Availability</span>
      </a>
      <div class="dress-card-body">
        <div>
          <div class="dress-card-category">${escapeHtml(dress.category_name || 'Evening')} &bull; ${escapeHtml(dress.color || 'Champagne')}</div>
          <h3 class="dress-card-title">
            <a href="${detailUrl}">${escapeHtml(dress.name)}</a>
          </h3>
        </div>
        <div class="dress-card-meta">
          <div class="dress-card-price">
            ${escapeHtml(formatPrice(dress.daily_price))} <span>/ day</span>
          </div>
          <div class="dress-card-sizes" aria-label="Available sizes">
            ${sizes.map(s => `<span class="size-pill-mini">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
        <div class="dress-card-actions">
          <a href="${escapeHtml(waUrl)}" target="_blank" rel="noopener" class="dress-card-wa-btn">
            ${WHATSAPP_ICON_SVG} Inquire on WhatsApp
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders loading skeleton cards while Supabase data is being fetched
 */
export function renderSkeletonGrid(count = 4) {
  return Array.from({ length: count })
    .map(
      () => `
      <div class="dress-card" style="pointer-events:none;">
        <div class="dress-card-media skeleton"></div>
        <div class="dress-card-body">
          <div class="skeleton" style="height: 14px; width: 45%; margin-bottom: 8px;"></div>
          <div class="skeleton" style="height: 24px; width: 85%; margin-bottom: 16px;"></div>
          <div class="skeleton" style="height: 18px; width: 60%;"></div>
        </div>
      </div>
    `
    )
    .join('');
}

/**
 * Displays a floating toast notification
 */
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div>${escapeHtml(message)}</div>
    <button type="button" style="font-weight:700; opacity:0.65;" aria-label="Dismiss">&times;</button>
  `;

  toast.querySelector('button')?.addEventListener('click', () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4500);
}
