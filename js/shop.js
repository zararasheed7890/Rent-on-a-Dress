/**
 * ============================================================================
 * ROAD (Rent On A Dress) — Collection / Shop Page Controller (js/shop.js)
 * ============================================================================
 */

import { getDresses, getCategories } from './supabase-client.js';
import { formatPrice } from './config.js';
import {
  initSharedLayout,
  renderDressCard,
  renderSkeletonGrid,
  escapeHtml
} from './ui.js';

let allDresses = [];

const state = {
  search: '',
  category: 'All',
  size: 'All',
  color: 'All',
  maxPrice: 25000,
  sort: 'featured'
};

document.addEventListener('DOMContentLoaded', async () => {
  initSharedLayout('shop');

  // Read URL params (e.g., ?category=Evening)
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) {
    state.category = params.get('category');
  }
  if (params.get('q')) {
    state.search = params.get('q');
  }

  const gridEl = document.getElementById('shop-dresses-grid');
  const categoryListEl = document.getElementById('filter-categories');
  const colorListEl = document.getElementById('filter-colors');
  const searchInput = document.getElementById('shop-search-input');
  const priceSlider = document.getElementById('filter-price-range');
  const priceLabel = document.getElementById('filter-price-label');
  const sortSelect = document.getElementById('shop-sort-select');
  const resetBtn = document.getElementById('filter-reset-btn');
  const mobileFilterToggle = document.getElementById('mobile-filter-toggle');
  const filterBodyContent = document.getElementById('filter-body-content');

  // Mobile Filter Expand / Collapse Toggle
  mobileFilterToggle?.addEventListener('click', () => {
    const isCollapsed = filterBodyContent?.classList.toggle('collapsed-mobile');
    mobileFilterToggle.setAttribute('aria-expanded', String(!isCollapsed));
    mobileFilterToggle.textContent = isCollapsed ? 'Show Filters ▼' : 'Hide Filters ▲';
  });

  if (gridEl) {
    gridEl.innerHTML = renderSkeletonGrid(6);
  }

  try {
    const [dresses, categories] = await Promise.all([
      getDresses(),
      getCategories()
    ]);

    allDresses = dresses;

    // Calculate dynamic max price from collection
    const highestPrice = Math.max(
      20000,
      ...allDresses.map(d => Number(d.daily_price) || 0)
    );
    state.maxPrice = highestPrice;
    if (priceSlider) {
      priceSlider.max = String(highestPrice);
      priceSlider.value = String(highestPrice);
    }
    if (priceLabel) {
      priceLabel.textContent = `Up to ${formatPrice(highestPrice)}`;
    }

    // Populate Category Filter Chips
    if (categoryListEl) {
      const catNames = ['All', ...new Set([
        ...categories.map(c => c.name),
        ...allDresses.map(d => d.category_name).filter(Boolean)
      ])];

      categoryListEl.innerHTML = catNames
        .map(
          cat => `
          <button type="button" class="filter-chip ${state.category.toLowerCase() === cat.toLowerCase() ? 'active' : ''}" data-category="${escapeHtml(cat)}">
            ${escapeHtml(cat)}
          </button>
        `
        )
        .join('');

      categoryListEl.addEventListener('click', e => {
        const btn = e.target.closest('[data-category]');
        if (!btn) return;
        state.category = btn.dataset.category;
        categoryListEl.querySelectorAll('.filter-chip').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        applyFiltersAndRender();
      });
    }

    // Populate Color Filter Chips
    if (colorListEl) {
      const colors = ['All', ...new Set(allDresses.map(d => d.color).filter(Boolean))];
      colorListEl.innerHTML = colors
        .map(
          color => `
          <button type="button" class="filter-chip ${state.color.toLowerCase() === color.toLowerCase() ? 'active' : ''}" data-color="${escapeHtml(color)}">
            ${escapeHtml(color)}
          </button>
        `
        )
        .join('');

      colorListEl.addEventListener('click', e => {
        const btn = e.target.closest('[data-color]');
        if (!btn) return;
        state.color = btn.dataset.color;
        colorListEl.querySelectorAll('.filter-chip').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        applyFiltersAndRender();
      });
    }

    // Size Filter Listener
    const sizeContainer = document.getElementById('filter-sizes');
    sizeContainer?.addEventListener('click', e => {
      const btn = e.target.closest('[data-size]');
      if (!btn) return;
      state.size = btn.dataset.size;
      sizeContainer.querySelectorAll('.filter-chip').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      applyFiltersAndRender();
    });

    // Search Input Listener
    if (searchInput) {
      searchInput.value = state.search;
      searchInput.addEventListener('input', e => {
        state.search = e.target.value.trim();
        applyFiltersAndRender();
      });
    }

    // Price Range Slider Listener
    if (priceSlider) {
      priceSlider.addEventListener('input', e => {
        state.maxPrice = Number(e.target.value);
        if (priceLabel) {
          priceLabel.textContent = `Up to ${formatPrice(state.maxPrice)}`;
        }
        applyFiltersAndRender();
      });
    }

    // Sort Select Listener
    if (sortSelect) {
      sortSelect.addEventListener('change', e => {
        state.sort = e.target.value;
        applyFiltersAndRender();
      });
    }

    // Reset Filters Button
    resetBtn?.addEventListener('click', () => {
      state.search = '';
      state.category = 'All';
      state.size = 'All';
      state.color = 'All';
      state.maxPrice = highestPrice;
      state.sort = 'featured';

      if (searchInput) searchInput.value = '';
      if (priceSlider) priceSlider.value = String(highestPrice);
      if (priceLabel) priceLabel.textContent = `Up to ${formatPrice(highestPrice)}`;
      if (sortSelect) sortSelect.value = 'featured';

      document.querySelectorAll('#filter-categories .filter-chip, #filter-colors .filter-chip, #filter-sizes .filter-chip').forEach(el => {
        const val = el.dataset.category || el.dataset.color || el.dataset.size;
        el.classList.toggle('active', val === 'All');
      });

      applyFiltersAndRender();
    });

    applyFiltersAndRender();
  } catch (err) {
    console.error('Error loading collection:', err);
    if (gridEl) {
      gridEl.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>Unable to load the dress collection right now.</p></div>`;
    }
  }
});

function applyFiltersAndRender() {
  const gridEl = document.getElementById('shop-dresses-grid');
  const countEl = document.getElementById('shop-results-count');
  if (!gridEl) return;

  const q = state.search.toLowerCase();

  let filtered = allDresses.filter(dress => {
    const matchesSearch =
      !q ||
      dress.name?.toLowerCase().includes(q) ||
      dress.description?.toLowerCase().includes(q) ||
      dress.category_name?.toLowerCase().includes(q) ||
      dress.color?.toLowerCase().includes(q);

    const matchesCategory =
      state.category === 'All' ||
      (dress.category_name || '').toLowerCase() === state.category.toLowerCase();

    const matchesSize =
      state.size === 'All' ||
      (Array.isArray(dress.sizes) && dress.sizes.includes(state.size));

    const matchesColor =
      state.color === 'All' ||
      (dress.color || '').toLowerCase() === state.color.toLowerCase();

    const matchesPrice = (Number(dress.daily_price) || 0) <= state.maxPrice;

    return matchesSearch && matchesCategory && matchesSize && matchesColor && matchesPrice;
  });

  // Sort results
  if (state.sort === 'price-asc') {
    filtered.sort((a, b) => Number(a.daily_price) - Number(b.daily_price));
  } else if (state.sort === 'price-desc') {
    filtered.sort((a, b) => Number(b.daily_price) - Number(a.daily_price));
  } else if (state.sort === 'featured') {
    filtered.sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)));
  }

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${allDresses.length} couture pieces`;
  }

  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3 style="font-size: var(--text-2xl); margin-bottom: 8px;">No Matching Dresses Found</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: 18px;">
          Try broadening your size, color, or price filters to discover more styles.
        </p>
      </div>
    `;
    return;
  }

  gridEl.innerHTML = filtered.map(renderDressCard).join('');
}
