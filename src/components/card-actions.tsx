"use client";

import { useState } from "react";
import { cart } from "@/lib/cart";
import { hearts, useHearts } from "@/lib/wishlist";
import { CheckIcon, HeartIcon, PlusIcon } from "./icons";

/** The heart on a product photo. */
export function HeartButton({ slug, className = "" }: { slug: string; className?: string }) {
  const liked = useHearts().includes(slug);
  return (
    <button
      type="button"
      onClick={() => hearts.toggle(slug)}
      aria-pressed={liked}
      aria-label={liked ? "Хадгалснаас хасах" : "Хадгалах"}
      className={`grid h-10 w-10 place-items-center rounded-full bg-paper/95 shadow-[0_6px_16px_-8px_rgb(25_23_21/0.6)] transition hover:scale-110 ${liked ? "text-clay" : "text-ink-2"} ${className}`}
    >
      <span key={String(liked)} className={liked ? "pop-in" : ""}>
        <HeartIcon size={18} filled={liked} />
      </span>
    </button>
  );
}

/** «+» straight to the cart, for products with nothing to choose. */
export function QuickAdd({ variantId, label }: { variantId: string; label: string }) {
  const [done, setDone] = useState(0);
  return (
    <button
      type="button"
      onClick={() => {
        cart.add(variantId);
        setDone((n) => n + 1);
      }}
      aria-label={`${label}: сагсанд нэмэх`}
      className={`grid h-10 w-10 shrink-0 place-items-center transition ${done ? "gold text-ink" : "bg-ink text-paper hover:bg-[#2d2a26]"}`}
    >
      <span key={done} className={done ? "pop-in" : ""}>
        {done ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
      </span>
    </button>
  );
}
