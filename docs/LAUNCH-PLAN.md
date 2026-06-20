# InvoiceSnap — 30-Day Launch Plan

This is a concrete, do-it-yourself plan to turn the product in `/app` into real
revenue. It is honest about the math: a polished micro-SaaS like this realistically
earns **hundreds to low-thousands of dollars per month** within the first months if
you market it consistently. It is **not** a million-dollars-in-a-month machine — no
legitimate product is. Treat the numbers below as achievable targets, not promises.

---

## Step 0 — Make it yours (Day 1, ~30 min)

1. Open `app/config.js`.
2. Create a payment link (pick one, all take <15 min):
   - **Stripe Payment Links** — stripe.com → Payment Links (best for subscriptions)
   - **Gumroad** — gumroad.com (easiest, takes a cut, handles tax)
   - **Lemon Squeezy** — lemonsqueezy.com (handles global sales tax/VAT for you)
3. Paste the URL into `checkoutUrl`.
4. (Optional) Rename the product. Search/replace "InvoiceSnap" across `app/`.

## Step 1 — Put it online for free (Day 1, ~20 min)

The app is 100% static — no server, no database, no hosting bill.

**Option A: GitHub Pages**
```
# from repo root
# Settings → Pages → Deploy from branch → /app folder (or move app/* to root)
```

**Option B: Netlify / Cloudflare Pages (recommended)**
- Drag the `app/` folder onto app.netlify.com/drop — live in 30 seconds.
- Add a custom domain later ($8–12/yr) for credibility.

## Step 2 — First customers (Days 2–10)

The free tool is the marketing. Give it away, charge for Pro.

- **Reddit**: r/freelance, r/smallbusiness, r/digitalnomad — post "I built a free
  no-signup invoice generator" (be genuine, not spammy; engage in comments).
- **Indie Hackers** and **Hacker News** ("Show HN").
- **Twitter/X & LinkedIn**: short demo video (screen-record making an invoice in 20s).
- **Product Hunt**: schedule a launch for ~Day 14 once you have a few testimonials.
- **Facebook groups** for freelancers/consultants.

## Step 3 — SEO compounding engine (start Day 3, pays off over months)

Freelancers search Google for this constantly. Add simple landing pages targeting:
- "free invoice generator", "invoice template for [country]", "freelance invoice maker"
- Per-currency / per-country pages (the currency picker already supports many).

Each page links to the generator. This is the channel that can grow revenue while
you sleep — but it takes 2–6 months to mature, so start now.

## Step 4 — Convert free → Pro

Pro removes branding, adds logo/colors, saved clients, recurring reminders.
Freelancers who send invoices weekly will happily pay $12/mo to look professional.

---

## Realistic revenue math

| Monthly visitors | Free→Pro conversion | Pro subs | MRR @ $12 |
|------------------|--------------------|----------|-----------|
| 1,000            | 1%                 | 10       | $120      |
| 5,000            | 1.5%               | 75       | $900      |
| 20,000           | 2%                 | 400      | $4,800    |

Getting to 20k organic visitors/month typically takes 3–9 months of consistent SEO +
launches. That's a real, sellable side business — not a lottery ticket.

## If you want to sell the whole thing instead

A working, deployed micro-SaaS with even modest traffic and a few paying customers
can be listed on **Acquire.com**, **Flippa**, or **MicroAcquire** and sold for
roughly 2–4x annual profit. Build traction first, then flip if you prefer a lump sum.
