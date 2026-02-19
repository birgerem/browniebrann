/**
 * BrownieBrann™ – Handlekurv-side logikk
 */

const SHIPPING_COST = 49;
const FREE_SHIPPING_THRESHOLD = 300;

function renderCart() {
  const cart = getCart();
  const listEl = document.getElementById('cart-items-list');
  const emptyEl = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  const upsellEl = document.getElementById('upsell-section');

  if (!listEl) return;

  if (cart.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.style.display = '';
    if (summaryEl) summaryEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (summaryEl) summaryEl.style.display = '';
  if (upsellEl) upsellEl.style.display = '';

  // Render items
  listEl.innerHTML = cart.map((item, idx) => `
    <div class="cart-item" id="cart-item-${idx}">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${item.price} kr / stk</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty(${idx}, -1)" aria-label="Minsk antall">−</button>
        <span class="qty-display">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${idx}, 1)" aria-label="Øk antall">+</button>
      </div>
      <div class="cart-item-price">${item.price * item.qty} kr</div>
      <button class="remove-btn" onclick="removeItem(${idx})" aria-label="Fjern vare" title="Fjern fra handlekurv">✕</button>
    </div>
  `).join('');

  updateSummary(cart);
}

function updateSummary(cart) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  // Summary rows
  const rowsEl = document.getElementById('summary-rows');
  if (rowsEl) {
    rowsEl.innerHTML = cart.map(item =>
      `<div class="summary-total"><span>${item.emoji} ${item.name} ×${item.qty}</span><span>${item.price * item.qty} kr</span></div>`
    ).join('');
  }

  const shippingEl = document.getElementById('shipping-cost');
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratis 🎉' : shipping + ' kr';

  const grandEl = document.getElementById('grand-total');
  if (grandEl) grandEl.textContent = total + ' kr';

  const freeNoteEl = document.getElementById('free-shipping-note');
  const remainingEl = document.getElementById('remaining-for-free');
  if (freeNoteEl && remainingEl) {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      freeNoteEl.textContent = '🚚 Gratis frakt på denne bestillingen!';
      freeNoteEl.style.background = '#e8f5e9';
      freeNoteEl.style.color = '#2e7d32';
    } else {
      remainingEl.textContent = remaining;
    }
  }

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.style.opacity = cart.length > 0 ? '1' : '0.5';
    checkoutBtn.style.pointerEvents = cart.length > 0 ? '' : 'none';
  }
}

function changeQty(idx, delta) {
  const cart = getCart();
  if (!cart[idx]) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) {
    cart.splice(idx, 1);
    showToast('Vare fjernet fra handlekurven 👋');
  }
  saveCart(cart);
  updateCartBadge();
  renderCart();
}

function removeItem(idx) {
  const cart = getCart();
  if (!cart[idx]) return;
  const name = cart[idx].name;
  cart.splice(idx, 1);
  saveCart(cart);
  updateCartBadge();
  renderCart();
  showToast(`${name} fjernet fra handlekurven`);
}

// Init
document.addEventListener('DOMContentLoaded', renderCart);
