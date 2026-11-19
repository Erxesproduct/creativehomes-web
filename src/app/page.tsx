import Image from "next/image";
import Link from "next/link";
import { Plate, Torn } from "@/components/brand";
import { ArrowIcon, ChatIcon, ClockIcon, QrIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Scroller } from "@/components/scroller";
import { business } from "@/content/business";
import { available, banners, cover, groups, newest, popular, products, readyNow, ROOMS, type Product } from "@/lib/catalog";

const withPhoto = (p: Product) => p.images.length > 0 && available(p);
/** Tall, well-lit gallery photos read best in the hero collage. */
const portrait = (p: Product) => (p.images[0] ? p.images[0].h / p.images[0].w : 0);

function Shelf({ id, eyebrow, title, items, more }: { id: string; eyebrow: string; title: string; items: Product[]; more: { href: string; label: string } }) {
  if (!items.length) return null;
  return (
    <section className="wrap mt-24" aria-labelledby={id}>
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps text-gold">{eyebrow}</p>
          <h2 id={id} className="mt-2 text-[30px] md:text-[40px]">
            {title}
          </h2>
        </div>
        <Link href={more.href} className="underline-gold label-caps flex items-center gap-2 pb-1 !text-[12.5px]">
          {more.label} <ArrowIcon size={15} />
        </Link>
      </Reveal>
      <Scroller className="no-bar mt-7 flex snap-x gap-4 overflow-x-auto pb-2 md:gap-6">
        {items.map((p) => (
          <div key={p.slug} className="w-[66vw] max-w-[290px] shrink-0 snap-start sm:w-[270px]">
            <ProductCard p={p} sizes="290px" />
          </div>
        ))}
      </Scroller>
    </section>
  );
}

