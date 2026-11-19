import type { Metadata } from "next";
import { Plate } from "@/components/brand";
import { BankIcon, ChatIcon, ClockIcon, QrIcon, ShieldIcon, TruckIcon } from "@/components/icons";
import { business, ORDER_STATUSES } from "@/content/business";

export const metadata: Metadata = {
  title: "Нөхцөл: захиалга, төлбөр, хүргэлт",
  description: `Бэлэн бараа 24–72 цагт, захиалгын бараа 7–28 хоногт. ${business.rules.payment} Хүргэлтийн төлбөрийг хүлээн авахдаа.`,
  alternates: { canonical: "/info" },
};

const LINKS = [
  ["about", "Бидний тухай"],
  ["kinds", "Бэлэн ба захиалгын бараа"],
  ["payment", "Төлбөр"],
  ["delivery", "Хүргэлт"],
  ["steps", "Захиалгын явц"],
  ["ebarimt", "И-баримт"],
  ["faq", "Асуулт"],
] as const;

export default function InfoPage() {
  const { ready, order } = business.kinds;
  return (
    <>
      <section className="sand border-b border-line">
        <div className="wrap pt-10 pb-9 md:pt-14 md:pb-12">
          <Plate seed={9}>
            <span className="label-caps block !text-[12px]">Since {business.since}</span>
          </Plate>
          <h1 className="mt-6 text-[40px] leading-tight md:text-[56px]">Захиалгын нөхцөл</h1>
          <nav className="no-bar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Хэсгүүд">
            {LINKS.map(([id, name]) => (
              <a key={id} href={`#${id}`} className="chip shrink-0">
                {name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="wrap">
        <section id="about" className="mt-14 grid scroll-mt-44 gap-8 lg:grid-cols-[1fr_1.2fr]">
          <h2 className="text-[30px] md:text-[38px]">Бидний тухай</h2>
          <div className="space-y-3 text-[17px] leading-relaxed text-ink-2">
            {business.about.map((l) => (
              <p key={l}>{l}</p>
            ))}
            <p>{business.description}</p>
            <p className="text-ink-3">{business.address.join(" ")}</p>
          </div>
        </section>

        <section id="kinds" className="mt-16 scroll-mt-44 border-t border-line pt-14">
          <h2 className="text-[30px] md:text-[38px]">Бэлэн ба захиалгын бараа</h2>
          <p className="mt-2 text-ink-2">Захиалга өгөхөөсөө өмнө бараа бэлэн эсвэл захиалгын эсэхийг сайтар харж танилцаарай.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="bg-paper p-7 shadow-[0_0_0_1px_var(--color-line)]">
              <span className="tag bg-sage text-white">{ready.name}</span>
              <p className="display mt-4 text-[38px] leading-none">{ready.time}</p>
              <p className="mt-3 text-ink-2">{ready.text}</p>
            </div>
            <div className="bg-ink p-7 text-[#e9e1d3]">
              <span className="tag gold text-ink">{order.name}</span>
              <p className="display mt-4 text-[38px] leading-none text-white">{order.time}</p>
              <p className="mt-3 text-[#c9bfb0]">{order.text}</p>
            </div>
          </div>
          <ul className="mt-6 grid gap-3 text-[15.5px] md:grid-cols-2">
            {[
              [ShieldIcon, business.rules.quality],
              [ShieldIcon, business.rules.noReturn],
              [TruckIcon, business.rules.cargo],
              [ChatIcon, business.rules.custom],
            ].map(([Icon, t], i) => {
              const I = Icon as typeof ShieldIcon;
              return (
                <li key={i} className="flex gap-3 bg-linen p-4 shadow-[0_0_0_1px_var(--color-line)]">
                  <I size={19} className="mt-0.5 shrink-0 text-gold" />
                  <span>{t as string}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="payment" className="mt-16 scroll-mt-44 border-t border-line pt-14">
          <h2 className="text-[30px] md:text-[38px]">Төлбөр</h2>
          <p className="mt-2 text-[17px] text-ink-2">{business.rules.payment}</p>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="bg-paper p-6 shadow-[0_0_0_1px_var(--color-line)]">
              <QrIcon size={24} className="text-gold" />
              <b className="display mt-3 block text-[22px] font-normal">QPay</b>
              <p className="mt-1 text-[15px] text-ink-2">{business.payments[0].note}</p>
            </div>
            <div className="bg-paper p-6 shadow-[0_0_0_1px_var(--color-line)]">
              <BankIcon size={24} className="text-gold" />
              <b className="display mt-3 block text-[22px] font-normal">Дансаар</b>
              <p className="mt-1 text-[15px] text-ink-2">
                {business.bank.bank} {business.bank.account}. Гүйлгээний утгад захиалгын кодоо бичнэ.
              </p>
            </div>
            <div className="gold p-6 text-ink">
              <ClockIcon size={24} />
              <b className="display mt-3 block text-[22px] font-normal">Хуваан төлөх</b>
              <p className="mt-1 text-[15px]">
                {business.leasing.join(", ")} апп-аар хуваан төлөх боломжтой. Онлайн сагсаар одоогоор авахгүй тул{" "}
                <a href={`tel:${business.phone.tel}`} className="font-bold underline underline-offset-4">
                  {business.phone.display}
                </a>{" "}
                дугаараар захиална уу.
              </p>
            </div>
          </div>
        </section>

        <section id="delivery" className="mt-16 scroll-mt-44 border-t border-line pt-14">
          <h2 className="text-[30px] md:text-[38px]">Хүргэлт</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div className="space-y-3 text-[17px] leading-relaxed text-ink-2">
              <p>{business.rules.delivery}</p>
              <p>{business.rules.deliveryFee}</p>
            </div>
            <div className="space-y-3 text-[16px] text-ink-2">
              <p className="bg-sand p-4">{business.rules.cargo}</p>
              <p className="bg-sand p-4">{business.rules.countryside}</p>
            </div>
          </div>
        </section>

        <section id="steps" className="mt-16 scroll-mt-44 border-t border-line pt-14">
          <h2 className="text-[30px] md:text-[38px]">Захиалгын явц</h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ORDER_STATUSES.filter((s) => s.id !== "cancelled").map((s, i) => (
              <li key={s.id} className="flex gap-4 bg-paper p-5 shadow-[0_0_0_1px_var(--color-line)]">
                <span className="display grid h-10 w-10 shrink-0 place-items-center bg-ink text-[17px] text-paper">{i + 1}</span>
                <span>
                  <b className="block">{s.name}</b>
                  <span className="text-[14.5px] text-ink-2">{s.note}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[15px] text-ink-3">{business.rules.notify}</p>
        </section>

        <section id="ebarimt" className="mt-16 scroll-mt-44 border-t border-line pt-14">
          <h2 className="text-[30px] md:text-[38px]">И-баримт</h2>
          <p className="mt-3 max-w-3xl text-[17px] text-ink-2">{business.rules.ebarimt}</p>
        </section>

        <section id="faq" className="mt-16 scroll-mt-44 border-t border-line pt-14">
          <h2 className="text-[30px] md:text-[38px]">Түгээмэл асуулт</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {business.faq.map((f) => (
              <details key={f.q + f.a} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-bold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-[22px] leading-none text-gold transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="pb-5 text-ink-2">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
