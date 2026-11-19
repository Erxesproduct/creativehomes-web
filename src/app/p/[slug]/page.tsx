import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClockIcon, QrIcon, RulerIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ProductStage } from "@/components/product-stage";
import { Scroller } from "@/components/scroller";
import { business } from "@/content/business";
import { available, byPopularity, cover, getProduct, groups, priceRange, products, sku, specRows } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-url";

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const c = cover(p);
  const desc = [formatPrice(p.variants[0].price), p.ready ? "Бэлэн бараа, 24–72 цагт" : "Захиалгаар, 7–28 хоногт", p.lines[0] ?? p.specs.map((s) => `${s.k}: ${s.v}`).join(", ")].filter(Boolean).join(" · ").slice(0, 160);
  return { title: p.title, description: desc, alternates: { canonical: `/p/${p.slug}` }, openGraph: { images: c ? [{ url: p.images[0]?.src ?? c.src }] : undefined } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const group = groups.find((g) => g.id === p.group);
  const rows = specRows(p);
  const kind = p.ready ? business.kinds.ready : business.kinds.order;
  const { min, max } = priceRange(p);

  // more from the same sub-kind, then the same kind, then what sells
  const related = products
    .filter((x) => x.slug !== p.slug && available(x))
    .map((x) => ({ x, score: (x.group === p.group ? 3 : 0) + (p.sub && x.sub === p.sub ? 3 : 0) + (x.ready === p.ready ? 1 : 0) }))
    .sort((a, b) => b.score - a.score || byPopularity(a.x, b.x))
    .slice(0, 12)
    .map(({ x }) => x);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    sku: sku(p.variants[0].id),
    image: [...p.images.map((m) => absoluteUrl(m.src)), ...p.variants.flatMap((v) => (v.image ? [absoluteUrl(v.image.src)] : []))].slice(0, 10),
    description: [...p.lines, ...p.specs.map((s) => `${s.k}: ${s.v}`)].join(" ") || undefined,
    offers:
      p.variants.length > 1
        ? { "@type": "AggregateOffer", priceCurrency: "MNT", lowPrice: min, highPrice: max, offerCount: p.variants.length, availability: available(p) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }
        : { "@type": "Offer", priceCurrency: "MNT", price: min, availability: available(p) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: absoluteUrl(`/p/${p.slug}`) },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="wrap pt-6 md:pt-10">
        <nav className="label-caps flex flex-wrap gap-x-2 !text-[12px] text-ink-3" aria-label="Зам">
          <Link href="/shop" className="hover:text-ink">
            Бүх бараа
          </Link>
          {group && (
            <>
              <span aria-hidden>/</span>
              <Link href={`/shop?g=${group.id}`} className="hover:text-ink">
                {group.name}
              </Link>
            </>
          )}
          {p.sub && (
            <>
              <span aria-hidden>/</span>
              <Link href={`/shop?g=${p.group}&s=${encodeURIComponent(p.sub)}`} className="hover:text-ink">
                {p.sub}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-6">
          <ProductStage
            slug={p.slug}
            title={p.title}
            photos={p.images}
            options={p.options}
            variants={p.variants}
            notes={
              <ul className="mt-8 divide-y divide-line border-y border-line text-[15px]">
                <li className="flex gap-3.5 py-4">
                  <ClockIcon size={20} className="mt-0.5 shrink-0 text-gold" />
                  <span>
                    <b className="block">
                      {kind.name}: {kind.time}
                    </b>
                    <span className="text-ink-2">{p.ready ? business.rules.delivery.split(". ")[0] + "." : kind.text}</span>
                  </span>
                </li>
                <li className="flex gap-3.5 py-4">
                  <TruckIcon size={20} className="mt-0.5 shrink-0 text-gold" />
                  <span>
                    <b className="block">Хүргэлтийн төлбөр хүлээн авахдаа</b>
                    <span className="text-ink-2">{p.ready ? business.rules.deliveryFee : business.rules.cargo}</span>
                  </span>
                </li>
                <li className="flex gap-3.5 py-4">
                  <QrIcon size={20} className="mt-0.5 shrink-0 text-gold" />
                  <span>
                    <b className="block">QPay эсвэл дансаар, бүрэн төлбөрөөр</b>
                    <span className="text-ink-2">
                      Хуваан төлөх ({business.leasing.join(", ")}) бол{" "}
                      <a href={`tel:${business.phone.tel}`} className="underline decoration-gold underline-offset-4">
                        {business.phone.display}
                      </a>{" "}
                      дугаараас лавлаарай.
                    </span>
                  </span>
                </li>
                {!p.ready && (
                  <li className="flex gap-3.5 py-4">
                    <ShieldIcon size={20} className="mt-0.5 shrink-0 text-gold" />
                    <span>
                      <b className="block">Чанартай, баталгаатай сонголт</b>
                      <span className="text-ink-2">
                        {business.rules.quality} {business.rules.noReturn}
                      </span>
                    </span>
                  </li>
                )}
              </ul>
            }
          >
            <p className="flex flex-wrap items-center gap-2">
              {p.ready ? <span className="tag bg-sage text-white">Бэлэн · 24–72 цаг</span> : <span className="tag bg-ink text-paper">Захиалгаар · 7–28 хоног</span>}
              <span className="label-caps !text-[11.5px] text-ink-3">{p.sub ?? group?.name}</span>
            </p>
            <h1 className="mt-3 text-[32px] leading-tight md:text-[44px]">{p.title}</h1>
            {p.variants.length > 1 && (
              <p className="mt-2 text-[15px] text-ink-3">
                {p.variants.length} сонголт · {formatPrice(min)}
                {max > min ? ` – ${formatPrice(max)}` : ""}
              </p>
            )}
          </ProductStage>
        </div>

        {/* details: the shop's own text and spec lines */}
        <section className="mt-16 grid gap-10 border-t border-line pt-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16" aria-label="Дэлгэрэнгүй">
          <div>
            <p className="label-caps text-gold">Тайлбар</p>
            <h2 className="mt-2 text-[28px] md:text-[34px]">Бүтээгдэхүүний тухай</h2>
            {p.lines.length ? (
              <div className="mt-5 space-y-3 text-[16.5px] leading-relaxed text-ink-2">
                {p.lines.map((l) => {
                  const m = l.match(/^([^:]{2,40}):\s*(.+)$/);
                  return (
                    <p key={l}>
                      {m ? (
                        <>
                          <b className="text-ink">{m[1]}:</b> {m[2]}
                        </>
                      ) : (
                        l
                      )}
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="mt-5 text-ink-3">Дэлгүүр энэ бараанд нэмэлт тайлбар бичээгүй байна. Хэмжээ, материалыг утсаар лавлаарай.</p>
            )}
          </div>
          <div>
            <p className="label-caps flex items-center gap-2 text-gold">
              <RulerIcon size={16} /> Үзүүлэлт
            </p>
            <h2 className="mt-2 text-[28px] md:text-[34px]">Хэмжээ, материал</h2>
            <dl className="mt-5 bg-paper p-1 shadow-[0_0_0_1px_var(--color-line)]">
              {rows.map((r, i) => (
                <div key={r.k} className={`grid grid-cols-[minmax(120px,0.8fr)_1.4fr] gap-4 px-4 py-3 text-[15.5px] ${i % 2 ? "" : "bg-linen"}`}>
                  <dt className="text-ink-3">{r.k}</dt>
                  <dd>{r.v}</dd>
                </div>
              ))}
              {p.options.map((o) => (
                <div key={o.title} className="grid grid-cols-[minmax(120px,0.8fr)_1.4fr] gap-4 px-4 py-3 text-[15.5px]">
                  <dt className="text-ink-3">{o.title} (сонголт)</dt>
                  <dd>{o.values.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section className="wrap mt-20" aria-labelledby="rel">
          <div className="flex items-end justify-between gap-4">
            <h2 id="rel" className="text-[28px] md:text-[34px]">
              Хамт сонгох
            </h2>
            <Link href={`/shop?g=${p.group}`} className="underline-gold label-caps pb-1 !text-[12.5px]">
              {group?.name} бүгд →
            </Link>
          </div>
          <Scroller className="no-bar mt-6 flex snap-x gap-4 overflow-x-auto pb-2 md:gap-6">
            {related.map((x) => (
              <div key={x.slug} className="w-[66vw] max-w-[280px] shrink-0 snap-start sm:w-[260px]">
                <ProductCard p={x} sizes="280px" />
              </div>
            ))}
          </Scroller>
        </section>
      )}
    </>
  );
}
