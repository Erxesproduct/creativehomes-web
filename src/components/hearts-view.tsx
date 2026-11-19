"use client";

import Image from "next/image";
import Link from "next/link";
import { cart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { liteProducts } from "@/lib/lite";
import { hearts, useHearts } from "@/lib/wishlist";
import { Torn } from "./brand";
import { HeartIcon, PlusIcon } from "./icons";

export function HeartsView() {
  const slugs = useHearts();
  const list = slugs.flatMap((s) => liteProducts.filter((p) => p.s === s));
  if (!list.length)
    return (
      <div className="sand mx-auto mt-10 max-w-lg p-3">
        <Torn seed={11} className="px-8 py-12 text-center">
          <HeartIcon size={30} className="mx-auto text-gold" />
          <p className="display mt-4 text-[28px]">Одоохондоо хоосон</p>
          <p className="mt-2 text-ink-2">Таалагдсан барааныхаа ♥ дээр дараад энд хадгалаарай. Энэ төхөөрөмж дээр хадгалагдана.</p>
          <Link href="/shop" className="btn btn-ink mt-7">
            Бараа үзэх
          </Link>
        </Torn>
      </div>
    );
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <li key={p.s} className="panel flex gap-4 p-3">
          <Link href={`/p/${p.s}`} className="relative h-28 w-24 shrink-0 overflow-hidden bg-sand">
            {p.t && <Image src={p.t} alt="" fill sizes="96px" className="object-cover" />}
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <Link href={`/p/${p.s}`} className="line-clamp-2 leading-snug font-bold hover:text-gold">
              {p.n}
            </Link>
            <span className="mt-auto flex items-center gap-2 pt-1">
              <b className="display mr-auto text-[18px] font-normal">{formatPrice(p.p)}</b>
              <button type="button" onClick={() => hearts.toggle(p.s)} className="grid h-10 w-10 place-items-center bg-clay-3 text-clay" aria-label="Хадгалснаас хасах">
                <HeartIcon size={17} filled />
              </button>
              {!p.a ? (
                <span className="text-[13.5px] text-ink-3">Дууссан</span>
              ) : p.v ? (
                <button type="button" onClick={() => cart.add(p.v!)} className="grid h-10 w-10 place-items-center bg-ink text-paper" aria-label="Сагсанд нэмэх">
                  <PlusIcon size={17} />
                </button>
              ) : (
                <Link href={`/p/${p.s}`} className="btn btn-line !min-h-10 !px-3 !text-[12px]">
                  Сонгох
                </Link>
              )}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
