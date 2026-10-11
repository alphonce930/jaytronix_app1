import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import type { Product } from "../types/product";

export const formatPrice = (price: number) => new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 }).format(price);

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link to={`/products/${product.id}`} className="relative block aspect-[4/3] overflow-hidden rounded-[1.15rem] bg-mist">
        <img src={product.images[0]} alt={product.name} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.featured && <span className="rounded-full bg-lime px-3 py-1 text-[0.65rem] font-black uppercase tracking-wider text-navy">Featured</span>}
          {product.isNew && <span className="rounded-full bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-wider text-navy">New</span>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.68rem] font-black uppercase tracking-[0.15em] text-emerald">{product.category}</p>
        <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">{product.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{product.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div><p className="text-xs text-muted">From</p><p className="font-display text-lg font-bold">{formatPrice(product.price)}</p></div>
          <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`} className="grid size-11 shrink-0 place-items-center rounded-full bg-navy text-white transition group-hover:bg-lime group-hover:text-navy"><ArrowUpRight className="size-5" /></Link>
        </div>
      </div>
    </article>
  );
}
