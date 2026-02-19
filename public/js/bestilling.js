/**
 * BrownieBrann™ – Bestillingsskjema med EmailJS
 *
 * Oppsett (én gang):
 * 1. Lag gratis konto på https://www.emailjs.com
 * 2. Add Email Service → Gmail → koble til birgere@gmail.com
 * 3. Email Templates → Create Template (se README for feltnavn)
 * 4. Fyll inn dine IDs i EMAILJS_CONFIG nedenfor
 */

// ── FYLL INN DINE EMAILJS-VERDIER HER ──────────────────────────────
const EMAILJS_CONFIG = {
  publicKey:  'JKJtxwLyyhgn3Hv7g',
  serviceId:  'service_usndvd8',
  templateId: 'template_4vs47dd',
};
// ────────────────────────────────────────────────────────────────────

const SHIPPING_COST = 49;

// Init EmailJS
emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });

// ---- Forhåndsvisning av ordre ----

function loadOrderPreview() {
  const cart = getCart();
  const previewEl  = document.getElementById('order-items-preview');
  const emptyMsg   = document.getElementById('order-empty');
  const subtotalEl = document.getElementById('order-subtotal');
  const shippingEl = document.getElementById('order-shipping');
  const totalEl    = document.getElementById('order-total');
  const submitBtn  = document.getElementById('submit-btn');

  if (!previewEl) return;

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.style.display = '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '🛒 Ingen varer i handlekurven';
      submitBtn.style.opacity = '0.5';
    }
    return;
  }

  if (emptyMsg) emptyMsg.style.display = 'none';

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = getSelectedShipping();
  const total    = subtotal + shipping;

  previewEl.innerHTML = cart.map(item => `
    <div class="order-item-row">
      <span>${item.emoji} ${item.name} × ${item.qty}</span>
      <span>${item.price * item.qty} kr</span>
    </div>
  `).join('');

  if (subtotalEl) subtotalEl.textContent = subtotal + ' kr';
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratis' : shipping + ' kr';
  if (totalEl)    totalEl.textContent    = total + ' kr';
}

function getSelectedShipping() {
  const selected = document.querySelector('input[name="delivery"]:checked');
  return (selected && selected.value === 'pickup') ? 0 : SHIPPING_COST;
}

// ---- Validering ----

function validateField(id, errorId, validFn, errorMsg) {
  const input = document.getElementById(id);
  const errEl = document.getElementById(errorId);
  if (!input || !errEl) return true;
  const valid = validFn(input.value.trim());
  input.classList.toggle('error', !valid);
  errEl.textContent = valid ? '' : errorMsg;
  return valid;
}

// ---- Init ----

document.addEventListener('DOMContentLoaded', () => {
  loadOrderPreview();

  document.querySelectorAll('input[name="delivery"]').forEach(radio => {
    radio.addEventListener('change', loadOrderPreview);
  });

  const form = document.getElementById('order-form');
  if (form) form.addEventListener('submit', handleSubmit);
});

// ---- Send bestilling via EmailJS ----

async function handleSubmit(e) {
  e.preventDefault();

  const v1 = validateField('name',    'err-name',    v => v.length >= 2,                        'Vennligst skriv inn fullt navn.');
  const v2 = validateField('email',   'err-email',   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Ugyldig e-postadresse.');
  const v3 = validateField('phone',   'err-phone',   v => /^[\d\s\+\-]{6,}$/.test(v),           'Ugyldig telefonnummer.');
  const v4 = validateField('address', 'err-address', v => v.length >= 5,                        'Vennligst skriv inn fullstendig adresse.');

  if (!(v1 && v2 && v3 && v4)) {
    showToast('Vennligst fyll ut alle obligatoriske felt ✏️');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Handlekurven er tom! Gå til menyen 🍫');
    return;
  }

  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
  }

  const delivery = document.querySelector('input[name="delivery"]:checked').value;
  const payment  = document.querySelector('input[name="payment"]:checked').value;
  const shipping = delivery === 'pickup' ? 0 : SHIPPING_COST;
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const total    = subtotal + shipping;

  // Bygg ordreliste som lesbar tekst
  const ordreLinjer = cart.map(i =>
    `${i.emoji} ${i.name} x${i.qty}  →  ${i.price * i.qty} kr`
  ).join('\n');

  const leveringTekst = delivery === 'pickup'
    ? 'Hentes av kunden (Gratis)'
    : 'Lokal levering (49 kr)';

  const betalingTekst = payment === 'vipps'
    ? 'Vipps (info sendes på e-post)'
    : 'Betales ved levering / henting';

  const templateParams = {
    kunde_navn:    document.getElementById('name').value.trim(),
    kunde_epost:   document.getElementById('email').value.trim(),
    kunde_telefon: document.getElementById('phone').value.trim(),
    kunde_adresse: document.getElementById('address').value.trim(),
    levering:      leveringTekst,
    betaling:      betalingTekst,
    kommentar:     document.getElementById('comment').value.trim() || '(ingen kommentar)',
    ordreliste:    ordreLinjer,
    subtotal:      subtotal + ' kr',
    frakt:         shipping === 0 ? 'Gratis' : shipping + ' kr',
    totalt:        total + ' kr',
    til_epost:     'edvard.f.emanuelsen@arendalsskolen.no',
  };

  // Lagre for takk-siden
  localStorage.setItem('lastOrder', JSON.stringify({
    name: templateParams.kunde_navn,
    delivery,
    payment,
    items: cart,
    subtotal,
    shipping,
    total,
  }));

  try {
    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    localStorage.removeItem('brownieBrannCart');
    window.location.href = '/takk';

  } catch (err) {
    const detaljer = err?.text || err?.message || JSON.stringify(err);
    console.error('EmailJS-feil:', detaljer);
    if (submitBtn) {
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    }
    showToast('Feil: ' + detaljer);
  }
}
