import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";

export const metadata: Metadata = { title: "Сагс", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="wrap pt-10 pb-10 md:pt-14">
      <p className="label-caps text-gold">Сагс, захиалга</p>
      <h1 className="mt-2 mb-8 text-[38px] leading-tight md:text-[52px]">Таны сонголт</h1>
      <Checkout />
    </div>
  );
}
