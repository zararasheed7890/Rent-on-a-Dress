/**
 * ============================================================================
 * ROAD (Rent On A Dress) — Home Page Controller (js/home.js)
 * ============================================================================
 */

import { getDresses, getCategories } from './supabase-client.js';
import {
  initSharedLayout,
  renderDressCard,
  renderSkeletonGrid,
  escapeHtml
} from './ui.js';

document.addEventListener('DOMContentLoaded', async () => {
  initSharedLayout('home');

  const featuredMount = document.getElementById('featured-dresses-grid');
  const categoryMount = document.getElementById('categories-showcase-grid');

  if (featuredMount) {
    featuredMount.innerHTML = renderSkeletonGrid(4);
  }

  try {
    const [dresses, categories] = await Promise.all([
      getDresses(),
      getCategories()
    ]);

    // Render Categories Showcase
    if (categoryMount && categories.length > 0) {
      categoryMount.innerHTML = categories
        .slice(0, 4)
        .map(
          cat => `
          <a href="shop.html?category=${encodeURIComponent(cat.name)}" class="category-card">
            <img src="${escapeHtml(cat.image_url || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80')}" alt="${escapeHtml(cat.name)}" loading="lazy" />
            <div class="category-card-overlay">
              <h3 class="category-card-title">${escapeHtml(cat.name)}</h3>
              <p style="font-size: var(--text-xs); color: rgba(255,255,255,0.82); margin-bottom: 10px;">
                ${escapeHtml(cat.description || '')}
              </p>
              <span class="category-card-link">Explore Edit &rarr;</span>
            </div>
          </a>
        `
        )
        .join('');
    }

    // Render Featured / Popular Dresses
    if (featuredMount) {
      const featured = dresses.filter(d => d.is_featured);
      const displayList = (featured.length > 0 ? featured : dresses).slice(0, 4);

      featuredMount.innerHTML = displayList.map(renderDressCard).join('');
    }
  } catch (err) {
    console.error('Error loading home data:', err);
    if (featuredMount) {
      featuredMount.innerHTML = `<p style="grid-column: 1 / -1; text-align:center; color: var(--color-danger);">Unable to load featured dresses right now.</p>`;
    }
  }
});
