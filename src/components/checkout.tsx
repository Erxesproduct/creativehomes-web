"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { business, deliveryFee, type PaymentId } from "@/content/business";
import { cart, cartSubtotal, maxQty, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getLiteVariant } from "@/lib/lite";
import { localOrders } from "@/lib/local-orders";
import { DISTRICTS } from "@/lib/orders/places";
import type { OrderErrors } from "@/lib/orders/schema";
import { Plate } from "./brand";
import { BankIcon, MinusIcon, PhoneIcon, PlusIcon, QrIcon, TrashIcon, TruckIcon } from "./icons";

const KEY = "chm.checkout-key";
/** One idempotency key per checkout attempt, kept until the order goes through. */
function checkoutKey() {
  try {
    const k = sessionStorage.getItem(KEY);
    if (k) return k;
    const n = crypto.randomUUID();
    sessionStorage.setItem(KEY, n);
    return n;
  } catch {
    return crypto.randomUUID();
  }
}

const city = business.delivery[0];
const PAY_ICON = { qpay: QrIcon, transfer: BankIcon } as const;
const { ready, order } = business.kinds;

export function Checkout() {
  const items = useCart();
  const router = useRouter();
  const delivery = "city" as const;
  const [payment, setPayment] = useState<PaymentId>("qpay");
  const [receiptType, setReceiptType] = useState<"person" | "company">("person");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const lines = items.flatMap((i) => {
    const v = getLiteVariant(i.id);
    return v ? [{ ...i, v }] : [];
  });
  const subtotal = cartSubtotal(items);
  const fee = deliveryFee();
  const total = subtotal + fee;
  const hasOrder = lines.some((l) => !l.v.e);
  const hasReady = lines.some((l) => l.v.e);

  if (!lines.length)
    return (
      <div className="panel mx-auto max-w-lg px-8 py-12 text-center">
        <Plate seed={4}>
          <span className="label-caps block">Сагс хоосон</span>
        </Plate>
        <p className="display mt-6 text-[28px]">Таны орон зайд юу дутуу байна?</p>
        <p className="mt-2 text-ink-2">Тавилга, гэрэлтүүлэг, чимэглэл… Өрөө эсвэл ангиллаар сонгоод эхлээрэй.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn btn-ink">
            Бүх бараа
          </Link>
          <Link href="/rooms" className="btn btn-line">
            Өрөөгөөр
          </Link>
        </div>
      </div>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setNotice(null);
    setErrors({});
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: checkoutKey(),
          name: f.get("name"),
          phone: f.get("phone"),
          email: f.get("email"),
          delivery,
          area: f.get("area"),
          khoroo: Number(f.get("khoroo")),
          address: f.get("address") ?? "",
          payment,
          receiptType,
          regNo: f.get("regNo") ?? "",
          note: f.get("note"),
          agree,
          website: f.get("website"),
          items: items.map(({ id, qty }) => ({ id, qty })),
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        localOrders.save({
          reference: json.reference,
          createdAt: new Date().toISOString(),
          subtotal: json.subtotal,
          deliveryFee: json.deliveryFee,
          total: json.total,
          lines: lines.map((l) => ({ name: l.v.n, label: l.v.z, qty: l.qty, total: l.v.p * l.qty })),
          method: payment,
          invoiceId: json.payment?.invoiceId ?? null,
          payUrl: json.payment?.url ?? null,
          status: json.payment ? "pending" : null,
        });
        try {
          sessionStorage.removeItem(KEY);
        } catch {}
        cart.clear();
        router.push(`/order/${json.reference}`);
        return;
      }
      if (res.status === 422 && json?.errors) {
        setErrors(json.errors);
        setNotice("Улаанаар тэмдэглэсэн хэсгийг шалгаад дахин дарна уу.");
      } else if (json?.error === "not_configured") {
        setNotice(`Онлайн захиалга одоогоор холбогдоогүй байна. Захиалгаа ${business.phone.display} дугаарт өгнө үү (код ${json.reference}, барааны дүн ${formatPrice(json.total ?? total)}). Таны сагс хадгалагдсан.`);
      } else {
        setNotice(`Захиалга илгээхэд алдаа гарлаа. Дахин оролдох эсвэл ${business.phone.display} дугаарт залгана уу.`);
      }
    } catch {
      setNotice("Интернэт холболтоо шалгаад дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: keyof OrderErrors) =>
    errors[k] && (
      <p className="pop-in mt-1.5 text-[14px] font-bold text-clay" id={`e-${k}`}>
        {errors[k]}
      </p>
    );
  const step = (n: number, t: string) => (
    <h2 className="flex items-center gap-3">
      <span className="display grid h-10 w-10 place-items-center bg-ink text-[18px] text-paper">{n}</span>
      <span className="text-[24px]">{t}</span>
    </h2>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-10">
      <div className="space-y-8">
        <section aria-label="Сагсны бараа" className="panel p-4 md:p-6">
          <ul className="divide-y divide-line">
            {lines.map(({ id, qty, v }) => (
              <li key={id} className="flex gap-4 py-4 first:pt-1 last:pb-1">
                <Link href={`/p/${v.s}`} className="relative h-24 w-24 shrink-0 overflow-hidden bg-white ring-1 ring-line">
                  {v.t && <Image src={v.t} alt="" fill sizes="96px" className="object-cover" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={`tag self-start ${v.e ? "bg-sage text-white" : "bg-sand text-ink"}`}>{v.e ? ready.name : order.name}</span>
                  <Link href={`/p/${v.s}`} className="mt-1 line-clamp-2 leading-snug font-bold hover:underline">
                    {v.n}
                  </Link>
                  <span className="text-[14px] text-ink-2">
                    {v.z ? <b className="text-ink">{v.z} · </b> : null}
                    {formatPrice(v.p)}
                  </span>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center bg-sand">
                      <button type="button" onClick={() => cart.setQty(id, qty - 1)} className="grid h-10 w-10 place-items-center hover:bg-sand-2" aria-label="Цөөлөх">
                        <MinusIcon size={15} />
                      </button>
                      <span className="w-7 text-center font-bold tabular-nums">{qty}</span>
                      <button type="button" onClick={() => cart.setQty(id, qty + 1)} disabled={qty >= maxQty(id)} className="grid h-10 w-10 place-items-center hover:bg-sand-2 disabled:opacity-30" aria-label="Нэмэх">
                        <PlusIcon size={15} />
                      </button>
                    </div>
                    <span className="display text-[19px] tabular-nums">{formatPrice(v.p * qty)}</span>
                    <button type="button" onClick={() => cart.setQty(id, 0)} className="grid h-10 w-10 place-items-center text-ink-3 hover:bg-clay-3 hover:text-clay" aria-label={`${v.n}: хасах`}>
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 bg-sand p-4 text-[14.5px]">
            {hasReady && (
              <p>
                <b>{ready.name}:</b> {ready.time} дотор хүргэнэ.
              </p>
            )}
            {hasOrder && (
              <p>
                <b>{order.name}:</b> {order.time} дотор ирнэ. {business.rules.noReturn}
              </p>
            )}
          </div>
        </section>

        <section className="panel p-5 md:p-7">
          {step(1, "Таны мэдээлэл")}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="label">
              Нэр
              <input name="name" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} className="field" />
              {err("name")}
            </label>
            <label className="label">
              Утас
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="99112233" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "e-phone" : undefined} className="field" />
              {err("phone")}
            </label>
            <label className="label sm:col-span-2">
              Имэйл <span className="font-normal text-ink-3">(заавал биш)</span>
              <input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} className="field" />
              {err("email")}
            </label>
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </section>

        <section className="panel p-5 md:p-7">
          {step(2, "Хаана хүргэх вэ?")}
          <div className="mt-5 flex gap-3 bg-sand p-4">
            <TruckIcon size={20} className="mt-0.5 shrink-0 text-gold" />
            <span>
              <b className="block">{city.name}</b>
              <span className="text-[14px] text-ink-2">{business.rules.deliveryFee}</span>
            </span>
          </div>
          <p className="mt-3 text-[14px] text-ink-2">{business.rules.countryside}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <label className="label">
              Дүүрэг
              <select name="area" required defaultValue="" aria-invalid={!!errors.area} className="field">
                <option value="" disabled>
                  Сонгох
                </option>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              {err("area")}
            </label>
            <label className="label">
              Хороо
              <input name="khoroo" type="number" inputMode="numeric" min={1} max={45} required aria-invalid={!!errors.khoroo} className="field" />
              {err("khoroo")}
            </label>
            <label className="label sm:col-span-2">
              Хаяг
              <textarea name="address" rows={2} required aria-invalid={!!errors.address} placeholder="Байр, орц, давхар, тоот, орцны код. Том тавилга бол лифттэй эсэх." className="field" />
              {err("address")}
            </label>
          </div>
        </section>

        <section className="panel p-5 md:p-7">
          {step(3, "Төлбөр, и-баримт")}
          <div className="mt-5 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Төлбөрийн хэлбэр">
            {business.payments.map((p) => {
              const Icon = PAY_ICON[p.id];
              const on = payment === p.id;
              return (
                <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setPayment(p.id)} className={`flex items-start gap-3 p-4 text-left transition ${on ? "bg-ink text-paper" : "bg-paper shadow-[0_0_0_1.5px_var(--color-line)_inset] hover:shadow-[0_0_0_1.5px_var(--color-gold)_inset]"}`}>
                  <span className={`grid h-11 w-11 shrink-0 place-items-center ${on ? "gold text-ink" : "bg-sand"}`}>
                    <Icon size={22} />
                  </span>
                  <span>
                    <b className="display block text-[18px] font-normal">{p.name}</b>
                    <span className={`block text-[14px] ${on ? "text-paper/80" : "text-ink-2"}`}>{p.note}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {err("payment")}
          <p className="mt-3 text-[14px] text-ink-2">
            {business.leasing.join(", ")}-аар хуваан төлөх бол{" "}
            <a href={`tel:${business.phone.tel}`} className="font-bold underline underline-offset-4">
              {business.phone.display}
            </a>{" "}
            дугаарт залгана уу.
          </p>
          <p className="mt-5 text-[15px] font-bold">И-баримт хэнд авах вэ?</p>
          <div className="mt-2 flex gap-2" role="radiogroup" aria-label="И-баримтын төрөл">
            {(
              [
                ["person", "Хувь хүн"],
                ["company", "Байгууллага"],
              ] as const
            ).map(([id, text]) => (
              <button key={id} type="button" role="radio" aria-checked={receiptType === id} onClick={() => setReceiptType(id)} className="chip">
                {text}
              </button>
            ))}
          </div>
          {receiptType === "company" ? (
            <label className="label mt-4">
              Байгууллагын регистр
              <input name="regNo" inputMode="numeric" maxLength={7} placeholder="1234567" aria-invalid={!!errors.regNo} className="field" />
              {err("regNo")}
            </label>
          ) : (
            <p className="mt-3 text-[14px] text-ink-2">И-баримтыг таны утасны дугаараар бүртгэнэ.</p>
          )}
          <label className="label mt-5">
            Нэмэлт тайлбар <span className="font-normal text-ink-3">(өнгө, хэмжээ, хүргэлтийн цаг гэх мэт)</span>
            <textarea name="note" rows={2} className="field" />
          </label>
        </section>
      </div>

      <aside className="lg:sticky lg:top-36 lg:self-start">
        <div className="relative overflow-hidden bg-ink p-6 text-[#e9e1d3] md:p-8">
          <div className="stripe-band absolute inset-x-0 top-0 h-2 opacity-60" aria-hidden />
          <p className="label-caps text-gold-2">Төлөх дүн</p>
          <dl className="mt-5 space-y-3 text-[16px]">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#bfb4a4]">Бараа</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[#bfb4a4]">Хүргэлт</dt>
              <dd className="text-right text-[14.5px]">Хүлээн авахдаа ажилтанд</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-white/15 pt-4">
              <dt className="font-bold">Онлайнаар төлөх</dt>
              <dd className="display gold-text text-[34px] tabular-nums">{formatPrice(total)}</dd>
            </div>
          </dl>
          <ul className="mt-4 space-y-1.5 text-[14px] leading-snug text-[#d8cfc0]">
            <li>• {business.rules.payment}</li>
            {hasOrder && <li>• {business.rules.cargo}</li>}
          </ul>
          <label className="mt-5 flex cursor-pointer gap-3 bg-white/8 p-3 text-[14.5px] leading-snug">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} aria-invalid={!!errors.agree} aria-describedby={errors.agree ? "e-agree" : undefined} className="mt-0.5 h-5 w-5 shrink-0 accent-[#c9a24a]" />
            <span>
              <Link href="/info#kinds" target="_blank" className="font-bold underline underline-offset-4">
                Захиалгын нөхцөл
              </Link>
              -ийг уншиж танилцаад зөвшөөрч байна.
            </span>
          </label>
          {errors.agree && (
            <p id="e-agree" className="pop-in mt-2 text-[14px] font-bold text-[#f0a48a]">
              {errors.agree}
            </p>
          )}
          {notice && (
            <p role="alert" className="pop-in mt-5 bg-paper px-4 py-3 text-[14.5px] text-ink">
              {notice}
            </p>
          )}
          {errors.items && <p className="mt-4 bg-clay px-4 py-2.5 text-[14.5px] text-white">{errors.items}</p>}
          <button type="submit" disabled={busy} className="btn btn-gold gold mt-6 h-14 w-full text-[16px]">
            {busy ? "Илгээж байна…" : payment === "qpay" ? "Захиалах, QPay-ээр төлөх" : "Захиалах, данс авах"}
          </button>
          <a href={`tel:${business.phone.tel}`} className="mt-5 inline-flex items-center gap-2 text-[14.5px] text-[#d8cfc0] hover:text-white">
            <PhoneIcon size={16} /> Тусламж: {business.phone.display}
          </a>
        </div>
      </aside>
    </form>
  );
}
