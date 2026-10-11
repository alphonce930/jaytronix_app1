import { ArrowDown, ArrowRight, CheckCircle2, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import ProductCard from "../components/ProductCard";
import { Button, Input, PageTitle, Select } from "../components/ui";
import { useProducts } from "../hooks/useProducts";
import type { ProductCategory } from "../types/product";

const categoryCards = [
  {
    name: "Phones" as ProductCategory,
    description: "Flagship power and everyday essentials, chosen for how you live.",
    image: "https://images.unsplash.com/photo-1656231267330-f605c1c16a57?auto=format&fit=crop&w=1400&q=85",
  },
  {
    name: "Accessories" as ProductCategory,
    description: "Smart additions that protect, power, and elevate your devices.",
    image: "https://images.unsplash.com/photo-1568614213442-9023b31ca184?auto=format&fit=crop&w=1400&q=85",
  },
];

export default function HomePage() {
  const { products, loading, error } = useProducts();
  const [params, setParams] = useSearchParams();
  const [visible, setVisible] = useState(8);
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "All";
  const sort = params.get("sort") ?? "newest";

  const filtered = useMemo(() => {
    const next = products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "All" || product.category === category)
    );
    return next.sort((a, b) => sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price : Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }, [products, search, category, sort]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    value && value !== "All" ? next.set(key, value) : next.delete(key);
    setParams(next);
    setVisible(8);
  }

  return (
    <>
      <section className="px-4 pt-4 md:px-6">
        <div className="relative mx-auto min-h-[38rem] max-w-[94rem] overflow-hidden rounded-[2rem] bg-navy md:min-h-[42rem] md:rounded-[2.5rem]">
          <img src="https://images.unsplash.com/photo-1511140973288-19bf21d7e771?auto=format&fit=crop&w=2000&q=90" alt="Premium smartphone on a dark surface" className="absolute inset-0 size-full object-cover object-center opacity-70" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,20,38,.96)_0%,rgba(8,20,38,.72)_45%,rgba(8,20,38,.12)_100%)]" />
          <div className="relative z-10 flex min-h-[38rem] max-w-7xl items-end px-6 py-12 md:min-h-[42rem] md:items-center md:px-12 lg:px-20">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
                <span className="size-2 rounded-full bg-lime" /> New arrivals are here
              </div>
              <h1 className="font-display text-5xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">Technology that moves with you.</h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 md:text-lg">Explore original smartphones and considered accessories, backed by local expertise and service you can trust.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#products" className="inline-flex min-h-12 items-center gap-3 rounded-full bg-lime px-6 text-sm font-black text-navy transition hover:bg-lime-dark">Shop now <ArrowRight className="size-4" /></a>
                <a href="#categories" className="inline-flex min-h-12 items-center gap-3 rounded-full border border-white/30 px-6 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10">Explore collections</a>
              </div>
            </div>
          </div>
          <a href="#categories" aria-label="Scroll to categories" className="absolute bottom-8 right-8 z-10 hidden size-14 place-items-center rounded-full border border-white/30 text-white md:grid"><ArrowDown /></a>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 py-10 md:grid-cols-4 lg:px-8">
        {[
          [ShieldCheck, "Genuine products", "Quality checked"],
          [Truck, "Fast delivery", "Across Tanzania"],
          [PackageCheck, "Easy pickup", "Dar es Salaam"],
          [CheckCircle2, "Local support", "Before & after sale"],
        ].map(([Icon, title, text]) => (
          <div key={String(title)} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 md:p-5">
            <Icon className="mt-0.5 size-5 shrink-0 text-emerald" />
            <div><p className="text-sm font-bold">{String(title)}</p><p className="mt-1 text-xs text-muted">{String(text)}</p></div>
          </div>
        ))}
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <PageTitle eyebrow="Shop your way" description="Two focused collections. Everything you need to stay connected.">Find your next essential.</PageTitle>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {categoryCards.map((item) => (
            <button key={item.name} onClick={() => { update("category", item.name); document.querySelector("#products")?.scrollIntoView({ behavior: "smooth" }); }} className="group relative min-h-96 overflow-hidden rounded-3xl text-left">
              <img src={item.image} alt="" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-9">
                <p className="mb-2 text-xs font-black uppercase tracking-widest text-lime">Collection 0{item.name === "Phones" ? "1" : "2"}</p>
                <div className="flex items-end justify-between gap-5">
                  <div><h2 className="font-display text-4xl font-semibold">{item.name}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-slate-200">{item.description}</p></div>
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-navy"><ArrowRight /></span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section id="products" className="scroll-mt-28 bg-mist py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <PageTitle eyebrow="The collection" description={`${filtered.length} products selected for performance, design, and value.`}>Made to fit your life.</PageTitle>
          </div>
          <div className="mt-10 grid gap-3 rounded-2xl border border-line bg-white p-3 md:grid-cols-[1fr_auto_auto]">
            <Input value={search} onChange={(event) => update("search", event.target.value)} placeholder="Search by product name…" aria-label="Search by product name" />
            <Select value={category} onChange={(event) => update("category", event.target.value)} aria-label="Filter by category">
              <option>All</option><option>Phones</option><option>Accessories</option>
            </Select>
            <Select value={sort} onChange={(event) => update("sort", event.target.value)} aria-label="Sort products">
              <option value="newest">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
            </Select>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 pt-8 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-96 animate-pulse rounded-3xl bg-white" />)}</div>
          ) : error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div>
          ) : filtered.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 pt-8 min-[430px]:grid-cols-2 lg:grid-cols-4">{filtered.slice(0, visible).map((product) => <ProductCard key={product.id} product={product} />)}</div>
              {visible < filtered.length && <div className="mt-10 text-center"><Button variant="ghost" onClick={() => setVisible((value) => value + 8)}>Load more products</Button></div>}
            </>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-line bg-white px-6 py-20 text-center">
              <h2 className="font-display text-2xl font-semibold">No products found</h2>
              <p className="mt-2 text-muted">Try a different search term or clear your filters.</p>
              <Button className="mt-6" onClick={() => setParams({})}>Clear filters</Button>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:items-center lg:px-8">
        <div className="overflow-hidden rounded-3xl"><img src="https://images.unsplash.com/photo-1620642405534-cd9a3ef7d14b?auto=format&fit=crop&w=1400&q=85" alt="Curated mobile technology" className="aspect-[4/3] size-full object-cover" /></div>
        <div>
          <PageTitle eyebrow="About Jaytronix" description="We started Jaytronix with a simple belief: buying technology should feel clear, personal, and dependable. We carefully select every device, explain what matters, and remain available long after your purchase.">Tech shopping, made human.</PageTitle>
          <Link to="/?category=Phones#products" className="mt-7 inline-flex items-center gap-2 font-bold text-emerald">Browse our phones <ArrowRight className="size-4" /></Link>
        </div>
      </section>
    </>
  );
}
