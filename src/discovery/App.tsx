import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders, useAuth } from './context';
import { ReactNode } from 'react';
import Layout from './components/Layout';
import { Loader } from './components/ui';
import Home from './pages/Home';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import Cities from './pages/Cities';
import CityDetail from './pages/CityDetail';
import SearchPage from './pages/Search';
import BusinessProfile from './pages/BusinessProfile';
import Deals from './pages/Deals';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import BusinessDashboard from './pages/dashboard/BusinessDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import AffiliateDashboard from './pages/dashboard/AffiliateDashboard';
import NotFound from './pages/NotFound';

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
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:slug" element={<CategoryDetail />} />
            <Route path="/cities" element={<Cities />} />
            <Route path="/city/:slug" element={<CityDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/business/:slug" element={<BusinessProfile />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Protected><BusinessDashboard /></Protected>} />
            <Route path="/affiliate" element={<Protected><AffiliateDashboard /></Protected>} />
            <Route path="/admin" element={<Protected admin><AdminDashboard /></Protected>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProviders>
  );
}
