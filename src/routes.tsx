import { Navigate, createBrowserRouter } from "react-router";
import AdminLayout from "./components/AdminLayout";
import SiteLayout from "./components/SiteLayout";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProductFormPage from "./pages/ProductFormPage";
import ProductPage from "./pages/ProductPage";

function ProtectedAdmin() {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-mist font-bold text-navy">Securing your session…</div>;
  return user ? <AdminLayout /> : <Navigate to="/admin/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: SiteLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "products/:id", Component: ProductPage },
    ],
  },
  { path: "/admin/login", Component: LoginPage },
  {
    path: "/admin",
    Component: ProtectedAdmin,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products/new", Component: ProductFormPage },
      { path: "products/:id/edit", Component: ProductFormPage },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
