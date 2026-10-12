import { ExternalLink, LayoutDashboard, LogOut, Package } from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router"
import { useAuth } from "../context/AuthContext"
import { Button } from "./ui"

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  async function signOut() {
    await logout()
    navigate("/admin/login")
  }

  return (
    <div className="min-h-screen bg-mist text-navy">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-navy p-6 text-white lg:flex">
        <div className="font-display text-xl font-bold">
          JAYTRONIX <span className="text-lime">/</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">ADMINISTRATION</p>
        <nav className="mt-12 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                isActive
                  ? "bg-lime text-navy"
                  : "text-slate-300 hover:bg-white/5"
              }`
            }
          >
            <LayoutDashboard className="size-4" /> Overview
          </NavLink>
          <NavLink
            to="/admin/products/new"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${
                isActive
                  ? "bg-lime text-navy"
                  : "text-slate-300 hover:bg-white/5"
              }`
            }
          >
            <Package className="size-4" /> Add product
          </NavLink>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/5"
          >
            <ExternalLink className="size-4" /> View store
          </a>
        </nav>
        <button
          onClick={signOut}
          className="mt-auto flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/5"
        >
          <LogOut className="size-4" /> Log out
        </button>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex min-h-20 items-center justify-between border-b border-line bg-white/90 px-5 backdrop-blur lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">
              Jaytronix catalog
            </p>
            <p className="font-display text-lg font-semibold">
              Admin workspace
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="lg:hidden" onClick={signOut}>
              Log out
            </Button>
          </div>
        </header>
        <main className="px-5 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
