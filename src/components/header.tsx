import Link from "next/link";
import { business } from "@/content/business";
import { Mark, Wordmark } from "./brand";
import { HeaderTools } from "./header-tools";
import { Scroller } from "./scroller";

export const NAV = [
  { href: "/shop?g=furniture", label: "Тавилга" },
  { href: "/shop?g=lighting", label: "Гэрэл" },
  { href: "/shop?g=decor", label: "Декор" },
  { href: "/shop?g=rugs", label: "Хивс" },
  { href: "/shop?g=storage", label: "Сагс" },
  { href: "/shop?g=bedding", label: "Дэр, хөнжил" },
  { href: "/shop?g=kitchen", label: "Гал тогоо" },
  { href: "/shop?g=bath", label: "Угаалгын өрөө" },
  { href: "/shop?g=kids", label: "Хүүхдэд" },
];

export function Header() {
  const { ready, order } = business.kinds;
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink text-[#e9e1d3]">
        <div className="wrap flex h-9 items-center justify-between gap-4 text-[13px]">
          <p className="flex min-w-0 items-center gap-3 truncate">
            <span className="label-caps !text-[11.5px] text-gold-2">{ready.short}</span>
            <span className="truncate">{ready.time}-т</span>
            <span className="h-3 w-px shrink-0 bg-white/25" aria-hidden />
            <span className="label-caps !text-[11.5px] text-gold-2">{order.short}</span>
            <span className="truncate">{order.time}-т</span>
            <span className="hidden h-3 w-px shrink-0 bg-white/25 lg:block" aria-hidden />
            <span className="hidden truncate lg:inline">Хуваан төлөх: {business.leasing.join(", ")}</span>
          </p>
          <a href={`tel:${business.phone.tel}`} className="hidden shrink-0 tracking-wide hover:text-gold-2 sm:block">
            {business.phone.display}
          </a>
        </div>
      </div>
      <div className="stripe-band" aria-hidden />
      <div className="border-b border-line bg-linen/95 backdrop-blur-md">
        <div className="wrap flex h-[66px] items-center gap-3 md:h-[80px]">
          <Link href="/" className="group flex shrink-0 items-center gap-3" aria-label={`${business.name}: нүүр хуудас`}>
            <Mark size={46} className="transition duration-700 group-hover:rotate-[45deg] md:h-[54px] md:w-[54px]" />
            <Wordmark />
          </Link>
          <nav aria-label="Үндсэн цэс" className="ml-6 hidden flex-1 items-center gap-5 xl:flex">
            <Link href="/shop" className="underline-gold label-caps !text-[13.5px] pb-1 whitespace-nowrap">
              Бүх бараа
            </Link>
            <Link href="/shop?ready=1" className="underline-gold label-caps !text-[13.5px] pb-1 whitespace-nowrap text-sage">
              Бэлэн бараа
            </Link>
            <Link href="/rooms" className="underline-gold label-caps !text-[13.5px] pb-1 whitespace-nowrap">
              Өрөөгөөр
            </Link>
            <Link href="/shop?sort=new" className="underline-gold label-caps !text-[13.5px] pb-1 whitespace-nowrap">
              Шинэ
            </Link>
            <Link href="/info" className="underline-gold label-caps !text-[13.5px] pb-1 whitespace-nowrap">
              Нөхцөл
            </Link>
          </nav>
          <HeaderTools />
        </div>
        <Scroller as="nav" label="Ангилал" small className="no-bar wrap flex gap-1.5 overflow-x-auto pb-3">
          <Link href="/shop?ready=1" className="chip shrink-0 !text-sage xl:hidden">
            Бэлэн бараа
          </Link>
          <Link href="/rooms" className="chip shrink-0 xl:hidden">
            Өрөөгөөр
          </Link>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="chip shrink-0 !min-h-9 !text-[14.5px]">
              {n.label}
            </Link>
          ))}
        </Scroller>
      </div>
    </header>
  );
}
