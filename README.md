# FieldWiseAI

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-zgm47ttv)

# 🌿 Fieldwise

### Photo-driven crop advisory — zero accounts, zero API keys, zero friction


**Live app:** [fieldwise-crop-advis-ukjr.bolt.host](https://fieldwise-crop-advis-ukjr.bolt.host)

---

## The Problem

A farmer spots something wrong on a leaf. By the time expert advice
reaches them — a trip to a dealer, a call to an agronomist, a forum
post — the safe window to treat it has usually already closed. Worse,
generic advice ignores weather entirely: spraying right before rain
just washes the treatment into the soil, wasting money and time.

**Fieldwise closes that gap in one upload.**

---

## What It Does

| Step | What happens |
|---|---|
| 📸 **Upload** | Farmer uploads a photo of the affected leaf |
| 📍 **Locate** | Browser geolocation captures the exact field coordinates |
| 🌦️ **Read the sky** | Live weather + 3-day forecast pulled for that location |
| 🔍 **Diagnose** | The leaf is analyzed client-side for visual disease patterns — likely issue, severity score, honest confidence % |
| ⏱️ **Time it** | A deterministic safety window is calculated: the dry hours available before the next rain |
| ✅ **Act** | One clear card: what's wrong, how to treat it, and exactly when it's safe to act |

---

## Architecture
Farmer's Phone
│
▼
┌───────────────────────────────────────────┐
│ Next.js + Tailwind (client-only app) │
│ │
│ ├── Canvas API: client-side leaf analysis │
│ │ (color/pattern ratio → severity + │
│ │ likely-issue estimate) │
│ ├── Browser Geolocation API │
│ ├── Deterministic safety-window engine │
│ │ (pure math against forecast data — │
│ │ never AI-generated, never hallucinates│
│ │ a spray time) │
│ └── Zero server, zero database, zero keys │
└───────────────────────────────────────────┘
│
▼
┌──────────────────────────┐
│ Open-Meteo (free, │
│ keyless weather + geo) │
└──────────────────────────┘


**Key design decision:** everything runs in the browser. No backend,
no account, no API key, no stored data — which means no credential to
leak, no quota to exhaust, and no server cost per user. The tradeoff is
explicit and stated plainly in the UI: the visual diagnosis is labeled
*"an estimate, not a confirmed diagnosis."* The **timing logic is not**
an estimate — it's deterministic math against live forecast data, so
it can be audited and never invents a safe window that isn't real.

---

## Why Zero API Keys

This was a deliberate architecture choice, not a shortcut:

- **Security** — nothing to leak, nothing to misconfigure, no key that
  can rate-limit or expire mid-demo
- **Efficiency** — no server round-trips beyond one keyless weather
  call; fast even on a slow connection
- **Reach** — works for anyone, instantly, with no signup wall between
  a farmer and an answer

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js + Tailwind CSS |
| Leaf analysis | Canvas API — client-side, no server round-trip |
| Weather | Open-Meteo — free, no API key required |
| Testing | Vitest — unit tests, deterministic logic fully covered |

---

## Security

- ✅ No API keys anywhere in the codebase
- ✅ File uploads validated both client-side and before processing
  (JPG/PNG/WebP only, max 10MB)
- ✅ No external network calls other than the keyless Open-Meteo request
- ✅ No data stored, no account, no tracking

## Accessibility

- ✅ Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`)
- ✅ Alt text on all images, ARIA labels on interactive elements
- ✅ Full keyboard navigation with visible focus states
- ✅ WCAG-AA contrast verified across the color system
- ✅ Respects `prefers-reduced-motion`

## Testing

```bash
npm run test
```

Unit tests cover the deterministic severity-scoring logic and file
validation, including malformed-input and edge-case handling — the
same logic that powers the "when to act" recommendation shown to users.

---

## Run Locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

No `.env` file needed. No setup beyond `npm install`.

---

## Honesty Note

Fieldwise provides a visual pattern estimate, not a confirmed lab
diagnosis. For commercial decisions, consult a local agronomist.

---

Built solo, in one day, for the **PromptWars × InnvoX Hackathon**.
