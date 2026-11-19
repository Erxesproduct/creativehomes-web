import data from "@/data/catalog.json";

/**
 * Business facts from creativehomes.mn (Zochil shop 29950: shop settings, payment and delivery rules, terms of service,
 * FAQ, about page, banner), read on 2026-11-19. Nothing here is invented; open points are in docs/erxes/MANUAL-STEPS.md.
 */
const shop = data.shop;

export const business = {
  name: "Creative Homes Mongolia",
  short: "Creative Homes",
  domain: "creativehomes.mn",
  /** The home banner's own words. */
  tagline: "Create spaces you love",
  since: 2017,
  /** Zochil shop description and the about page, word for word. */
  description: shop.description.join(" "),
  about: shop.about,
  phone: { display: "9917-2054", tel: "+97699172054" },
  email: shop.email,
  facebook: "https://www.facebook.com/diywithlovelove",
  instagram: "https://www.instagram.com/creative_homes_mongolia",
  /** Zochil address: the shop works online only (no showroom, no pickup point). */
  address: shop.address,

  /**
   * Zochil payment rule: paid in full when the order is confirmed, by bank account, QPay or other means. Every Zochil
   * checkout method (QPay, StorePay, Pocket, Sono) is switched off, so the website offers QPay through erxes and the
   * shop's Khan Bank account (open question 1).
   */
  payments: [
    { id: "qpay", name: "QPay", note: "Аль ч банкны аппаар QR уншуулж төлнө. Захиалга өгсний дараа төлбөрийн хуудас нээгдэнэ." },
    { id: "transfer", name: "Дансаар шилжүүлэх", note: "Хаан банкны дансанд захиалгын кодоо гүйлгээний утгад бичиж шилжүүлнэ." },
  ],
  bank: { bank: "Хаан банк", account: "5040557036", holder: "Болорцэцэг" },
  /** Instalment apps named in the shop's terms; the website cannot take them yet (open question 2). */
  leasing: ["PocketZero", "StorePay", "Sono", "LendMN", "Simple"],

  /**
   * Zochil has no delivery option with a price: the fee depends on the zone, the number and size of the items, and is
   * paid to the courier on arrival. So the online total is the goods only.
   */
  delivery: [{ id: "city", name: "Таны хаягт хүргэнэ", note: "Хүргэлтийн төлбөрийг бараагаа хүлээн авахдаа хүргэлтийн ажилтанд төлнө." }],

  /** The two kinds of goods, from the shop's terms (1. Худалдан авалтын төрөл, 2. Захиалгын хугацаа). */
  kinds: {
    ready: { name: "Бэлэн бараа", short: "Бэлэн", time: "24–72 цаг", text: "Манай дэлгүүрт байгаа бүтээгдэхүүнийг шууд худалдан авч 24–72 цагт багтаан хүргүүлэн авна." },
    order: {
      name: "Захиалгын бараа",
      short: "Захиалгаар",
      time: "7–28 хоног",
      text: "Танилцуулсан сонголтоос хүссэн бүтээгдэхүүнээ захиалан авна. Гааль, тээвэр болон бусад шалтгаанаар хугацаа сунах магадлалтай тул хэт яаралтай захиалга авдаггүй.",
    },
  },

  rules: {
    /** Zochil payment rule, word for word. */
    payment: "Төлбөрийг захиалга баталгаажуулах үед бүрэн төлнө. Төлбөрийг банкны данс, QPAY болон бусад аргаар хийж болно.",
    /** Zochil delivery rule, word for word. */
    delivery:
      "Бэлэн бараа 24–72 цагийн дотор таны өгсөн хаягт хүргэгдэнэ. Захиалгын бараа захиалга ирсний дараа мөн 24–72 цагийн дотор таны өгсөн хаягт хүргэгдэнэ.",
    deliveryFee: "Хүргэлтийн төлбөр нь бүсээс шалтгаалан мөн барааны тоо ширхэг, овор хэмжээнээс хамааран өөр өөр байна. Та хүргэлтийн төлбөрөө хүргэлтээ хүлээн авсны дараа хүргэлтийн ажилтанд өгөхийг анхаарна уу.",
    /** Terms: site prices do not include cargo and delivery. */
    cargo: "Сайтад орсон бүх барааны үнэ карго болон хүргэлтийн төлбөр ороогүй үнэ бөгөөд захиалгын барааг хүлээн авахдаа карго болон хүргэлтийн төлбөрийг төлж бараагаа авна.",
    quality: "Чанарыг нэн тэргүүнд тавьж, хамгийн хямд чанаргүй хувилбараас татгалздаг.",
    noReturn: "Захиалга баталгаажсаны дараа буцаалт, цуцлалт хийхгүй тул сонголтоо сайтар нягтална уу.",
    custom: "Таны хайсан бараа сайтад байхгүй бол зургаа бидэнд чатаар илгээгээд захиалга өгөх боломжтой.",
    notify: "Захиалга ирсэн даруй таны бүртгэлтэй утасны дугаарт мэдээлэл очно.",
    countryside: "Орон нутагт хүргүүлэх бол захиалгаа өгөхөөсөө өмнө утсаар эсвэл чатаар тохирно уу.",
    ebarimt: "И-баримтыг төлбөр баталгаажсаны дараа erxes-ээс албан ёсоор олгоно. Байгууллагаар авах бол 7 оронтой регистрийн дугаараа бичнэ үү.",
  },
  /** Zochil FAQ (every question was there twice). */
  faq: shop.faq,
} as const;

export type DeliveryId = (typeof business.delivery)[number]["id"];
export type PaymentId = (typeof business.payments)[number]["id"];
export const deliveryOption = (id: DeliveryId) => business.delivery.find((d) => d.id === id) ?? business.delivery[0];
export const paymentOption = (id: PaymentId) => business.payments.find((p) => p.id === id)!;

/** Not charged online: the courier takes the fee on arrival (it depends on the zone and the size of the goods). */
export function deliveryFee(): number {
  return 0;
}

/**
 * Order statuses staff move an order through (erxes Sales pipeline stages, see MANUAL-STEPS.md). The «on the way» and
 * «arrived» steps are for ordered goods (7–28 days); goods in stock go from «packing» to «out for delivery».
 */
export const ORDER_STATUSES = [
  { id: "pending", name: "Хүлээгдэж байна", note: "Захиалга ирсэн, төлбөр хүлээгдэж байна" },
  { id: "confirmed", name: "Баталгаажсан", note: "Төлбөр бүрэн орсон: буцаалт, цуцлалт хийхгүй" },
  { id: "ordered", name: "Захиалга хийгдсэн", note: "Захиалгын бараа: 7–28 хоногт ирнэ" },
  { id: "arrived", name: "Бараа ирсэн", note: "Бүртгэлтэй утсанд тань мэдэгдэнэ" },
  { id: "shipped", name: "Хүргэлтэд гарсан", note: "24–72 цагт хүргэнэ, хүргэлтийн төлбөрийг ажилтанд" },
  { id: "delivered", name: "Хүргэгдсэн", note: "Хүлээн авсан" },
  { id: "cancelled", name: "Цуцлагдсан", note: "Төлбөр төлөгдөөгүй" },
] as const;
