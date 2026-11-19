// node scripts/export-erxes.mjs → docs/erxes/creativehomes-{categories,products,delivery}.csv
// Files for erxes Products & Services import (Settings → Import). Every row comes from src/data/catalog.json.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const c = JSON.parse(readFileSync(path.join(root, "src/data/catalog.json"), "utf8"));
const out = path.join(root, "docs/erxes");
mkdirSync(out, { recursive: true });

const cell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (rows) => "﻿" + rows.map((r) => r.map(cell).join(",")).join("\n") + "\n";
const code = (id) => `CH-${id.toUpperCase()}`;

// categories: CH → the groups (furniture, lighting, decor, …) → their sub-categories, plus delivery
const cats = [["code", "name", "parent code"], ["CH", "Creative Homes", ""]];
for (const g of c.groups) {
  cats.push([code(g.id), g.name, "CH"]);
  for (const [i, s] of (g.subs ?? []).entries()) cats.push([`${code(g.id)}-${i + 1}`, typeof s === "string" ? s : s.name, code(g.id)]);
}
cats.push(["CH-DELIVERY", "Хүргэлт", "CH"]);
writeFileSync(path.join(out, "creativehomes-categories.csv"), csv(cats));

const subCode = (p) => {
  const g = c.groups.find((x) => x.id === p.group);
  const i = (g?.subs ?? []).findIndex((s) => (typeof s === "string" ? s : s.name) === p.sub);
  return i >= 0 ? `${code(p.group)}-${i + 1}` : code(p.group);
};
const rows = [["code", "name", "category code", "type", "unit price", "price before sale", "options", "kind", "specs", "stock (Zochil)", "zochil product id", "image (website path)"]];
for (const p of c.products)
  for (const v of p.variants)
    rows.push([
      `CH-${v.id}`,
      [p.title, v.label].filter(Boolean).join(" · ").slice(0, 200),
      subCode(p),
      "product",
      v.price,
      v.compareAt ?? "",
      Object.entries(v.opts ?? {}).map(([k, x]) => `${k}=${x}`).join("; "),
      p.ready ? "Бэлэн (24–72 цаг)" : "Захиалгаар (7–28 хоног)",
      (p.specs ?? []).map((s) => `${s.k}=${s.v}`).join("; "),
      v.stock ?? "",
      p.id,
      v.image?.src ?? p.images[0]?.src ?? "",
    ]);
writeFileSync(path.join(out, "creativehomes-products.csv"), csv(rows));

// one placeholder row per zone: the shop has no fixed fee (it depends on the zone and the size; the courier takes it)
writeFileSync(
  path.join(out, "creativehomes-delivery.csv"),
  csv([
    ["code", "name", "category code", "type", "unit price", "source"],
    ["CH-DELIVERY-city", "Хүргэлт: Улаанбаатар (бүс, овор хэмжээнээс хамаарна)", "CH-DELIVERY", "service", 0, "Zochil delivery rule: fee paid to the courier on arrival; amounts are an open question"],
    ["CH-DELIVERY-cargo", "Карго (захиалгын бараа)", "CH-DELIVERY", "service", 0, "Zochil terms: cargo paid on receipt; amount set per order"],
  ]),
);
console.log(`categories ${cats.length - 1}, products ${rows.length - 1}, delivery 2`);
