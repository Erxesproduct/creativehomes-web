import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { Scroller } from "@/components/scroller";
import { available, cover, groups, popular, ROOMS } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Өрөөгөөр сонгох",
  description: "Зочны өрөө, унтлагын өрөө, гал тогоо, угаалгын өрөө, хүүхдийн өрөө, хадгалалт: Creative Homes Mongolia-гийн бараа өрөө өрөөгөөр.",
  alternates: { canonical: "/rooms" },
};

export default function RoomsPage() {
  const used = new Set<string>();
  return (
    <>
      <section className="sand border-b border-line">
        <div className="wrap pt-10 pb-9 md:pt-14 md:pb-12">
          <p className="label-caps text-gold">Өрөө өрөөгөөр</p>
          <h1 className="mt-3 text-[40px] leading-tight md:text-[58px]">Ямар орчин бүтээх вэ?</h1>
          <p className="mt-3 max-w-2xl text-ink-2">Дэлгүүрийн бараа бүр өөрийн төрөлтэй. Энд тэдгээрийг өрөө тус бүрд хэрэгтэйгээр нь цэгцэлсэн.</p>
          <Scroller as="nav" label="Өрөө" small className="no-bar mt-7 flex gap-2 overflow-x-auto">
            {ROOMS.map((r) => (
              <a key={r.id} href={`#${r.id}`} className="chip shrink-0">
                {r.name}
              </a>
            ))}
          </Scroller>
        </div>
      </section>

      {ROOMS.map((r, n) => {
        const items = popular.filter((p) => (r.groups as readonly string[]).includes(p.group) && available(p));
        if (!items.length) return null;
        const heroP = items.find((p) => p.images.length && !used.has(p.slug)) ?? items[0];
        used.add(heroP.slug);
        const img = heroP.images[0] ?? null;
        const c = cover(heroP);
        const kinds = groups.filter((g) => (r.groups as readonly string[]).includes(g.id));
        return (
          <section key={r.id} id={r.id} className="wrap mt-16 scroll-mt-44 md:mt-20" aria-labelledby={`h-${r.id}`}>
            <div className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${n % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <Reveal>
                <Link href={`/p/${heroP.slug}`} className="group relative block aspect-[4/3] overflow-hidden bg-sand">
                  {(img ?? c) && <Image src={(img ?? c)!.src} alt={heroP.title} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover transition duration-[1.2s] group-hover:scale-[1.04]" />}
                  <span className="hairline absolute inset-0" aria-hidden />
                </Link>
              </Reveal>
              <Reveal delay={100}>
                <p className="label-caps text-ink-3">
                  {String(n + 1).padStart(2, "0")} / {String(ROOMS.length).padStart(2, "0")}
                </p>
                <h2 id={`h-${r.id}`} className="mt-2 text-[34px] md:text-[46px]">
                  {r.name}
                </h2>
                <p className="mt-2 text-ink-2">
                  {r.line} · {items.length} бараа
                </p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {kinds.map((g) => (
                    <li key={g.id}>
                      <Link href={`/shop?g=${g.id}`} className="chip">
                        {g.name} <span className="text-[12.5px] opacity-60">{g.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/shop?room=${r.id}`} className="btn btn-ink mt-7">
                  {r.name}: бүгд <ArrowIcon size={16} />
                </Link>
              </Reveal>
            </div>
            <Scroller className="no-bar mt-8 flex snap-x gap-4 overflow-x-auto pb-2 md:gap-6">
              {items.slice(0, 10).map((p) => (
                <div key={p.slug} className="w-[60vw] max-w-[250px] shrink-0 snap-start sm:w-[240px]">
                  <ProductCard p={p} sizes="250px" />
                </div>
              ))}
            </Scroller>
          </section>
        );
      })}
    </>
  );
}
