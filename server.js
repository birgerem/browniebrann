/**
 * BrownieBrann™ – Server
 * Node.js + Express + Nodemailer
 *
 * Oppsett:
 * 1. npm install
 * 2. Kopier .env.example til .env og fyll ut e-postopplysninger
 * 3. node server.js  (eller: npm start)
 */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ---- Middleware ----
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ---- HTML Routes ----
const views = path.join(__dirname, 'views');

app.get('/',          (req, res) => res.sendFile(path.join(views, 'index.html')));
app.get('/meny',      (req, res) => res.sendFile(path.join(views, 'meny.html')));
app.get('/handlekurv',(req, res) => res.sendFile(path.join(views, 'handlekurv.html')));
app.get('/bestilling',(req, res) => res.sendFile(path.join(views, 'bestilling.html')));
app.get('/takk',      (req, res) => res.sendFile(path.join(views, 'takk.html')));
app.get('/om-oss',    (req, res) => res.sendFile(path.join(views, 'om-oss.html')));
app.get('/spill',     (req, res) => res.sendFile(path.join(views, 'spill.html')));

// ---- E-post oppsett ----
function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// ---- Bestillings-API ----
app.post('/api/bestilling', async (req, res) => {
  const { name, email, phone, address, delivery, comment, items, subtotal, shipping, total } = req.body;

  // Enkel validering
  if (!name || !email || !phone || !address || !items || items.length === 0) {
    return res.status(400).json({ error: 'Manglende felt i bestillingen' });
  }

  // Bygg ordreliste HTML
  const itemsHtml = items.map(item =>
    `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8e0;">${item.emoji} ${item.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8e0;text-align:center;">${item.qty}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0e8e0;text-align:right;font-weight:600;">${item.price * item.qty} kr</td>
    </tr>`
  ).join('');

  const deliveryText = delivery === 'pickup' ? '🏃 Hentes av kunden (Gratis)' : '🚚 Lokal levering (49 kr)';

  const htmlBody = `
<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background:#F7F2E9; margin:0; padding:20px; }
    .container { max-width:600px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(74,44,42,0.15); }
    .header { background:#4A2C2A; padding:32px; text-align:center; }
    .header h1 { color:#FDE9A7; margin:0; font-size:28px; }
    .header p { color:rgba(247,242,233,0.8); margin:8px 0 0; font-size:14px; }
    .body { padding:32px; }
    .section { margin-bottom:28px; }
    .section h2 { font-size:16px; color:#4A2C2A; margin-bottom:14px; border-bottom:2px solid #F7F2E9; padding-bottom:8px; }
    .info-row { display:flex; gap:8px; margin-bottom:8px; }
    .info-label { font-weight:700; color:#4A2C2A; min-width:110px; font-size:14px; }
    .info-value { color:#6b4f4d; font-size:14px; }
    table { width:100%; border-collapse:collapse; }
    th { background:#F7F2E9; padding:10px 12px; text-align:left; font-size:13px; color:#4A2C2A; }
    .total-row td { padding:10px 12px; font-weight:700; color:#4A2C2A; font-size:15px; border-top:2px solid #F7F2E9; }
    .comment-box { background:#F7F2E9; border-radius:10px; padding:14px 16px; font-size:14px; color:#6b4f4d; font-style:italic; }
    .footer-box { background:#4A2C2A; padding:20px 32px; text-align:center; }
    .footer-box p { color:rgba(247,242,233,0.7); font-size:12px; margin:0; }
    .badge { display:inline-block; background:#FDE9A7; color:#4A2C2A; border-radius:100px; padding:4px 14px; font-weight:700; font-size:13px; margin-top:8px; }
  </style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🍫 Ny Bestilling – BrownieBrann™</h1>
    <p>En ny brownie-entusiast har bestilt! 🎉</p>
    <span class="badge">Ny bestilling</span>
  </div>
  <div class="body">

    <div class="section">
      <h2>👤 Kundeinfo</h2>
      <div class="info-row"><span class="info-label">Navn:</span><span class="info-value">${name}</span></div>
      <div class="info-row"><span class="info-label">E-post:</span><span class="info-value"><a href="mailto:${email}">${email}</a></span></div>
      <div class="info-row"><span class="info-label">Telefon:</span><span class="info-value">${phone}</span></div>
      <div class="info-row"><span class="info-label">Adresse:</span><span class="info-value">${address}</span></div>
      <div class="info-row"><span class="info-label">Levering:</span><span class="info-value">${deliveryText}</span></div>
    </div>

    <div class="section">
      <h2>🍫 Bestilte Produkter</h2>
      <table>
        <thead>
          <tr>
            <th>Produkt</th>
            <th style="text-align:center;">Antall</th>
            <th style="text-align:right;">Pris</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr><td colspan="2" style="padding:8px 12px;text-align:right;color:#6b4f4d;font-size:13px;">Subtotal:</td><td style="padding:8px 12px;text-align:right;color:#6b4f4d;font-size:13px;">${subtotal} kr</td></tr>
          <tr><td colspan="2" style="padding:8px 12px;text-align:right;color:#6b4f4d;font-size:13px;">Frakt:</td><td style="padding:8px 12px;text-align:right;color:#6b4f4d;font-size:13px;">${shipping === 0 ? 'Gratis' : shipping + ' kr'}</td></tr>
          <tr class="total-row">
            <td colspan="2" style="padding:12px;text-align:right;">TOTALT:</td>
            <td style="padding:12px;text-align:right;font-size:18px;">${total} kr</td>
          </tr>
        </tfoot>
      </table>
    </div>

    ${comment ? `
    <div class="section">
      <h2>💬 Kommentar</h2>
      <div class="comment-box">${comment}</div>
    </div>
    ` : ''}

  </div>
  <div class="footer-box">
    <p>BrownieBrann™ – Det tryggeste farlige navnet på en brownie-butikk.</p>
    <p style="margin-top:8px; opacity:0.5;">Bestilling mottatt automatisk via nettside</p>
  </div>
</div>
</body>
</html>`;

  // Bekreftelse til kunden
  const confirmHtml = `
<!DOCTYPE html>
<html lang="no">
<head><meta charset="UTF-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background:#F7F2E9; margin:0; padding:20px; }
  .container { max-width:550px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(74,44,42,0.15); }
  .header { background:#4A2C2A; padding:32px; text-align:center; }
  .header h1 { color:#FDE9A7; margin:0; font-size:24px; }
  .header p { color:rgba(247,242,233,0.8); margin:8px 0 0; }
  .body { padding:28px; }
  .big-emoji { font-size:50px; text-align:center; padding:20px 0; }
  h2 { font-size:15px; color:#4A2C2A; margin-bottom:12px; }
  .item-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #F7F2E9; font-size:14px; color:#4A2C2A; }
  .total-row { display:flex; justify-content:space-between; padding:12px 0; font-weight:800; font-size:16px; color:#4A2C2A; border-top:2px solid #F7F2E9; }
  .fun-note { background:#FDE9A7; border-radius:10px; padding:14px 16px; margin-top:20px; text-align:center; font-weight:600; color:#4A2C2A; font-size:14px; }
  .footer-box { background:#4A2C2A; padding:20px; text-align:center; }
  .footer-box p { color:rgba(247,242,233,0.7); font-size:12px; margin:0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>🍫 BrownieBrann™</h1>
    <p>Bekreftelse på bestilling</p>
  </div>
  <div class="body">
    <div class="big-emoji">🎉</div>
    <h2>Hei, ${name}!</h2>
    <p style="font-size:14px;color:#6b4f4d;margin-bottom:20px;">
      Vi har mottatt bestillingen din og setter i gang. Browniene er allerede i ferd med å bli bakt
      (etter at vi har googlet hva "bake" betyr, selvfølgelig).
    </p>

    <h2>Din bestilling:</h2>
    ${items.map(i => `<div class="item-row"><span>${i.emoji} ${i.name} ×${i.qty}</span><span>${i.price * i.qty} kr</span></div>`).join('')}
    <div class="item-row" style="color:#6b4f4d;">
      <span>Frakt (${delivery === 'pickup' ? 'hentes' : 'levering'})</span>
      <span>${shipping === 0 ? 'Gratis' : shipping + ' kr'}</span>
    </div>
    <div class="total-row"><span>Totalt</span><span>${total} kr</span></div>

    <div class="fun-note">
      Vi bekrefter snart! Forvent en melding innen 1-2 timer i åpningstid. 🚀
    </div>
  </div>
  <div class="footer-box">
    <p>BrownieBrann™ – Det tryggeste farlige navnet på en brownie-butikk.</p>
  </div>
</div>
</body>
</html>`;

  try {
    const transporter = createTransporter();

    // Send til butikk
    await transporter.sendMail({
      from: `"BrownieBrann™ Nettbutikk" <${process.env.SMTP_USER}>`,
      to: process.env.ORDER_EMAIL || 'edvard.f.emanuelsen@arendalsskolen.no',
      subject: `🍫 Ny bestilling fra ${name} – ${total} kr`,
      html: htmlBody,
    });

    // Send bekreftelse til kunde
    await transporter.sendMail({
      from: `"BrownieBrann™" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `🎉 Bekreftelse på bestilling – BrownieBrann™`,
      html: confirmHtml,
    });

    console.log(`✅ Bestilling mottatt fra ${name} (${email}) – ${total} kr`);
    res.json({ success: true, message: 'Bestilling mottatt!' });

  } catch (err) {
    console.error('E-postfeil:', err.message);
    res.status(500).json({ error: 'Kunne ikke sende e-post. Prøv igjen.' });
  }
});

// ---- 404 ----
app.use((req, res) => {
  res.status(404).send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:80px;background:#F7F2E9;">
      <h1 style="font-size:80px">🍫</h1>
      <h2 style="color:#4A2C2A;">404 – Denne siden finnes ikke</h2>
      <p style="color:#6b4f4d;">Men browniene gjør det.</p>
      <a href="/" style="color:#4A2C2A;font-weight:700;">← Tilbake til forsiden</a>
    </body></html>
  `);
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log(`\n🍫 BrownieBrann™ er live!`);
  console.log(`   Åpne: http://localhost:${PORT}`);
  console.log(`   E-post til: ${process.env.ORDER_EMAIL || 'edvard.f.emanuelsen@arendalsskolen.no'}\n`);
});
