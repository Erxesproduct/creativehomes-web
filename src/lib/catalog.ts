import "server-only";

import data from "@/data/catalog.json";

export type VariantPhoto = { src: string; w: number; h: number; swatch: string };
export type Variant = {
  /** "<zochilProductId>" or "<zochilProductId>-<zochilVariantId>". erxes product code CH-<id>. */
  id: string;
  /** option values joined («Цагаан · 160×200»), null for products without options */
  label: string | null;
  /** option title → value */
  opts: Record<string, string>;
  price: number;
  compareAt: number | null;
  /** Zochil stock; null = not counted (orderable). */
  stock: number | null;
  /** the variant's own photo on Zochil (colour / model), if it has one */
  image: VariantPhoto | null;
};
export type Photo = { src: string; w: number; h: number; thumb: { src: string; w: number; h: number } };
export type Option = { title: string; values: string[] };
export type Product = {
  id: number;
  slug: string;
  title: string;
  /** furniture | lighting | decor | storage | rugs | plants | bedding | kitchen | bath | kids | home | electric | other */
  group: string;
  sub: string | null;
  /** «Бэлэн бараа» (in stock, 24–72 h) or ordered for the customer (7–28 days) */
  ready: boolean;
  /** the shop's own text, line by line */
  lines: string[];
  /** «Key: value» lines from the shop's text (material, size, weight…) */
  specs: { k: string; v: string }[];
  options: Option[];
  /** cheapest first */
  variants: Variant[];
  orders: number;
  featured: boolean;
  /** place on the shop's own bestseller list, -1 when not on it */
  best: number;
  createdAt: string;
  images: Photo[];
};
export type Group = { id: string; name: string; line: string; count: number; subs: string[] };

export const products = data.products as Product[];
export const groups = data.groups as Group[];
export const banners = data.banners as { src: string; w: number; h: number; title: string }[];
export const catalogInfo = { source: data.source, shopId: data.shopId, updatedAt: data.updatedAt };

const bySlug = new Map(products.map((p) => [p.slug, p]));
const byVariant = new Map(products.flatMap((p) => p.variants.map((v) => [v.id, { product: p, variant: v }] as const)));
export const getProduct = (slug: string) => bySlug.get(slug);
export const getVariant = (id: string) => byVariant.get(id);
export const groupName = (id: string) => groups.find((g) => g.id === id)?.name ?? "";
export const fullName = (p: Pick<Product, "title">) => p.title;
export const sku = (id: string) => `CH-${id}`;

/** Rooms: a way to browse the shop's own kinds of goods (navigation only; every product keeps its Zochil kind). */
export const ROOMS = [
  { id: "living", name: "Зочны өрөө", line: "Тавилга, гэрэл, хивс, декор", groups: ["furniture", "lighting", "rugs", "decor", "plants"] },
  { id: "bedroom", name: "Унтлагын өрөө", line: "Дэр, хөнжил, бүтээлэг", groups: ["bedding"] },
  { id: "kitchen", name: "Гал тогоо", line: "Тогоо, аяга таваг, хундага", groups: ["kitchen", "electric"] },
  { id: "bath", name: "Угаалгын өрөө", line: "Тавиур, сагс, хэрэгсэл", groups: ["bath"] },
  { id: "kids", name: "Хүүхдийн өрөө", line: "Аяга таваг, тавилга, тоглоом", groups: ["kids"] },
  { id: "storage", name: "Хадгалалт", line: "Сагс, хайрцаг, гэр ахуй", groups: ["storage", "home"] },
] as const;

export const soldOut = (v: Pick<Variant, "stock">) => v.stock === 0;
export const available = (p: Product) => p.variants.some((v) => !soldOut(v));
export const fromPrice = (p: Product) => p.variants[0].price;
export const priceRange = (p: Product) => {
  const ps = p.variants.map((v) => v.price);
  return { min: Math.min(...ps), max: Math.max(...ps) };
};
export const onSale = (p: Product) => p.variants.some((v) => v.compareAt);
/** The one buyable variant when there is nothing to choose; null when the customer must pick options. */
export const singleVariant = (p: Product) => (p.variants.length === 1 && !soldOut(p.variants[0]) ? p.variants[0].id : null);
/** The card photo (thumb size): the first gallery photo, else the first variant photo. */
export function cover(p: Product): { src: string; w: number; h: number } | null {
  if (p.images[0]) return p.images[0].thumb;
  const v = p.variants.find((x) => x.image)?.image;
  return v ? { src: v.src, w: v.w, h: v.h } : null;
}
export const coverThumb = (p: Product) => cover(p)?.src ?? null;
export const second = (p: Product) => p.images[1]?.thumb.src ?? null;
/** Swatches for a card: the first option whose values have their own photo (colours, models). */
export function swatches(p: Product) {
  const o = p.options[0];
  if (!o) return [];
  const seen = new Map<string, string>();
  for (const v of p.variants) {
    const val = v.opts[o.title];
    if (val && v.image && !seen.has(val)) seen.set(val, v.image.swatch);
  }
  return [...seen].map(([value, src]) => ({ value, src }));
}

/** Spec rows for the product page: the shop's own «Key: value» lines, then the code. */
export function specRows(p: Product) {
  return [...p.specs, { k: "Код", v: sku(p.variants[0].id.split("-")[0]) }];
}

/** In stock first, then the shop's bestseller order, then most ordered on Zochil, then newest. */
const rank = (p: Product) => (p.best < 0 ? 999 : p.best);
export const byPopularity = (a: Product, b: Product) =>
  Number(available(b)) - Number(available(a)) || rank(a) - rank(b) || b.orders - a.orders || Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt);
export const popular = [...products].sort(byPopularity);
export const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id);
export const readyNow = products.filter((p) => p.ready && available(p));
