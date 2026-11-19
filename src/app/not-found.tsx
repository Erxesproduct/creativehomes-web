import Link from "next/link";
import { Plate } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="wrap py-20 text-center">
      <Plate seed={13}>
        <span className="display block text-[46px] leading-none">404</span>
      </Plate>
      <h1 className="mt-8 text-[32px] md:text-[46px]">Энэ өрөө хоосон байна</h1>
      <p className="mt-2 text-ink-2">Хуудас олдсонгүй. Хаяг буруу эсвэл бараа шилжсэн байж магадгүй.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-ink">
          Бүх бараа
        </Link>
        <Link href="/" className="btn btn-line">
          Нүүр хуудас
        </Link>
      </div>
    </div>
  );
}
