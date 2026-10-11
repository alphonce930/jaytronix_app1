import { AtSign, Headphones, Mail, MapPin, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { Button, Input } from "./ui";

const nav = [
  ["Home", "/"],
  ["Phones", "/?category=Phones#products"],
  ["Accessories", "/?category=Accessories#products"],
  ["About us", "/#about"],
  ["Contact", "/#contact"],
];

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function search(event: React.FormEvent) {
    event.preventDefault();
    navigate(`/?search=${encodeURIComponent(query)}#products`);
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-cream text-navy">
      <div className="bg-navy px-4 py-2 text-center text-xs font-medium text-white">
        Free delivery in Mbeya on orders over TZS 500,000
      </div>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-4 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-display text-2xl font-bold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-navy text-lime"><span className="translate-y-px">J</span></span>
            JAYTRONIX
          </Link>
          <nav className="ml-auto hidden items-center gap-7 lg:flex">
            {nav.map(([label, href]) => (
              <NavLink key={label} to={href} className="text-sm font-semibold text-slate-600 transition hover:text-navy">{label}</NavLink>
            ))}
          </nav>
          <form onSubmit={search} className="relative ml-auto hidden w-64 xl:block">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="min-h-10 pl-10" aria-label="Search products" />
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          </form>
          <Link to="/admin" className="hidden rounded-full border border-line px-4 py-2 text-xs font-bold lg:block">Admin</Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="ml-auto rounded-full p-2 lg:hidden" aria-label="Toggle navigation">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-line bg-white px-5 py-5 lg:hidden">
            <form onSubmit={search} className="mb-5 flex gap-2"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" /><Button type="submit"><Search className="size-4" /></Button></form>
            <nav className="grid gap-1">
              {nav.map(([label, href]) => <Link key={label} to={href} onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 font-semibold hover:bg-mist">{label}</Link>)}
              <Link to="/admin" className="rounded-xl px-4 py-3 font-semibold">Admin dashboard</Link>
            </nav>
          </div>
        )}
      </header>
      <main><Outlet /></main>
      <footer id="contact" className="bg-navy text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center gap-2 font-display text-2xl font-bold"><span className="grid size-9 place-items-center rounded-xl bg-lime text-navy">J</span> JAYTRONIX</div>
            <p className="max-w-md leading-7 text-slate-300">Original devices. Clear advice. Local support. Your trusted destination for phones and accessories in Tanzania.</p>
          </div>
          <div>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-lime">Visit & contact</h2>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex gap-3"><MapPin className="size-5 text-lime" /> UYOLE, Mbeya</li>
              <li className="flex gap-3"><Headphones className="size-5 text-lime" /> +255 626 388 507</li>
              <li className="flex gap-3"><Mail className="size-5 text-lime" /> jaytronix@gmail.com</li>
            </ul>
          </div>
          <div>
            <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-lime">Follow us</h2>
            <a href="https://instagram.com" className="inline-flex items-center gap-3 text-sm text-slate-300 hover:text-white"><AtSign className="size-5" /> @jaytronix</a>
            <p className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} Jaytronix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
