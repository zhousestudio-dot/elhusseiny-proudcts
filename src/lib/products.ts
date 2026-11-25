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
}

interface RawProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
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
    .select("id, name, slug, description")
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
    .select("id, name, slug, description, price, image_url, stock, is_active, categories(name, slug)")
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
      image_url: row.image_url || "/images/prod-1.svg",
      stock: row.stock,
      category: cat?.name ?? "منتجات عامة",
      category_slug: cat?.slug ?? "",
      is_active: row.is_active,
    };
  });
}
