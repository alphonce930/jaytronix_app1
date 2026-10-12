import { useCallback, useEffect, useState } from "react";
import { getProducts } from "../services/products";
import type { Product } from "../types/product";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setProducts(await getProducts());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn't load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  return { products, loading, error, refresh };
}
