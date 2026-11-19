import type { Metadata } from "next";
import Link from "next/link";
import { CloseIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { Scroller } from "@/components/scroller";
import { business } from "@/content/business";
import { available, byPopularity, fromPrice, groups, onSale, products, ROOMS, type Product } from "@/lib/catalog";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const KEYS = ["g", "s", "room", "ready", "q", "sale"] as const;
const PAGE = 48;

const SORTS = [
  ["popular", "Эрэлттэй"],
  ["new", "Шинэ"],
  ["price-asc", "Хямдаас"],
  ["price-desc", "Үнэтэйгээс"],
] as const;

function titleOf(q: Record<string, string>) {
  if (q.q) return `«${q.q}»`;
  if (q.s) return q.s;
  if (q.g) return groups.find((g) => g.id === q.g)?.name;
  if (q.room) return ROOMS.find((r) => r.id === q.room)?.name;
  if (q.ready) return "Бэлэн бараа";
  if (q.sale) return "Хямдрал";
  return null;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await searchParams;
  const q = Object.fromEntries(KEYS.map((k) => [k, one(sp[k])]));
  const t = titleOf(q);
  return { title: t ? `${t}: бараа` : "Бүх бараа", alternates: { canonical: "/shop" } };
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-zа-яёөү0-9&]+/gi, " ").trim();

