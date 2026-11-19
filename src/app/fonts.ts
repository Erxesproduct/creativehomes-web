import { Arsenal, Prata, Roboto_Condensed } from "next/font/google";

// All three have Ө ө Ү ү (checked in the Google Fonts cmap).
/** Headings and prices: a refined high-contrast serif, like a furniture house's catalogue. */
export const display = Prata({ subsets: ["latin", "cyrillic", "cyrillic-ext"], weight: ["400"], variable: "--font-display", display: "swap" });
/** Body text: a calm humanist sans with clear Cyrillic. */
export const body = Arsenal({ subsets: ["latin", "cyrillic", "cyrillic-ext"], weight: ["400", "700"], variable: "--font-body", display: "swap" });
/** Labels, buttons, menu: condensed capitals like the logo's «CREATIVE HOMES MONGOLIA». */
export const label = Roboto_Condensed({ subsets: ["latin", "cyrillic", "cyrillic-ext"], weight: ["400", "500", "700"], variable: "--font-label", display: "swap" });
