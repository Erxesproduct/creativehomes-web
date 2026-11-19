"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cart, maxQty } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { HeartButton } from "./card-actions";
import { CheckIcon, MinusIcon, PlusIcon } from "./icons";

type Photo = { src: string; w: number; h: number; thumb: { src: string; w: number; h: number } };
type V = { id: string; label: string | null; opts: Record<string, string>; price: number; compareAt: number | null; stock: number | null; image: { src: string; w: number; h: number; swatch: string } | null };
type O = { title: string; values: string[] };

const same = (a: Record<string, string>, b: Record<string, string>) => Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v]) => b[k] === v);
const usable = (v: V) => v.stock !== 0;

/**
 * Gallery + option picker + buy box for one product. Picking a colour or model that has its own photo on Zochil shows
 * that photo. Values that do not exist with the current choice are dimmed; tapping one jumps to the nearest variant that has it.
 */
export function ProductStage({ slug, title, photos, options, variants, children, notes }: { slug: string; title: string; photos: Photo[]; options: O[]; variants: V[]; children: React.ReactNode; notes: React.ReactNode }) {
  const router = useRouter();
  const first = variants.find(usable) ?? variants[0];
  const [pick, setPick] = useState<Record<string, string>>(first.opts);
  const [shot, setShot] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(0);

  const v = useMemo(() => variants.find((x) => same(x.opts, pick)) ?? null, [variants, pick]);
  const imageFor = (x: V | null) => x?.image ?? null;
  // the photo on show: the one the customer tapped, else the chosen variant's own photo, else the first gallery photo
  const vImg = imageFor(v);
  const main = shot ? (photos.find((p) => p.src === shot) ?? null) : null;
  const showSrc = main?.src ?? vImg?.src ?? photos[0]?.src ?? null;
  const showIdx = main ? photos.indexOf(main) : -1;

  const choose = (title: string, value: string) => {
    const next = { ...pick, [title]: value };
    // keep the other choices when that combination exists, otherwise the closest variant that has this value
    const exact = variants.find((x) => same(x.opts, next));
    const near = exact ?? variants.filter((x) => x.opts[title] === value).sort((a, b) => Number(usable(b)) - Number(usable(a)) || score(b) - score(a))[0];
    function score(x: V) {
      return Object.entries(pick).filter(([k, val]) => k !== title && x.opts[k] === val).length;
    }
    if (near) setPick(near.opts);
    setShot(null);
    setQty(1);
  };
  const exists = (title: string, value: string) => variants.some((x) => x.opts[title] === value && usable(x) && Object.entries(pick).every(([k, val]) => k === title || x.opts[k] === val));
  const swatchOf = (title: string, value: string) => variants.find((x) => x.opts[title] === value && x.image)?.image?.swatch ?? null;

  const out = !v || !usable(v);
  const cap = v ? Math.max(1, maxQty(v.id) || Math.min(10, v.stock ?? 10)) : 1;
  const few = v && v.stock != null && v.stock > 0 && v.stock <= 3;
  const off = v?.compareAt ? Math.round((1 - v.price / v.compareAt) * 100) : 0;

  const add = () => {
    if (!v) return;
    cart.add(v.id, qty);
    setAdded((n) => n + 1);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-14">
      {/* gallery */}
      <div className="lg:sticky lg:top-44 lg:self-start">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          {showSrc && <Image key={showSrc} src={showSrc} alt={`${title}${v?.label ? `: ${v.label}` : ""}`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="fade-in object-cover" />}
          <HeartButton slug={slug} className="absolute top-4 right-4" />
        </div>
        {(photos.length > 1 || vImg) && (
          <div className="no-bar mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Зургууд">
            {vImg && (
              <button type="button" onClick={() => setShot(null)} aria-pressed={!main} aria-label={`Сонгосон: ${v?.label ?? ""}`} className={`relative h-20 w-16 shrink-0 overflow-hidden bg-sand transition ${!main ? "shadow-[0_0_0_2px_var(--color-ink)]" : "opacity-70 hover:opacity-100"}`}>
                <Image src={vImg.swatch} alt="" fill sizes="64px" className="object-cover" />
              </button>
            )}
            {photos.map((x, n) => {
              const on = showIdx === n || (!vImg && !main && n === 0);
              return (
                <button key={x.src} type="button" onClick={() => setShot(x.src)} aria-pressed={on} aria-label={`Зураг ${n + 1}`} className={`relative h-20 w-16 shrink-0 overflow-hidden bg-sand transition ${on ? "shadow-[0_0_0_2px_var(--color-ink)]" : "opacity-70 hover:opacity-100"}`}>
                  <Image src={x.thumb.src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* text, options, buy */}
      <div>
        {children}

        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={`display text-[34px] leading-none md:text-[40px] ${off ? "text-clay" : ""}`}>{v ? formatPrice(v.price) : "—"}</span>
          {v?.compareAt && <s className="text-[18px] text-ink-3">{formatPrice(v.compareAt)}</s>}
          {off > 0 && <span className="tag bg-clay text-white">−{off}%</span>}
          {few && <span className="tag bg-gold-3 text-ink">Үлдэгдэл {v!.stock}</span>}
        </div>

        {options.map((o) => {
          const pics = o.values.some((val) => swatchOf(o.title, val));
          return (
            <fieldset key={o.title} className="mt-7">
              <legend className="label-caps text-ink-2">
                {o.title}: <span className="text-ink normal-case tracking-normal font-[family-name:var(--font-body)] text-[15px] font-bold">{pick[o.title] ?? "—"}</span>
              </legend>
              <div className={`mt-3 flex flex-wrap ${pics ? "gap-2.5" : "gap-2"}`} role="radiogroup" aria-label={o.title}>
                {o.values.map((val) => {
                  const on = pick[o.title] === val;
                  const ok = exists(o.title, val);
                  const sw = pics ? swatchOf(o.title, val) : null;
                  return pics ? (
                    <button key={val} type="button" role="radio" aria-checked={on} aria-disabled={!ok} onClick={() => choose(o.title, val)} title={val} className={`group/s w-[76px] text-center transition ${ok ? "" : "opacity-40"}`}>
                      <span className={`relative block aspect-square overflow-hidden bg-sand ${on ? "shadow-[0_0_0_2px_var(--color-ink)]" : "shadow-[0_0_0_1px_var(--color-line)] group-hover/s:shadow-[0_0_0_1px_var(--color-gold)]"}`}>
                        {sw && <Image src={sw} alt="" fill sizes="76px" className="object-cover" />}
                      </span>
                      <span className={`mt-1 block truncate text-[13px] ${on ? "font-bold" : "text-ink-2"}`}>{val}</span>
                    </button>
                  ) : (
                    <button key={val} type="button" role="radio" aria-checked={on} aria-disabled={!ok} onClick={() => choose(o.title, val)} className="chip !min-h-11">
                      {val}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <div className="mt-8">
          {out ? (
            <p className="bg-sand px-4 py-3.5">{v ? "Энэ сонголт одоогоор дууссан." : "Энэ хослол байхгүй байна."} Өөр сонголт хийх эсвэл утсаар лавлана уу.</p>
          ) : (
            <div className="grid grid-cols-[auto_1fr] gap-3">
              <div className="flex h-14 items-center bg-paper shadow-[inset_0_0_0_1px_var(--color-line)]">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-14 w-11 place-items-center hover:bg-sand" aria-label="Цөөлөх">
                  <MinusIcon size={17} />
                </button>
                <span className="w-8 text-center text-[18px] tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button type="button" onClick={() => setQty((q) => Math.min(cap, q + 1))} disabled={qty >= cap} className="grid h-14 w-11 place-items-center hover:bg-sand disabled:opacity-30" aria-label="Нэмэх">
                  <PlusIcon size={17} />
                </button>
              </div>
              <button type="button" onClick={add} className={`btn h-14 ${added ? "gold btn-gold" : "btn-ink"}`}>
                <span key={added} className={`flex items-center gap-2 ${added ? "pop-in" : ""}`}>
                  {added ? <CheckIcon size={19} /> : <PlusIcon size={19} />}
                  {added ? "Сагсанд нэмэгдлээ" : "Сагсанд нэмэх"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  add();
                  router.push("/cart");
                }}
                className="btn btn-line col-span-2 h-14"
              >
                Шууд захиалах →
              </button>
            </div>
          )}
        </div>
        {notes}
      </div>
    </div>
  );
}
