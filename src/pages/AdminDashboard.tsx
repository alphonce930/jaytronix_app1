import { Edit3, Package, Plus, Search, Sparkles, Smartphone, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { formatPrice } from "../components/ProductCard";
import { Button, Input, Select } from "../components/ui";
import { useProducts } from "../hooks/useProducts";
import { removeProduct } from "../services/products";

export default function AdminDashboard() {
  const { products, loading, error, refresh } = useProducts();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [notice, setNotice] = useState("");
  const filtered = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) && (category === "All" || product.category === category)), [products, search, category]);
  const stats = [
    ["Total products", products.length, Package, "bg-blue-50 text-blue-700"],
    ["Phones", products.filter((item) => item.category === "Phones").length, Smartphone, "bg-violet-50 text-violet-700"],
    ["Accessories", products.filter((item) => item.category === "Accessories").length, Package, "bg-orange-50 text-orange-700"],
    ["Featured", products.filter((item) => item.featured).length, Sparkles, "bg-lime/30 text-emerald"],
  ] as const;

  async function deleteItem(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This action cannot be undone.`)) return;
    await removeProduct(id);
    setNotice(`${name} was deleted.`);
    await refresh();
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="text-xs font-black uppercase tracking-widest text-emerald">Overview</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Your product catalog.</h1><p className="mt-2 text-muted">Manage availability, pricing, and product details.</p></div>
        <Link to="/admin/products/new"><Button><Plus className="size-4" /> Add new product</Button></Link>
      </div>
      <div className="mt-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value, Icon, color]) => <div key={label} className="rounded-2xl border border-line bg-white p-5"><div className={`grid size-10 place-items-center rounded-xl ${color}`}><Icon className="size-5" /></div><p className="mt-5 font-display text-3xl font-semibold">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></div>)}
      </div>
      {notice && <div className="mt-6 rounded-xl bg-emerald/10 p-4 text-sm font-semibold text-emerald">{notice}</div>}
      <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="flex flex-col gap-3 border-b border-line p-5 md:flex-row md:items-center">
          <h2 className="mr-auto font-display text-xl font-semibold">All products</h2>
          <div className="relative md:w-64"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-10" placeholder="Search products" /></div>
          <Select value={category} onChange={(event) => setCategory(event.target.value)} className="md:w-44"><option>All</option><option>Phones</option><option>Accessories</option></Select>
        </div>
        {loading ? <div className="p-10 text-center text-muted">Loading catalog…</div> : error ? <div className="p-10 text-center text-red-600">{error}</div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[50rem] text-left text-sm">
              <thead className="bg-mist text-xs uppercase tracking-wider text-muted"><tr><th className="px-5 py-4">Product</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Price</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Updated</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-line">{filtered.map((product) => (
                <tr key={product.id} className="hover:bg-mist/60">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><img src={product.images[0]} alt="" className="size-12 rounded-xl object-cover" /><div><p className="font-bold">{product.name}</p>{product.featured && <p className="text-xs text-emerald">Featured</p>}</div></div></td>
                  <td className="px-5 py-4 text-muted">{product.category}</td><td className="px-5 py-4 font-semibold">{formatPrice(product.price)}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${product.available ? "bg-emerald/10 text-emerald" : "bg-slate-100 text-slate-500"}`}>{product.available ? "Available" : "Unavailable"}</span></td>
                  <td className="px-5 py-4 text-muted">{new Date(product.updatedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={`/admin/products/${product.id}/edit`} className="grid size-9 place-items-center rounded-full border border-line hover:bg-mist" aria-label={`Edit ${product.name}`}><Edit3 className="size-4" /></Link><button onClick={() => deleteItem(product.id, product.name)} className="grid size-9 place-items-center rounded-full bg-red-50 text-red-600 hover:bg-red-100" aria-label={`Delete ${product.name}`}><Trash2 className="size-4" /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
            {!filtered.length && <p className="p-10 text-center text-muted">No products match your search.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
