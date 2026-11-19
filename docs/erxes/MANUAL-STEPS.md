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

## 1.2 Payment (QPay and bank transfer)

On Zochil the payment rule is «Төлбөрийг захиалга баталгаажуулах үед бүрэн төлнө. Төлбөрийг банкны данс, QPAY болон
бусад аргаар хийж болно.» `has_qpay` is on, but **all four Zochil methods (QPay2, StorePay, Pocket, Sono) are
`disabled`** (open question 1). The website offers:

- **QPay** through erxes: `generateInvoiceUrl` (public) creates the invoice after the order is saved in erxes; the
  customer pays on the erxes payment page and returns to `/order/<reference>`, where `invoicesCheck` is asked every 5 s.
- **Bank transfer**: the order page shows Хаан банк 5040557036 and the order code `CH-…` to write in the transfer,
  with copy buttons. Staff confirm it by hand.
- **Leasing apps** (PocketZero, StorePay, Sono, LendMN, Simple, from the shop banner): shown on /info and in the
  checkout as "call us"; they are not taken online (open question 2).
- The online total is **the goods only**: the delivery fee is paid to the courier (1.4).
- No order is sent to QPay unless it was first recorded in erxes (no money asked for an order staff cannot see).

Steps:

1. Get Creative Homes' QPay merchant credentials (`client_id`, `client_secret`, `invoice_code`).
2. **Settings → Payments → Add → QPay (v2)**: enter them. Make a 100₮ test invoice in erxes.
3. Copy the payment method's `_id` into Vercel as `ERXES_PAYMENT_IDS`.
4. Bank transfer: staff check the Khan Bank statement for the `CH-…` code and move the card to «Баталгаажсан».
5. **Not yet tested**: nothing has been run against a real QPay merchant. Do not call payments working until step 2
   and section 1.5 pass with authorized credentials.

## 1.3 eBarimt

The website never makes a receipt. The checkout asks «Хувь хүн» or «Байгууллага» (7-digit registry number, checked on
the server) and writes it on the order. The receipt is issued in erxes by staff (or the POS) after payment.

1. Collect from Creative Homes: company name and TIN (Zochil has none), district code, VAT status (all Zochil
   products have VAT off), product classification codes (furniture, lighting, kitchenware, textiles…).
2. Register for **PosAPI 3.0** (ebarimt.mn) and install the PosAPI service.
3. **Settings → eBarimt**: PosAPI URL, TIN, district code, VAT switches; assign it to the website pipeline.
4. For every paid order: issue the receipt once (check the card first) and send the lottery number by SMS / email.
   The receipt covers the goods; the courier's delivery fee is outside it unless the shop decides otherwise.

## 1.4 Delivery zones, fees and order statuses

Website (done), from the Zochil delivery rule and terms, word for word:

| Rule | Website |
| --- | --- |
| «Бэлэн бараа 24–72 цагийн дотор таны өгсөн хаягт хүргэгдэнэ.» | badge «Бэлэн», 24–72 цаг |
| «Захиалгын бараа … 7–28 хоног», «захиалга ирсний дараа мөн 24–72 цагийн дотор» | badge «Захиалгаар», 7–28 хоног |
| «Хүргэлтийн төлбөр нь бүсээс … овор хэмжээнээс хамааран өөр өөр … хүргэлтийн ажилтанд» | no fee online; the checkout and the order say «хүлээн авахдаа ажилтанд» |
| Карго «хүлээн авахдаа» (terms) | shown for to-order items |
| No return or cancellation after confirmation; terms must be accepted (`terms_agreement_required`) | required checkbox, checked on the server |
| Countryside switch on, but no option or fee | not offered online; the site asks to call (open question 3) |

- Fees and rules live in `src/content/business.ts`; change them there and in the erxes delivery products.

erxes:

1. Import `docs/erxes/creativehomes-delivery.csv` (`CH-DELIVERY-city`, `CH-DELIVERY-cargo`, both 0₮ placeholders until
   the amounts are known, open question 4).
