import Link from "next/link";
import { business } from "@/content/business";
import { Mark } from "./brand";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon } from "./icons";
import { NAV } from "./header";

export function Footer() {
  const contacts = [
    { href: `tel:${business.phone.tel}`, Icon: PhoneIcon, k: "Утас", v: business.phone.display },
    { href: `mailto:${business.email}`, Icon: MailIcon, k: "Имэйл", v: business.email },
    { href: business.facebook, Icon: FacebookIcon, k: "Facebook чат", v: "facebook.com/diywithlovelove" },
    { href: business.instagram, Icon: InstagramIcon, k: "Instagram", v: "@creative_homes_mongolia" },
  ];
  return (
    <footer id="contact" className="mt-24 bg-ink pb-24 text-[#e9e1d3] md:pb-0">
      <div className="stripe-band opacity-90" aria-hidden />
      <div className="wrap grid gap-12 py-14 md:grid-cols-[1.2fr_1fr] md:py-16">
        <div>
          <div className="flex items-center gap-4">
            <Mark size={64} />
            <div>
              <p className="label-caps !text-[15px] !tracking-[0.2em] text-white">Creative Homes Mongolia</p>
              <p className="display mt-1 text-[22px] text-gold-2">{business.tagline}</p>
            </div>
          </div>
          <p className="mt-6 max-w-lg text-[15.5px] leading-relaxed text-[#c9bfb0]">{business.about.join(" ")}</p>
          <p className="mt-3 max-w-lg text-[14.5px] text-[#a89e90]">{business.address.join(" ")}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {contacts.map(({ href, Icon, k, v }) => (
              <li key={k}>
                <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="group flex items-center gap-3 border border-white/12 bg-white/[0.04] p-3.5 transition hover:border-gold-2/60 hover:bg-white/[0.07]">
                  <span className="gold grid h-11 w-11 shrink-0 place-items-center text-ink">
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="label-caps block !text-[11px] text-[#a89e90]">{k}</span>
                    <span className="block truncate text-[15px] text-white group-hover:text-gold-2">{v}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid grid-cols-2 gap-8 text-[15px]">
          <div>
            <p className="label-caps text-gold-2">Бараа</p>
            <ul className="mt-4 space-y-2.5">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="hover:text-white">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-caps text-gold-2">Мэдээлэл</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/shop?ready=1" className="hover:text-white">
                  Бэлэн бараа
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="hover:text-white">
                  Өрөөгөөр сонгох
                </Link>
              </li>
              <li>
                <Link href="/info#kinds" className="hover:text-white">
                  Захиалгын хугацаа
                </Link>
              </li>
              <li>
                <Link href="/info#payment" className="hover:text-white">
                  Төлбөр, хуваан төлөх
                </Link>
              </li>
              <li>
                <Link href="/info#delivery" className="hover:text-white">
                  Хүргэлт
                </Link>
              </li>
              <li>
                <Link href="/info#faq" className="hover:text-white">
                  Түгээмэл асуулт
                </Link>
              </li>
              <li>
                <Link href="/hearts" className="hover:text-white">
                  Хадгалсан
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-5 text-[13px] text-[#a89e90]">
          <span>© {business.since}–{new Date().getFullYear()} {business.name}</span>
          <span>Онлайн дэлгүүр · {business.domain}</span>
        </div>
      </div>
    </footer>
  );
}
