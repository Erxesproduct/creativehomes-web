# Creative Homes Mongolia: erxes manual steps

Owner of every step below: **Terbish**, with Creative Homes Mongolia for credentials and decisions.

These steps happen in the erxes 3.0 admin (and at QPay / ebarimt.mn), not in code. The website reads the results
through the environment variables in `.env.example`. Never commit their values; set them in
**Vercel → creativehomes-web → Settings → Environment Variables** and redeploy.

There is no erxes instance for Creative Homes yet ("erxes 3.0: NOT SET"). Create the workspace first.

> **Security warning.** The public Zochil shop API for creativehomes.mn returns the shop's **Pocket client id /
> client secret / terminal id** and **Sono token / username** to anyone who opens the site. They were removed from
> every file in this repository and were never used. Ask Creative Homes to **rotate the Pocket and Sono
> credentials** now (Pocket merchant portal, Sono merchant portal) and ask Zochil to stop exposing them.

| Task | Website | erxes / external (manual) |
| --- | --- | --- |
| [1.1] Products, categories, prices | done: 421 products, 2,220 variants (colour / size), 13 groups, MNT prices, photos, imported from Zochil | import the CSVs (1.1) |
| [1.2] QPay | done: QPay invoice + status check through the erxes payment plugin; bank transfer shown with the order code | **blocked**: QPay merchant credentials, erxes payment method (1.2) |
| [1.3] eBarimt | done: person / company choice, registry number validated | **blocked**: PosAPI registration, TIN; receipts are issued by erxes (1.3) |
| [1.4] Delivery, fees, statuses | done: address delivery, fee paid to the courier (shop rule), ready / to-order kinds, status list | delivery products, pipeline stages; **open**: fee amounts and zones (1.4) |
| [1.5] Full journey test | validation verified (`npm run test:order`) | **blocked**: a real order needs the env vars and 1.2 / 1.3 (1.5) |

---

## 1.1 Products, categories, prices

Source: creativehomes.mn (Zochil shop 29950), read 2026-11-19: **421 enabled products**, **2,220 variants**
(Өнгө, Хэмжээ, Загвар… from the shop's own options), MNT prices 5₮–3,850,000₮, gallery photos (the first 3 per product, to fit one Vercel Hobby upload; the others stay on Zochil, open question 14)
and variant photos, 1 banner, logo, about text, FAQ, terms.

- Groups (Zochil categories, mapped; 47 products had no usable category and were placed by their name, open
  question 5): Тавилга 57, Гэрэлтүүлэг 35, Чимэглэл 54, Хадгалалт 28, Хивс 13, Ургамал 6, Ор дэрний хэрэглэл 17,
  Гал тогоо 152, Угаалгын өрөө 19, Хүүхдийн 17, Гэр ахуй 9, Цахилгаан бараа 4, Бусад 10.
- **Two kinds of goods** (the shop's terms): **Бэлэн бараа** (Zochil category «Бэлэн бараа», 5 products), delivered in
  24–72 hours, and **Захиалгын бараа** (all others), ordered for the customer and arriving in 7–28 days. Every card,
  product page and cart line shows which kind it is.
- Specs are read only from the shop's own text («Материал: …», «Хэмжээ: …»); 75 products have them. Nothing is
  invented. The boilerplate «ЭНЭ БАРАА ЗӨВХӨН ЗАХИАЛГААР ИРНЭ» note is replaced by the kind badge.
- Sale: 8 products have a «price before sale». Stock: Zochil counts stock per product only, so only products without
  variants are capped by it; variants are not counted (open question 7).
- Old Zochil URLs (`/products/<category>/<id>`, category pages, `/about`, …) redirect to the new pages.

Steps:

1. Run `npm run export:erxes` (already run; files in `docs/erxes/`).
2. **Products & Services → Categories → Import**: `creativehomes-categories.csv` (CH → groups → sub-categories →
   CH-DELIVERY).
3. **Products & Services → Import**: `creativehomes-products.csv`. One row per variant, code `CH-<productId>-<variantId>`
   (the same id the website sends with every order line), unit price in MNT, kind in its own column.
4. Upload product photos in erxes only if staff need them there; the website serves its own copies.
5. Spot-check 10 products (price, variant name) against creativehomes.mn.
