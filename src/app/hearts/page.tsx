import type { Metadata } from "next";
import { HeartsView } from "@/components/hearts-view";

export const metadata: Metadata = { title: "Хадгалсан", robots: { index: false } };

export default function HeartsPage() {
  return (
    <div className="wrap pt-10 md:pt-14">
      <p className="label-caps text-gold">Миний сонголт</p>
      <h1 className="mt-2 text-[38px] leading-tight md:text-[52px]">Хадгалсан</h1>
      <HeartsView />
    </div>
  );
}
