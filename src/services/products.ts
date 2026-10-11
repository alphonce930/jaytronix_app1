import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { seedProducts } from "../data/products";
import type { Product, ProductInput } from "../types/product";
import { db, storage } from "./firebase";

const KEY = "jaytronix-products";

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

export async function getProducts(): Promise<Product[]> {
  if (!db) return localProducts();
  const snapshot = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Product);
}

export async function saveProduct(input: ProductInput, id?: string): Promise<void> {
  const now = new Date().toISOString();
  if (!db) {
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
    await setDoc(doc(db, "products", id), { ...input, updatedAt: now }, { merge: true });
  } else {
    await addDoc(collection(db, "products"), { ...input, createdAt: now, updatedAt: now });
  }
}

export async function removeProduct(id: string): Promise<void> {
  if (!db) {
    saveLocal(localProducts().filter((product) => product.id !== id));
    return;
  }
  await deleteDoc(doc(db, "products", id));
}

export async function uploadMedia(file: File): Promise<string> {
  if (!storage) return URL.createObjectURL(file);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const mediaRef = ref(storage, `products/${crypto.randomUUID()}-${safeName}`);
  await uploadBytes(mediaRef, file, { contentType: file.type });
  return getDownloadURL(mediaRef);
}
