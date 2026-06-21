# InvoiceSnap

A free, no-signup, privacy-first **invoice generator** for freelancers and small
businesses — built to be deployed and sold as a micro-SaaS.

Everything runs in the browser. There is no backend, no database, and no hosting
cost. You can put it online for free and start charging for the Pro tier today.

## What's here

| Path | What it is |
|------|------------|
| `app/index.html` | Marketing landing page (features + pricing) |
| `app/generator.html` | The live invoice generator tool |
| `app/app.js` | App logic: line items, totals, PDF export, local save |
| `app/styles.css` | Styling for the whole product |
| `app/config.js` | **Your settings** — payment link + Pro toggle |
| `docs/LAUNCH-PLAN.md` | Step-by-step 30-day plan to launch and earn |

## Features

- Create professional PDF invoices in under a minute — no account needed
- Automatic subtotal / tax / discount / total calculations
- Multi-currency support
- Saves your business details locally (private — data never leaves the device)
- Free tier with subtle branding; **Pro** tier ($12/mo suggested) removes it
- Print support and one-click PDF download (via jsPDF + html2canvas)

## Run it locally

It's static — just open `app/index.html` in a browser, or serve the folder:

```bash
cd app
python3 -m http.server 8000
# visit http://localhost:8000
```

## Make money with it

1. Add a Stripe/Gumroad/Lemon Squeezy link in `app/config.js`.
2. Deploy `app/` to Netlify, Cloudflare Pages, or GitHub Pages (free).
3. Follow `docs/LAUNCH-PLAN.md`.

## Honest expectations

This is a real, sellable product, not a get-rich-quick scheme. A well-marketed
micro-SaaS like this can realistically grow to hundreds–thousands of dollars in
monthly recurring revenue over several months of consistent effort. See
`docs/LAUNCH-PLAN.md` for the actual revenue math.

## License

MIT — see `LICENSE`. Do whatever you want with it, including selling it.
