# Creative Homes Mongolia web store

Next.js 16 storefront that replaces the Zochil shop at creativehomes.mn (furniture, lighting, decor, kitchen and
home goods, "Create spaces you love", since 2017). «Gold Label» design from the brand's own photos: a gold plate
with a torn paper label, cream-and-taupe awning stripes, Prata headings over warm linen. 421 products and 2,220
colour / size variants from the Zochil shop, ready-stock vs to-order badges everywhere, shopping by room, checkout
with QPay (through erxes) or bank transfer, the shop's terms checkbox, delivery fee paid to the courier, and eBarimt
details.

```bash
npm install
npm run dev            # http://localhost:3000
npm run lint && npm run typecheck && npm run build
npm run test:order -- http://localhost:3000   # order API checks (add --send for one real test order in erxes)
npm run export:erxes   # docs/erxes/creativehomes-*.csv for the erxes product import
```

- Catalog: `src/data/catalog.json` (server) and `src/data/lite.json` (cart, hearts), built from Zochil shop 29950.
  Photos in `public/img/<content hash>.webp` (large, `-t` thumb, `-s` swatch).
- Business rules (ready 24–72 h, to order 7–28 days, delivery fee paid to the courier, QPay or Khan Bank transfer,
  leasing by phone, statuses): `src/content/business.ts`.
- Orders: `POST /api/orders` validates against catalog prices and stock and the terms checkbox, records the order in
  erxes (form → Sales card), then creates the QPay invoice in erxes (bank transfer: no invoice, the order page shows
  the account). Env vars: `.env.example`.
- erxes admin work (payments, eBarimt, pipeline, import), the credential warning and open questions:
  `docs/erxes/MANUAL-STEPS.md`.
