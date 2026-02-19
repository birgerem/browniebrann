/**
 * BrownieBrann™ – Handlekurv (Cart) System
 * Bruker localStorage for å holde på handlekurv-data
 */

const CART_KEY = 'brownieBrannCart';

// ---- Hent og lagre ----

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ---- Legg til vare ----

function addToCart(name, price, emoji) {
  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, emoji, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  showToast(`${emoji} ${name} lagt i handlekurven!`);
  // Animate the cart link
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.classList.remove('bump');
    void badge.offsetWidth; // reflow
    badge.classList.add('bump');
  }
}

// ---- Oppdater badge ----

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('#cart-badge').forEach(el => {
    el.textContent = total;
    el.classList.toggle('hidden', total === 0);
  });
}

// ---- Toast ----

function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ---- Navbar hamburger ----

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
      }
    });
  }
});

// Add bump animation style
const bumpStyle = document.createElement('style');
bumpStyle.textContent = `
  .cart-badge.bump {
    animation: badgeBump 0.4s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes badgeBump {
    0% { transform: scale(1); }
    60% { transform: scale(1.6); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(bumpStyle);
