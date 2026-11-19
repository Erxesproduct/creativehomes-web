"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getLiteVariant } from "@/lib/lite";
import { useHearts } from "@/lib/wishlist";
import { BagIcon, CheckIcon, CloseIcon, GridIcon, HeartIcon, HomeIcon, SearchIcon, SofaIcon } from "./icons";

const square = "relative grid h-11 w-11 place-items-center rounded-[2px] bg-paper shadow-[inset_0_0_0_1px_var(--color-line)] transition hover:shadow-[inset_0_0_0_1px_var(--color-gold)] md:h-12 md:w-12";

/** «Сагсанд нэмлээ» toast, shared by the header and the bottom bar. */
function useAdded() {
  const [toast, setToast] = useState<{ n: string; z: string | null; t: string | null } | null>(null);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    let t: number | undefined;
    const onAdd = (e: Event) => {
      const v = getLiteVariant((e as CustomEvent<{ id: string }>).detail.id);
      setToast(v ? { n: v.n, z: v.z, t: v.t } : { n: "", z: null, t: null });
      setBump((b) => b + 1);
      window.clearTimeout(t);
      t = window.setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener("chm:added", onAdd);
    return () => {
      window.removeEventListener("chm:added", onAdd);
      window.clearTimeout(t);
    };
  }, []);
  return { toast, bump, close: () => setToast(null) };
}

export function HeaderTools() {
  const items = useCart();
  const liked = useHearts();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { toast, bump, close } = useAdded();
  const n = cartCount(items);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  return (
    <div className="ml-auto flex items-center gap-2">
      {open ? (
        <form
          role="search"
          className="pop-in fixed inset-x-3 top-3 z-50 flex items-center gap-1 bg-paper py-1 pr-1 pl-4 shadow-[inset_0_0_0_1.5px_var(--color-ink),0_20px_40px_-20px_rgb(25_23_21/0.6)] sm:static sm:inset-auto sm:shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
          onSubmit={(e) => {
            e.preventDefault();
            const q = input.current?.value.trim();
            setOpen(false);
            router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
          }}
        >
          <SearchIcon size={18} className="shrink-0 text-ink-3" />
          <input ref={input} name="q" placeholder="Ширээ, гэрэл, сагс…" aria-label="Хайх" className="min-w-0 flex-1 bg-transparent px-2 text-[16px] outline-none sm:w-[220px] sm:flex-none" />
          <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center hover:bg-sand" aria-label="Хаах">
            <CloseIcon size={18} />
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className={square} aria-label="Хайх">
          <SearchIcon size={20} />
        </button>
      )}
      <Link href="/hearts" className={`${square} hidden md:grid`} aria-label={`Хадгалсан (${liked.length})`}>
        <HeartIcon size={20} filled={liked.length > 0} className={liked.length ? "text-clay" : ""} />
      </Link>
      <Link href="/cart" className="btn btn-ink hidden !min-h-12 !px-5 md:inline-flex" aria-label={`Сагс (${n})`}>
        <BagIcon size={18} />
        Сагс
        {n > 0 && (
          <span key={bump} className="pop-in gold grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[12.5px] tracking-normal text-ink">
            {n}
          </span>
        )}
      </Link>
      {toast && (
        <div role="status" className="pop-in panel fixed right-4 bottom-24 z-50 flex w-[min(380px,calc(100vw-32px))] items-center gap-3 p-3 md:top-32 md:bottom-auto">
          <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden bg-sand">
            {toast.t ? <Image src={toast.t} alt="" fill sizes="64px" className="object-cover" /> : <CheckIcon size={22} />}
          </span>
          <span className="min-w-0 flex-1">
            <b className="label-caps flex items-center gap-1.5 !text-[12px] text-sage">
              <CheckIcon size={14} /> Сагсанд нэмлээ
            </b>
            <span className="block truncate text-[15px]">{toast.n}</span>
            {toast.z && <span className="block truncate text-[13.5px] text-ink-3">{toast.z}</span>}
          </span>
          <Link href="/cart" onClick={close} className="btn btn-ink !min-h-10 !px-4 !text-[13px]">
            Сагс
          </Link>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { href: "/", label: "Нүүр", Icon: HomeIcon },
  { href: "/shop", label: "Бараа", Icon: GridIcon },
  { href: "/rooms", label: "Өрөөгөөр", Icon: SofaIcon },
  { href: "/hearts", label: "Хадгалсан", Icon: HeartIcon },
];

/** Phone bottom bar: the four places people need, plus the cart with its running total. */
export function BottomBar() {
  const items = useCart();
  const path = usePathname();
  const n = cartCount(items);
  const sum = cartSubtotal(items);
  return (
    <nav aria-label="Доод цэс" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-linen/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="grid grid-cols-5">
        {TABS.map(({ href, label, Icon }) => {
          const on = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link key={href} href={href} aria-current={on ? "page" : undefined} className={`flex flex-col items-center gap-0.5 py-2 text-[11.5px] ${on ? "text-ink" : "text-ink-3"}`}>
              <span className={`grid h-8 w-12 place-items-center transition ${on ? "shadow-[inset_0_-2px_0_var(--color-gold)]" : ""}`}>
                <Icon size={21} />
              </span>
              {label}
            </Link>
          );
        })}
        <Link href="/cart" aria-current={path === "/cart" ? "page" : undefined} className="flex flex-col items-center gap-0.5 py-2 text-[11.5px]">
          <span className="relative grid h-8 w-12 place-items-center bg-ink text-paper">
            <BagIcon size={19} />
            {n > 0 && (
              <span key={n} className="pop-in gold absolute -top-1.5 -right-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] text-ink">
                {n}
              </span>
            )}
          </span>
          <span className="text-ink">{n ? formatPrice(sum) : "Сагс"}</span>
        </Link>
      </div>
    </nav>
  );
}