2. **Sales → Boards → «Онлайн захиалга» → pipeline «Вэбсайт»**, stages (as on the website order page):
   Хүлээгдэж байна → Баталгаажсан → Захиалга хийгдсэн → Бараа ирсэн → Хүргэлтэд гарсан → Хүргэгдсэн, plus Цуцлагдсан.
   Ready-stock orders skip «Захиалга хийгдсэн» and «Бараа ирсэн».
3. **Frontline → Forms → (order form) → Settings**: create a sales card in «Хүлээгдэж байна» for every submission.
   Staff move it to «Баталгаажсан» when the QPay invoice shows paid or the transfer arrives.
4. SMS / call templates for «Бараа ирсэн» (the terms promise a message to the registered phone).

## 1.5 Test order from cart to receipt

**Verified on a local production build:** `npm run test:order -- http://127.0.0.1:3072` (see the PR for the count and
output): empty cart, unknown product, numeric id, stock limit, quantity limit, the browser's price ignored, no
delivery fee online, a variant priced by its own id, a ready item, terms required, countryside refused, district /
khoroo / address, QPay and transfer accepted, unknown payment refused, phone, email, company registry, same checkout
key → same reference, honeypot, payment check 400 / 503. Without erxes the API answers `503 not_configured`, after
which the checkout shows the phone number and keeps the cart. `--send` was **not run** (env vars not set). No payment
was made.

Steps for the real test (authorized credentials only):

1. **Frontline → Forms → Create** «Вэбсайт захиалга» with fields Нэр, Утас, Имэйл, Захиалга; copy the form id and the
   field ids into `ERXES_ORDER_FORM_ID` / `ERXES_ORDER_FIELD_IDS`. Set `ERXES_API_URL`, `ERXES_PAYMENT_IDS`. Redeploy.
2. `npm run test:order -- https://<production url> --send`: one order, two items.
3. Pay the invoice only with QPay's test merchant or with explicit authorization for a real charge; check that
   `/order/<reference>` shows «Төлбөр төлөгдлөө», move the card, issue the eBarimt, mark delivered, void the test.

## Permissions (erxes)

- Staff who handle orders: Sales (cards), Forms (submissions), Payments (view invoices), eBarimt (issue).
- Only the owner: Settings → Payments, Settings → eBarimt, product import.
- The website uses only public erxes mutations; it needs no admin token.

---

## Open questions for Creative Homes

1. **Payment**: all Zochil methods are disabled. Which QPay merchant should erxes use? Is bank transfer to
   Хаан банк 5040557036 still right (the site offers both)?
2. **Leasing** (PocketZero, StorePay, Sono, LendMN, Simple): the site says "call us". Should any be taken online?
3. **Countryside**: the Zochil switch is on, but there is no option or fee. Courier, bus, cargo?
4. **Delivery fee** amounts by zone and size: the site takes none online (the courier collects it). Should a fee or
   a table be shown?
5. **Ready vs to-order**: only 5 products are in «Бэлэн бараа»; 4 products are in both trees; 47 had no category and
   were grouped by their name. Please check the groups.
6. **Option values** like «1», «2», «3» point at the photos (colour by picture). Real colour names?
7. **Stock**: Zochil counts stock per product, not per variant, and many products show 1. Is stock real, or should
   to-order goods be unlimited?
8. **TIN / PosAPI** for eBarimt; the Zochil shop has no registry number.
9. **Domain**: point creativehomes.mn at the new site when ready.
10. **Exposed credentials**: rotate the Pocket and Sono credentials (see the warning at the top).
11. **Sizes** like «128×80» have no unit (cm?).
12. **Christmas items** are seasonal: hide them after the season?
13. **Price 5₮**: «Гоёлын ваар» (Zochil 742551) is priced 5₮ on Zochil, and the site shows that price. Fix it on
    Zochil / in erxes before taking online payments.
14. **More photos**: the site shows the first 3 gallery photos per product (plus every variant photo) so the whole
    site fits one Vercel Hobby upload (100 MB). For all photos: a Vercel Pro plan or an image host (for example erxes
    file storage).
