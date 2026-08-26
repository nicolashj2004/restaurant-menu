import type { Category, ProductWithRelations, RestaurantSettings } from "@/lib/types/domain";

/** Pure, client-safe helpers shared between server and client menu components. */

/** Splits a flat category list into top-level categories and a lookup of each one's children (one level deep). */
export function groupByParent(categories: Category[]) {
  const topLevel = categories.filter((c) => c.parent_id === null);
  const childrenOf = (parentId: string) => categories.filter((c) => c.parent_id === parentId);
  return { topLevel, childrenOf };
}

/**
 * Deterministic shuffle seeded by a string (e.g. a product id). Looks random and
 * varies from item to item, but — unlike Math.random() — gives the exact same
 * order on the server render and the client hydration, so it can't cause a
 * hydration mismatch.
 */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function searchProducts(all: ProductWithRelations[], query: string): ProductWithRelations[] {
  const q = query.trim().toLowerCase();
  if (!q) return all;
  return all.filter((p) => {
    const haystack = [
      p.name,
      p.short_description ?? "",
      p.description ?? "",
      p.category?.name ?? "",
      ...p.ingredients.map((i) => i.name),
      ...p.tags.map((t) => t.name),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

/**
 * Picks up to `limit` other products, round-robining one per category per pass
 * so the result spans every section instead of filling up with same-category
 * items first (the product's own category still goes first each pass).
 */
export function getRelatedProducts(
  product: ProductWithRelations,
  all: ProductWithRelations[],
  limit = 6
): ProductWithRelations[] {
  const others = all.filter((p) => p.id !== product.id && p.is_available);

  const byCategory = new Map<string, ProductWithRelations[]>();
  for (const p of others) {
    const key = p.category_id ?? "";
    const list = byCategory.get(key);
    if (list) list.push(p);
    else byCategory.set(key, [p]);
  }

  const categoryOrder = [...byCategory.keys()].sort((a, b) => {
    if (a === product.category_id) return -1;
    if (b === product.category_id) return 1;
    return 0;
  });

  const result: ProductWithRelations[] = [];
  for (let round = 0; result.length < limit; round++) {
    const before = result.length;
    for (const key of categoryOrder) {
      const item = byCategory.get(key)?.[round];
      if (item) result.push(item);
      if (result.length >= limit) break;
    }
    if (result.length === before) break; // every category exhausted
  }
  return result;
}

export type QuickFilter =
  | "vegetariano"
  | "vegano"
  | "sin-gluten"
  | "picante"
  | "mas-vendido"
  | "recomendado"
  | "nuevo";

export function applyQuickFilter(products: ProductWithRelations[], filter: QuickFilter | null) {
  if (!filter) return products;
  switch (filter) {
    case "vegetariano":
      return products.filter((p) => p.tags.some((t) => t.slug === "vegetariano"));
    case "vegano":
      return products.filter((p) => p.tags.some((t) => t.slug === "vegano"));
    case "sin-gluten":
      return products.filter((p) => !p.allergens.some((a) => a.name.toLowerCase() === "gluten"));
    case "picante":
      return products.filter((p) => p.spice_level > 0);
    case "mas-vendido":
      return products.filter((p) => p.is_bestseller);
    case "recomendado":
      return products.filter((p) => p.is_featured || p.is_chef_recommendation);
    case "nuevo":
      return products.filter((p) => p.is_new);
    default:
      return products;
  }
}

export function formatCurrency(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale || "es-CO", {
      style: "currency",
      currency: currency || "COP",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `$${amount.toLocaleString()}`;
  }
}

/** Is the restaurant open right now, based on restaurant_settings.opening_hours? */
export function isRestaurantOpenNow(settings: RestaurantSettings | null): boolean {
  if (!settings?.opening_hours) return false;
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const now = new Date();
  const day = days[now.getDay()];
  const ranges = settings.opening_hours[day];
  if (!ranges || ranges.length === 0) return false;

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  return ranges.some(({ open, close }) => {
    const [oh, om] = open.split(":").map(Number);
    const [ch, cm] = close.split(":").map(Number);
    const openMin = oh * 60 + om;
    const closeMin = ch * 60 + cm;
    return minutesNow >= openMin && minutesNow <= closeMin;
  });
}

export function todaysHoursLabel(settings: RestaurantSettings | null): string | null {
  if (!settings?.opening_hours) return null;
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
  const today = days[new Date().getDay()];
  const ranges = settings.opening_hours[today];
  if (!ranges || ranges.length === 0) return null;
  return ranges.map((r) => `${r.open} – ${r.close}`).join(", ");
}

/**
 * crypto.randomUUID() only exists in secure contexts (HTTPS or localhost) — it's
 * undefined when the menu is opened over plain HTTP via a LAN IP, which breaks
 * hydration entirely if left uncaught. getRandomValues has no such restriction.
 */
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "server";
  const key = "menu_session_id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = generateId();
    window.localStorage.setItem(key, id);
  }
  return id;
}