export default function Home() {
  const hero = popular.filter(withPhoto).filter((p) => portrait(p) >= 0.95).slice(0, 3);
  const best = popular.filter(withPhoto).slice(0, 12);
  const fresh = newest.filter(withPhoto).slice(0, 12);
  const used = new Set<string>();
  const rooms = ROOMS.map((r) => {
    const pick = popular.filter((p) => (r.groups as readonly string[]).includes(p.group) && withPhoto(p) && !used.has(p.slug))[0];
    if (pick) used.add(pick.slug);
    return { ...r, n: products.filter((p) => (r.groups as readonly string[]).includes(p.group)).length, img: pick ? cover(pick) : null };
  }).filter((r) => r.n);
  const cats = groups
    .filter((g) => g.id !== "other")
    .map((g) => {
      const pick = popular.filter((p) => p.group === g.id && withPhoto(p) && !used.has(p.slug))[0] ?? popular.find((p) => p.group === g.id && withPhoto(p));
      if (pick) used.add(pick.slug);
      return { ...g, img: pick ? cover(pick) : null };
    });
  const banner = banners[0];
  const { ready, order } = business.kinds;

  return (
    <>
      {/* hero: the logo's gold plate, the banner's sand paper, three of the shop's own photos */}
      <section className="sand relative overflow-hidden border-b border-line">
        <div className="stripes pointer-events-none absolute top-0 -right-24 hidden h-full w-[38%] opacity-[0.06] lg:block" aria-hidden />
        <div className="wrap relative grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:py-20">
          <div className="rise">
            <Plate seed={5}>
              <span className="label-caps block !text-[12px] !tracking-[0.24em] md:!text-[13.5px]">Creative Homes Mongolia</span>
            </Plate>
            <h1 className="mt-8 text-[42px] leading-[1.08] md:text-[64px]">
              Гэртээ хайртай
              <br />
              <span className="gold-text">орчноо</span> бүтээгээрэй
            </h1>
            <p className="display mt-3 text-[18px] text-taupe md:text-[20px]">{business.tagline} · since {business.since}</p>
            <p className="mt-6 max-w-xl text-[17.5px] leading-relaxed text-ink-2">{business.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-ink">
                Бараа үзэх <ArrowIcon size={17} />
              </Link>
              <Link href="/rooms" className="btn btn-line">
                Өрөөгөөр сонгох
              </Link>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-sand-2 pt-6">
              <div>
                <dt className="label-caps !text-[11px] text-ink-3">Онлайнаар</dt>
                <dd className="display mt-1 text-[26px]">{business.since}-оос</dd>
              </div>
              <div>
                <dt className="label-caps !text-[11px] text-ink-3">Бараа</dt>
                <dd className="display mt-1 text-[26px]">{products.length}</dd>
              </div>
              <div>
                <dt className="label-caps !text-[11px] text-ink-3">Бэлэн</dt>
                <dd className="display mt-1 text-[26px]">{ready.time}</dd>
              </div>
            </dl>
          </div>
          {hero.length >= 3 && (
            <div className="relative grid grid-cols-[1.15fr_1fr] gap-3 md:gap-4" aria-label="Онцлох бараа">
              {hero.map((p, i) => (
                <Link
                  key={p.slug}
                  href={`/p/${p.slug}`}
                  className={`group relative block overflow-hidden bg-sand-2 ${i === 0 ? "row-span-2 aspect-[3/4.4]" : "aspect-[4/4.6]"} ${i === 2 ? "translate-x-0 md:-translate-x-10" : ""}`}
                >
                  <Image src={p.images[0].src} alt={p.title} fill priority sizes="(min-width: 1024px) 30vw, 50vw" className="photo-in object-cover transition duration-[1.2s] group-hover:scale-[1.04]" />
                  <span className="hairline absolute inset-0" aria-hidden />
                  <span className="absolute inset-x-3 bottom-3 translate-y-2 bg-paper/95 px-3 py-2 text-[14px] opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">{p.title}</span>
                </Link>
              ))}
              <div className="stripes absolute -bottom-5 -left-5 -z-0 hidden h-24 w-24 md:block" aria-hidden />
            </div>
          )}
        </div>
      </section>

      {/* the two kinds of goods, in the shop's own terms */}
      <section id="kinds" className="wrap mt-16 grid gap-4 md:grid-cols-2 md:gap-6">
        <Reveal className="relative overflow-hidden bg-paper p-7 shadow-[0_0_0_1px_var(--color-line)] md:p-9">
          <span className="tag bg-sage text-white">{ready.name}</span>
          <p className="display mt-4 text-[40px] leading-none md:text-[52px]">{ready.time}</p>
          <p className="mt-3 text-ink-2">{ready.text}</p>
          <Link href="/shop?ready=1" className="underline-gold label-caps mt-6 inline-flex items-center gap-2 pb-1 !text-[12.5px]">
            Бэлэн бараа ({readyNow.length}) <ArrowIcon size={15} />
          </Link>
        </Reveal>
        <Reveal delay={120} className="relative overflow-hidden bg-ink p-7 text-[#e9e1d3] md:p-9">
          <div className="stripes absolute -top-10 -right-10 h-32 w-32 rotate-12 opacity-20" aria-hidden />
          <span className="tag gold text-ink">{order.name}</span>
          <p className="display mt-4 text-[40px] leading-none text-white md:text-[52px]">{order.time}</p>
          <p className="mt-3 text-[#c9bfb0]">{order.text}</p>
          <p className="mt-2 text-[14.5px] text-[#a89e90]">{business.rules.cargo}</p>
        </Reveal>
      </section>

      {/* rooms */}
      <section className="wrap mt-24" aria-labelledby="rooms">
        <Reveal className="text-center">
          <p className="label-caps text-gold">Өрөө өрөөгөөр</p>
          <h2 id="rooms" className="mt-2 text-[32px] md:text-[44px]">
            Ямар орчин бүтээх вэ?
          </h2>
        </Reveal>
        <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {rooms.map((r, i) => (
            <Reveal key={r.id} delay={i * 70}>
              <Link href={`/shop?room=${r.id}`} className="group relative block aspect-[4/5] overflow-hidden bg-sand md:aspect-[5/4]">
                {r.img && <Image src={r.img.src} alt="" fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition duration-[1.2s] group-hover:scale-[1.05]" />}
                <span className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/10 to-transparent" aria-hidden />
                <span className="absolute inset-x-4 bottom-4 text-white md:inset-x-6 md:bottom-6">
                  <span className="display block text-[22px] leading-tight md:text-[30px]">{r.name}</span>
                  <span className="mt-1 block text-[13.5px] text-white/80 md:text-[15px]">
                    {r.line} · {r.n}
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <Shelf id="best" eyebrow="Эрэлттэй" title="Хамгийн их сонгосон" items={best} more={{ href: "/shop", label: "Бүх бараа" }} />

      {/* the shop's own banner */}
      {banner && (
        <section className="wrap mt-24">
          <Reveal className="relative overflow-hidden">
            <Image src={banner.src} alt="Create spaces you love. Storepay, PocketZero, Sono, Lendpay. Since 2017" width={banner.w} height={banner.h} sizes="(min-width: 1280px) 1208px, 100vw" className="h-auto w-full" />
            <div className="stripe-band" aria-hidden />
          </Reveal>
          <p className="mt-4 text-center text-[15px] text-ink-2">
            Хуваан төлөх: {business.leasing.join(", ")}. Сонголтоо{" "}
            <a href={`tel:${business.phone.tel}`} className="underline decoration-gold underline-offset-4">
              {business.phone.display}
            </a>{" "}
            дугаараар лавлаарай.
          </p>
        </section>
      )}

      {/* categories */}
      <section className="wrap mt-24" aria-labelledby="cats">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-caps text-gold">Төрөл</p>
            <h2 id="cats" className="mt-2 text-[30px] md:text-[40px]">
              Бүх ангилал
            </h2>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-6">
          {cats.map((g, i) => (
            <Reveal key={g.id} delay={(i % 6) * 50}>
              <Link href={`/shop?g=${g.id}`} className="group block">
                <span className="relative block aspect-square overflow-hidden rounded-full bg-sand ring-1 ring-line transition group-hover:ring-gold">
                  {g.img && <Image src={g.img.src} alt="" fill sizes="200px" className="object-cover transition duration-700 group-hover:scale-105" />}
                </span>
                <span className="mt-3 block text-center">
                  <span className="block font-bold">{g.name}</span>
                  <span className="text-[13.5px] text-ink-3">{g.count} бараа</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {readyNow.length > 0 && <Shelf id="ready" eyebrow={`${ready.name} · ${ready.time}`} title="Шууд хүргэгдэх" items={readyNow} more={{ href: "/shop?ready=1", label: "Бэлэн бараа" }} />}
      <Shelf id="new" eyebrow="Шинээр нэмэгдсэн" title="Шинэ бараа" items={fresh} more={{ href: "/shop?sort=new", label: "Шинэ бараа бүгд" }} />

      {/* promises: the shop's own words */}
      <section className="wrap mt-24">
        <div className="sand p-3 md:p-4">
          <Torn seed={21} className="grid gap-8 px-6 py-10 sm:grid-cols-2 md:px-12 lg:grid-cols-4">
            {[
              { Icon: ShieldIcon, t: "Чанарыг нэн тэргүүнд", x: business.rules.quality },
              { Icon: ChatIcon, t: "Хайсан бараа байхгүй юу?", x: business.rules.custom },
              { Icon: TruckIcon, t: "Хаягт тань хүргэнэ", x: business.rules.deliveryFee },
              { Icon: QrIcon, t: "QPay, данс, хуваан төлөх", x: `${business.rules.payment} Хуваан төлөх: ${business.leasing.join(", ")}.` },
            ].map(({ Icon, t, x }) => (
              <div key={t}>
                <span className="gold grid h-12 w-12 place-items-center text-ink">
                  <Icon size={22} />
                </span>
                <p className="display mt-4 text-[20px] leading-snug">{t}</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{x}</p>
              </div>
            ))}
          </Torn>
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-[14.5px] text-ink-3">
          <ClockIcon size={16} /> {business.rules.notify}
        </p>
      </section>
    </>
  );
}
