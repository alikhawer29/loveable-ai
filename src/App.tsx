import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useParams } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider, useAdminAuth } from "@/contexts/AdminAuthContext";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Policy from "./pages/Policy";
import Terms from "./pages/Terms";
import Faqs from "./pages/Faqs";
import About from "./pages/About";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Catalog from "./pages/Catalog";
import { CatalogPasswordGate } from "./components/products/CatalogPasswordGate";
import Care from "./pages/Care";
import GuidelineDetail from "./pages/GuidelineDetail";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminForgotPassword from "./pages/admin/AdminForgotPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminEditProfile from "./pages/admin/AdminEditProfile";
import AdminChangePassword from "./pages/admin/AdminChangePassword";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminAddCategory from "./pages/admin/AdminAddCategory";
import AdminViewCategory from "./pages/admin/AdminViewCategory";
import AdminEditCategory from "./pages/admin/AdminEditCategory";
import AdminAddSubCategory from "./pages/admin/AdminAddSubCategory";
import AdminEditSubCategory from "./pages/admin/AdminEditSubCategory";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminAddProduct from "./pages/admin/AdminAddProduct";
import AdminEditProduct from "./pages/admin/AdminEditProduct";
import AdminViewProduct from "./pages/admin/AdminViewProduct";
import AdminGuidelines from "./pages/admin/AdminGuidelines";
import AdminViewGuideline from "./pages/admin/AdminViewGuideline";
import AdminAddGuideline from "./pages/admin/AdminAddGuideline";
import AdminEditGuideline from "./pages/admin/AdminEditGuideline";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminAddBlog from "./pages/admin/AdminAddBlog";
import AdminViewBlog from "./pages/admin/AdminViewBlog";
import AdminEditBlog from "./pages/admin/AdminEditBlog";
import AdminQueries from "./pages/admin/AdminQueries";
import AdminQueryDetail from "./pages/admin/AdminQueryDetail";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminCreateNotification from "./pages/admin/AdminCreateNotification";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "@/components/ScrollToTop";
import { type ReactNode } from "react";

const queryClient = new QueryClient();

function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated, isLoading } = useAdminAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function AdminGuestRoute({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated } = useAdminAuth();
  if (isAdminAuthenticated) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

function RedirectProductSlug() {
  const { slug } = useParams();
  return <Navigate to={`/products/${slug}`} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          basename={import.meta.env.BASE_URL}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<Navigate to="/" replace />} />
            <Route path="/forgot-password" element={<Navigate to="/" replace />} />
            <Route path="/profile" element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/settings" element={<Navigate to="/" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:slug" element={<CatalogPasswordGate withChrome><ProductDetail /></CatalogPasswordGate>} />
            <Route path="/flowers" element={<Navigate to="/products" replace />} />
            <Route path="/collections" element={<Navigate to="/products" replace />} />
            <Route path="/flowers/:slug" element={<RedirectProductSlug />} />
            <Route path="/pots" element={<Navigate to="/products" replace />} />
            <Route path="/pots/clay-pots" element={<Navigate to="/products" replace />} />
            <Route path="/pots/:slug" element={<RedirectProductSlug />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/care" element={<Care />} />
            <Route path="/guideline" element={<Navigate to="/care" replace />} />
            <Route path="/guidelines" element={<Navigate to="/care" replace />} />
            <Route path="/guideline/:slug" element={<GuidelineDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<Policy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faqs" element={<Faqs />} />

            {/* Admin routes - wrapped in AdminAuthProvider only */}
            <Route path="/admin/*" element={
              <AdminAuthProvider>
                <Routes>
                  <Route path="login" element={<AdminGuestRoute><AdminLogin /></AdminGuestRoute>} />
                  <Route path="forgot-password" element={<AdminGuestRoute><AdminForgotPassword /></AdminGuestRoute>} />
                  <Route path="dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                  <Route path="profile" element={<AdminProtectedRoute><AdminProfile /></AdminProtectedRoute>} />
                  <Route path="profile/edit" element={<AdminProtectedRoute><AdminEditProfile /></AdminProtectedRoute>} />
                  <Route path="profile/change-password" element={<AdminProtectedRoute><AdminChangePassword /></AdminProtectedRoute>} />
                  <Route path="users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
                  <Route path="users/:id" element={<AdminProtectedRoute><AdminUserDetail /></AdminProtectedRoute>} />
                  <Route path="categories" element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
                  <Route path="categories/add" element={<AdminProtectedRoute><AdminAddCategory /></AdminProtectedRoute>} />
                  <Route path="categories/add-subcategory" element={<AdminProtectedRoute><AdminAddSubCategory /></AdminProtectedRoute>} />
                  <Route path="categories/:id" element={<AdminProtectedRoute><AdminViewCategory /></AdminProtectedRoute>} />
                  <Route path="categories/:id/edit" element={<AdminProtectedRoute><AdminEditCategory /></AdminProtectedRoute>} />
                  <Route path="subcategories/:id/edit" element={<AdminProtectedRoute><AdminEditSubCategory /></AdminProtectedRoute>} />
                  <Route path="products" element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
                  <Route path="products/add" element={<AdminProtectedRoute><AdminAddProduct /></AdminProtectedRoute>} />
                  <Route path="products/:id" element={<AdminProtectedRoute><AdminViewProduct /></AdminProtectedRoute>} />
                  <Route path="products/:id/edit" element={<AdminProtectedRoute><AdminEditProduct /></AdminProtectedRoute>} />
                  <Route path="guidelines" element={<AdminProtectedRoute><AdminGuidelines /></AdminProtectedRoute>} />
                  <Route path="guidelines/add" element={<AdminProtectedRoute><AdminAddGuideline /></AdminProtectedRoute>} />
                  <Route path="guidelines/:id" element={<AdminProtectedRoute><AdminViewGuideline /></AdminProtectedRoute>} />
                  <Route path="guidelines/:id/edit" element={<AdminProtectedRoute><AdminEditGuideline /></AdminProtectedRoute>} />
                  <Route path="blogs" element={<AdminProtectedRoute><AdminBlogs /></AdminProtectedRoute>} />
                  <Route path="blogs/add" element={<AdminProtectedRoute><AdminAddBlog /></AdminProtectedRoute>} />
                  <Route path="blogs/:id/edit" element={<AdminProtectedRoute><AdminEditBlog /></AdminProtectedRoute>} />
                  <Route path="blogs/:id" element={<AdminProtectedRoute><AdminViewBlog /></AdminProtectedRoute>} />
                  <Route path="queries" element={<AdminProtectedRoute><AdminQueries /></AdminProtectedRoute>} />
                  <Route path="queries/:id" element={<AdminProtectedRoute><AdminQueryDetail /></AdminProtectedRoute>} />
                  <Route path="newsletter" element={<AdminProtectedRoute><AdminNewsletter /></AdminProtectedRoute>} />
                  <Route path="notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />
                  <Route path="notifications/create" element={<AdminProtectedRoute><AdminCreateNotification /></AdminProtectedRoute>} />
                </Routes>
              </AdminAuthProvider>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
