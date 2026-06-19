import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, ReactNode } from 'react';
import { AppProviders, useAuth } from './context';
import Layout from './components/Layout';
import { Loader } from './components/ui';

const Home = lazy(() => import('./pages/Home'));
const Categories = lazy(() => import('./pages/Categories'));
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'));
const Cities = lazy(() => import('./pages/Cities'));
const CityDetail = lazy(() => import('./pages/CityDetail'));
const SearchPage = lazy(() => import('./pages/Search'));
const BusinessProfile = lazy(() => import('./pages/BusinessProfile'));
const Products = lazy(() => import('./pages/Products'));
const Deals = lazy(() => import('./pages/Deals'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Pricing = lazy(() => import('./pages/Pricing'));
const MerchantLanding = lazy(() => import('./pages/MerchantLanding'));
const MerchantRegister = lazy(() => import('./pages/MerchantRegister'));
const Login = lazy(() => import('./pages/Login'));
const BusinessDashboard = lazy(() => import('./pages/dashboard/BusinessDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const AffiliateDashboard = lazy(() => import('./pages/dashboard/AffiliateDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

function Protected({ children, admin }: { children: ReactNode; admin?: boolean }) {
  const { user, role, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function DiscoveryApp() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:slug" element={<CategoryDetail />} />
              <Route path="/cities" element={<Cities />} />
              <Route path="/city/:slug" element={<CityDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/business/:slug" element={<BusinessProfile />} />
              <Route path="/products" element={<Products />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/merchants" element={<MerchantLanding />} />
              <Route path="/merchants/register" element={<MerchantRegister />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Protected><BusinessDashboard /></Protected>} />
              <Route path="/affiliate" element={<Protected><AffiliateDashboard /></Protected>} />
              <Route path="/admin" element={<Protected admin><AdminDashboard /></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AppProviders>
  );
}
