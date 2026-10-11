import { ArrowLeft, Check, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { formatPrice } from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";

export default function ProductPage() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((item) => item.id === id);
  const [activeImage, setActiveImage] = useState(0);

  if (loading) return <div className="mx-auto min-h-[60vh] max-w-7xl animate-pulse px-5 py-16"><div className="h-[32rem] rounded-3xl bg-mist" /></div>;
  if (!product) return <div className="mx-auto min-h-[60vh] max-w-7xl px-5 py-24 text-center"><h1 className="font-display text-4xl font-semibold">Product not found</h1><Link to="/#products" className="mt-6 inline-flex font-bold text-emerald">Back to products</Link></div>;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <Link to="/#products" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-navy"><ArrowLeft className="size-4" /> Back to products</Link>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-mist"><img src={product.images[activeImage]} alt={product.name} className="size-full object-cover" /></div>
          {product.images.length > 1 && <div className="mt-3 flex gap-3">{product.images.map((image, index) => <button key={image} onClick={() => setActiveImage(index)} className={`size-20 overflow-hidden rounded-xl border-2 ${index === activeImage ? "border-navy" : "border-transparent"}`}><img src={image} alt="" className="size-full object-cover" /></button>)}</div>}
        </div>
        <div className="lg:py-5">
          <div className="flex items-center gap-3"><p className="text-xs font-black uppercase tracking-widest text-emerald">{product.category}</p>{product.featured && <span className="rounded-full bg-lime px-3 py-1 text-xs font-bold">Featured</span>}</div>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight lg:text-6xl">{product.name}</h1>
          <p className="mt-5 text-lg leading-8 text-muted">{product.description}</p>
          <p className="mt-8 font-display text-3xl font-bold">{formatPrice(product.price)}</p>
          <div className={`mt-4 flex items-center gap-2 text-sm font-bold ${product.available ? "text-emerald" : "text-red-600"}`}><span className={`size-2 rounded-full ${product.available ? "bg-emerald" : "bg-red-600"}`} /> {product.available ? "In stock and ready" : "Currently unavailable"}</div>
          <a href={`https://wa.me/255712345678?text=${encodeURIComponent(`Hello Jaytronix, I'm interested in the ${product.name}.`)}`} className={`mt-8 flex min-h-14 w-full items-center justify-center rounded-full bg-navy px-6 font-bold text-white transition hover:bg-navy-light ${!product.available ? "pointer-events-none opacity-50" : ""}`}>Enquire on WhatsApp</a>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-line p-4"><ShieldCheck className="size-5 text-emerald" /><p className="mt-3 text-sm font-bold">Genuine & checked</p></div>
            <div className="rounded-2xl border border-line p-4"><Truck className="size-5 text-emerald" /><p className="mt-3 text-sm font-bold">Delivery available</p></div>
          </div>
          <div className="mt-9 border-t border-line pt-7">
            <h2 className="font-display text-xl font-semibold">Specifications</h2>
            <dl className="mt-4 divide-y divide-line">{Object.entries(product.specifications).map(([key, value]) => <div key={key} className="grid grid-cols-2 py-3 text-sm"><dt className="text-muted">{key}</dt><dd className="flex items-center gap-2 font-semibold"><Check className="size-4 text-emerald" />{value}</dd></div>)}</dl>
          </div>
        </div>
      </div>
    </div>
  );
}