export default async function Shop({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = Object.fromEntries([...KEYS, "sort"].map((k) => [k, one(sp[k]).slice(0, 60)]));
  const sort = SORTS.some(([id]) => id === q.sort) ? q.sort : "popular";
  const page = Math.min(20, Math.max(1, Number.parseInt(one(sp.page), 10) || 1));
  const room = ROOMS.find((r) => r.id === q.room);

  const match = (p: Product, skip?: string) =>
    (skip === "g" || !q.g || p.group === q.g) &&
    (skip === "g" || skip === "s" || !q.s || p.sub === q.s) &&
    (!room || (room.groups as readonly string[]).includes(p.group)) &&
    (!q.ready || p.ready) &&
    (!q.sale || onSale(p)) &&
    (!q.q || norm(`${p.title} ${p.sub ?? ""} ${groups.find((g) => g.id === p.group)?.name ?? ""} ${p.lines.join(" ")} ${p.options.flatMap((o) => o.values).join(" ")}`).includes(norm(q.q)));

  const list = products.filter((p) => match(p));
  list.sort((a, b) => {
    const av = Number(available(b)) - Number(available(a));
    if (av) return av;
    if (sort === "new") return b.createdAt.localeCompare(a.createdAt) || b.id - a.id;
    if (sort === "price-asc") return fromPrice(a) - fromPrice(b);
    if (sort === "price-desc") return fromPrice(b) - fromPrice(a);
    return byPopularity(a, b);
  });
  const shown = list.slice(0, page * PAGE);

  const href = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...q, ...patch })) if (v) next.set(k, v);
    const s = next.toString();
    return s ? `/shop?${s}` : "/shop";
  };
  const group = groups.find((g) => g.id === q.g);
  const title = titleOf(q) ?? "Бүх бараа";
  const active = KEYS.filter((k) => q[k]);
  const label = (k: string) => (k === "sale" ? "Хямдрал" : k === "ready" ? "Бэлэн бараа" : k === "q" ? `«${q.q}»` : titleOf({ [k]: q[k] }));
  const kind = q.ready ? business.kinds.ready : null;

  return (
    <>
      <section className="sand border-b border-line">
        <div className="wrap pt-10 pb-8 md:pt-14 md:pb-10">
          <nav className="label-caps flex gap-2 !text-[12px] text-ink-3" aria-label="Зам">
            <Link href="/" className="hover:text-ink">
              Нүүр
            </Link>
            <span aria-hidden>/</span>
            <Link href="/shop" className="hover:text-ink">
              Бүх бараа
            </Link>
          </nav>
          <h1 className="mt-4 text-[38px] leading-tight md:text-[56px]">{title}</h1>
          <p className="mt-2 text-ink-2">
            {group?.line ?? room?.line ?? kind?.text ?? "Гэр ахуй, декор, тавилга: бэлэн болон захиалгаар."} <span className="text-ink-3">· {list.length} бараа</span>
          </p>
          {active.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {active.map((k) => (
                <Link key={k} href={href({ [k]: null, ...(k === "g" ? { s: null } : {}) })} className="chip !bg-ink !text-paper" scroll={false}>
                  {label(k)} <CloseIcon size={14} />
                </Link>
              ))}
              <Link href="/shop" className="chip">
                Бүгдийг арилгах
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="wrap mt-5 space-y-1">
        <Scroller label="Төрөл" small className="no-bar flex gap-1.5 overflow-x-auto py-1.5">
          <span className="label-caps mr-2 shrink-0 self-center !text-[11.5px] text-ink-3">Төрөл</span>
          <Link href={href({ ready: q.ready ? null : "1" })} aria-pressed={!!q.ready} className="chip shrink-0 !text-sage aria-pressed:!text-paper" scroll={false}>
            Бэлэн бараа
          </Link>
          {groups.map((g) => {
            const n = products.filter((p) => match(p, "g") && p.group === g.id).length;
            if (!n && q.g !== g.id) return null;
            return (
              <Link key={g.id} href={href({ g: q.g === g.id ? null : g.id, s: null })} aria-current={q.g === g.id} className="chip shrink-0" scroll={false}>
                {g.name}
                <span className="text-[12.5px] opacity-60">{n}</span>
              </Link>
            );
          })}
        </Scroller>
        {group && group.subs.length > 1 && (
          <Scroller label="Дэд төрөл" small className="no-bar flex gap-1.5 overflow-x-auto py-1.5">
            <span className="label-caps mr-2 shrink-0 self-center !text-[11.5px] text-ink-3">{group.name}</span>
            {group.subs.map((s) => {
              const n = products.filter((p) => match(p, "s") && p.sub === s).length;
              return (
                <Link key={s} href={href({ s: q.s === s ? null : s })} aria-current={q.s === s} className="chip shrink-0 !min-h-9" scroll={false}>
                  {s}
                  <span className="text-[12.5px] opacity-60">{n}</span>
                </Link>
              );
            })}
          </Scroller>
        )}
        <Scroller label="Эрэмбэ" small className="no-bar flex gap-1.5 overflow-x-auto py-1.5">
          <span className="label-caps mr-2 shrink-0 self-center !text-[11.5px] text-ink-3">Эрэмбэ</span>
          {SORTS.map(([id, name]) => (
            <Link key={id} href={href({ sort: id === "popular" ? null : id })} aria-current={sort === id} className="chip shrink-0 !min-h-9" scroll={false}>
              {name}
            </Link>
          ))}
          {products.some(onSale) && (
            <Link href={href({ sale: q.sale ? null : "1" })} aria-pressed={!!q.sale} className="chip shrink-0 !min-h-9 !text-clay aria-pressed:!text-paper" scroll={false}>
              Хямдралтай
            </Link>
          )}
        </Scroller>
      </div>

      <section className="wrap mt-8">
        {shown.length ? (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
              {shown.map((p, i) => (
                <ProductCard key={p.slug} p={p} priority={i < 4} />
              ))}
            </div>
            {list.length > shown.length && (
              <div className="mt-12 text-center">
                <p className="text-[14.5px] text-ink-3">
                  {list.length}-аас {shown.length} бараа
                </p>
                <Link href={href({ page: String(page + 1) })} scroll={false} className="btn btn-line mt-3">
                  Цааш үзэх
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="sand mx-auto max-w-md p-10 text-center">
            <p className="display text-[26px]">Олдсонгүй</p>
            <p className="mt-2 text-ink-2">{business.rules.custom}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn btn-ink">
                Бүх бараа
              </Link>
              <a href={business.facebook} target="_blank" rel="noreferrer" className="btn btn-line">
                Чатаар
              </a>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
