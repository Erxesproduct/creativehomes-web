import Image from "next/image";
import Link from "next/link";
import { available, cover, groupName, priceRange, second, singleVariant, swatches, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { HeartButton, QuickAdd } from "./card-actions";

/** A product in the shop: photo (the second one fades in on hover), stock kind, swatches, price. */
export function ProductCard({ p, priority = false, sizes = "(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw" }: { p: Product; priority?: boolean; sizes?: string }) {
  const c = cover(p);
  const alt = second(p);
  const { min, max } = priceRange(p);
  const v = p.variants[0];
  const off = v.compareAt ? Math.round((1 - v.price / v.compareAt) * 100) : 0;
  const sw = swatches(p);
  const one = singleVariant(p);
  const out = !available(p);
  const opts = p.options.map((o) => `${o.values.length} ${o.title.toLowerCase()}`).join(" · ");
  return (
    <article className="group relative flex flex-col">
      <Link href={`/p/${p.slug}`} className="zoom relative block aspect-[4/5] overflow-hidden bg-sand" tabIndex={-1} aria-hidden>
        {c && <Image src={c.src} alt="" fill priority={priority} sizes={sizes} className={`object-cover ${out ? "opacity-60 grayscale" : ""}`} />}
        {alt && <Image src={alt} alt="" fill sizes={sizes} className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />}
        <span className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {p.ready ? <span className="tag bg-sage text-white">Бэлэн · 24–72 цаг</span> : <span className="tag bg-paper/90 text-ink-2">Захиалгаар · 7–28 хоног</span>}
          {off > 0 && <span className="tag bg-clay text-white">−{off}%</span>}
          {out && <span className="tag bg-ink text-paper">Дууссан</span>}
        </span>
      </Link>
      <HeartButton slug={p.slug} className="absolute top-3 right-3" />
      <div className="flex flex-1 flex-col pt-3.5">
        <span className="label-caps !text-[11px] text-ink-3">{p.sub ?? groupName(p.group)}</span>
        <h3 className="mt-1 font-[family-name:var(--font-body)] text-[16.5px] leading-snug font-bold">
          <Link href={`/p/${p.slug}`} className="hover:text-gold">
            {p.title}
          </Link>
        </h3>
        {sw.length > 1 ? (
          <span className="mt-2 flex items-center gap-1.5" aria-label={`${sw.length} сонголт`}>
            {sw.slice(0, 5).map((s) => (
              <span key={s.value} className="relative h-6 w-6 overflow-hidden rounded-full ring-1 ring-line" title={s.value}>
                <Image src={s.src} alt="" fill sizes="24px" className="object-cover" />
              </span>
            ))}
            {sw.length > 5 && <span className="text-[13px] text-ink-3">+{sw.length - 5}</span>}
          </span>
        ) : opts ? (
          <span className="mt-1 text-[13.5px] text-ink-3">{opts}</span>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span>
            <span className={`display block text-[19px] leading-none ${off ? "text-clay" : ""}`}>
              {formatPrice(min)}
              {max > min && <span className="text-[14px] text-ink-3">-с</span>}
            </span>
            {v.compareAt && <s className="text-[13px] text-ink-3">{formatPrice(v.compareAt)}</s>}
          </span>
          {one && <QuickAdd variantId={one} label={p.title} />}
        </div>
      </div>
    </article>
  );
}
