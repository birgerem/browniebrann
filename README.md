# 🍫 BrownieBrann™ – Nettbutikk

> Det tryggeste farlige navnet på en brownie-butikk.

## Kom i gang

### 1. Installer avhengigheter

```bash
npm install
```

### 2. Konfigurer e-post

```bash
# Kopier eksempel-filen
copy .env.example .env
```

Åpne `.env` og fyll ut:

```env
SMTP_USER=din.epost@gmail.com
SMTP_PASS=ditt-app-passord
ORDER_EMAIL=der-bestillinger-skal-gå@gmail.com
```

> **Gmail-tips:** Gå til Google-konto → Sikkerhet → 2-trinns bekreftelse → App-passord.
> Bruk det genererte passordet som `SMTP_PASS`.

### 3. Start serveren

```bash
npm start
```

Åpne [http://localhost:3000](http://localhost:3000) 🚀

---

## Sidestruktur

| URL | Beskrivelse |
|-----|-------------|
| `/` | Forside |
| `/meny` | Alle brownies |
| `/handlekurv` | Handlekurv |
| `/bestilling` | Bestillingsskjema |
| `/takk` | Takkeside etter bestilling |
| `/om-oss` | Om BrownieBrann™ |

## Prosjektstruktur

```
📁 Edvards nettbutikk/
├── 📁 public/
│   ├── 📁 css/
│   │   └── style.css
│   └── 📁 js/
│       ├── cart.js
│       ├── handlekurv.js
│       └── bestilling.js
├── 📁 views/
│   ├── index.html
│   ├── meny.html
│   ├── handlekurv.html
│   ├── bestilling.html
│   ├── takk.html
│   └── om-oss.html
├── server.js
├── package.json
├── .env.example
└── .env  ← lag denne selv!
```

---

*Bakt med kjærlighet og litt for mye humor* 🍫
