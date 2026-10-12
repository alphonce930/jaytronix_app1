import { seedProducts } from "../data/products";
import type { Product, ProductInput } from "../types/product";
import { isFirebaseConfigured } from "./firebase";
import { supabase } from "./supabase";

const KEY = "jaytronix-products";
const MEDIA_BUCKET = "product-media";

function toProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    name: String(row.name),
    price: Number(row.price),
    category: row.category as Product["category"],
    shortDescription: String(row.short_description),
    description: String(row.description),
    images: row.images as string[],
    ...(row.video_url ? { videoUrl: String(row.video_url) } : {}),
    available: Boolean(row.available),
    featured: Boolean(row.featured),
    ...(row.is_new === null || row.is_new === undefined ? {} : { isNew: Boolean(row.is_new) }),
    specifications: row.specifications as Record<string, string>,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toProductRow(input: ProductInput, updatedAt: string) {
  return {
    name: input.name,
    price: input.price,
    category: input.category,
    short_description: input.shortDescription,
    description: input.description,
    images: input.images,
    video_url: input.videoUrl || null,
    available: input.available,
    featured: input.featured,
    is_new: input.isNew ?? false,
    specifications: input.specifications,
    updated_at: updatedAt,
  };
}

function localProducts(): Product[] {
  const saved = localStorage.getItem(KEY);
  if (!saved) {
    localStorage.setItem(KEY, JSON.stringify(seedProducts));
    return seedProducts;
  }
  return JSON.parse(saved) as Product[];
}

function saveLocal(products: Product[]) {
  localStorage.setItem(KEY, JSON.stringify(products));
}

function ensureSupabaseConfigured(): void {
  if (!supabase && isFirebaseConfigured) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployment environment.");
  }
}

export async function getProducts(): Promise<Product[]> {
  if (!supabase) {
    ensureSupabaseConfigured();
    return localProducts();
  }
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(`Unable to load products from Supabase: ${error.message}`);
  return (data ?? []).map((row) => toProduct(row));
}

export async function saveProduct(input: ProductInput, id?: string): Promise<void> {
  const now = new Date().toISOString();
  if (!supabase) {
    ensureSupabaseConfigured();
    const products = localProducts();
    if (id) {
      saveLocal(products.map((product) => product.id === id ? { ...product, ...input, updatedAt: now } : product));
    } else {
      const next = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
      saveLocal([next, ...products]);
    }
    return;
  }
  if (id) {
    const { error } = await supabase.from("products").update(toProductRow(input, now)).eq("id", id);
    if (error) throw new Error(`Unable to update product in Supabase: ${error.message}`);
  } else {
    const { error } = await supabase.from("products").insert({ ...toProductRow(input, now), created_at: now });
    if (error) throw new Error(`Unable to create product in Supabase: ${error.message}`);
  }
}

export async function removeProduct(id: string): Promise<void> {
  if (!supabase) {
    ensureSupabaseConfigured();
    saveLocal(localProducts().filter((product) => product.id !== id));
    return;
  }
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(`Unable to delete product from Supabase: ${error.message}`);
}

export async function uploadMedia(file: File): Promise<string> {
  if (!supabase) {
    ensureSupabaseConfigured();
    return URL.createObjectURL(file);
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `products/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(`Unable to upload product media to Supabase: ${error.message}`);
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
