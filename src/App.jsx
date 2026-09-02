import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { LanguageProvider } from '@/lib/LanguageContext';
import { AdminAuthProvider } from '@/lib/AdminAuthContext';
import PublicLayout from '@/components/PublicLayout';
import AdminLayout from '@/components/AdminLayout';
import Home from '@/pages/Home';
import CarDetail from '@/pages/CarDetail';
import AdminLogin from '@/pages/AdminLogin';
import AdminCars from '@/pages/AdminCars';
import AdminSettings from '@/pages/AdminSettings';
import AdminAdmins from '@/pages/AdminAdmins';
import AdminNews from '@/pages/AdminNews';
import AdminReviews from '@/pages/AdminReviews';
import AdminRentals from '@/pages/AdminRentals';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/car/:id" element={<CarDetail />} />
      </Route>
      <Route path="/admin" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminCars />} />
        <Route path="/admin/rentals" element={<AdminRentals />} />
        <Route path="/admin/news" element={<AdminNews />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/admins" element={<AdminAdmins />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <LanguageProvider>
            <AdminAuthProvider>
              <AppRoutes />
            </AdminAuthProvider>
          </LanguageProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App