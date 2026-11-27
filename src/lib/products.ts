import { getSupabasePublicClient } from "./supabase";
import {
  FEATURED_CATEGORIES,
  FEATURED_PRODUCTS,
  type Category,
  type Product,
} from "./data";

interface RawCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  accent_color?: string | null;
  image_url?: string | null;
}

interface RawProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
}

/**
 * Fetches active categories from Supabase at build time.
 * Falls back to starter data if .env is not configured yet.
 */
export async function getActiveCategories(): Promise<Category[]> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return FEATURED_CATEGORIES;

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, accent_color, image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    console.error("Failed to fetch categories:", error?.message);
    return [];
  }

  return (data as RawCategoryRow[]).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? "",
    accent_color: c.accent_color ?? null,
    image_url: c.image_url ?? null,
  }));
}

/**
 * Fetches all active products with their category from Supabase at build time.
 */
export async function getActiveProducts(): Promise<Product[]> {
  const supabase = getSupabasePublicClient();
  if (!supabase) return FEATURED_PRODUCTS;

  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, description, price, compare_at_price, image_url, stock, is_active, categories(name, slug)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch products:", error?.message);
    return [];
  }

  return (data as RawProductRow[]).map((row) => {
    const cat = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description ?? "",
      price: Number(row.price),
      compare_at_price: row.compare_at_price ? Number(row.compare_at_price) : null,
      image_url: row.image_url || "/images/products/product-03.jpg",
      stock: row.stock,
      category: cat?.name ?? "منتجات عامة",
      category_slug: cat?.slug ?? "",
      is_active: row.is_active,
    };
  });
}
