import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // ✅ BrowserRouter hata diya

// ✅ Components
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Loader from './components/Loader.jsx';

// ✅ Pages
import HomePage from './pages/HomePage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import CompleteProfilePage from './pages/CompleteProfilePage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import MyOrdersPage from './pages/MyOrdersPage.jsx';
import BecomeVendorPage from './pages/BecomeVendorPage.jsx';

// ✅ Vendor Pages
import VendorDashboard from './pages/VendorDashboard.jsx';
import AddProductPage from './pages/AddProductPage.jsx';
import ManageProductsPage from './pages/ManageProductsPage.jsx';
import EditProductPage from './pages/vendor/EditProductPage.jsx';
import ManageOrdersPage from './pages/vendor/ManageOrdersPage.jsx';
import ManageShopPage from './pages/vendor/ManageShopPage.jsx';
import VendorBannerManager from './pages/vendor/VendorBannerManager.jsx';

// ✅ Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminManageVendorsPage from './pages/admin/ManageVendorsPage.jsx';
import AdminManageOrdersPage from './pages/admin/AdminManageOrdersPage.jsx';
import AdminManageProductsPage from './pages/admin/AdminManageProductsPage.jsx';

import ManageCouponsPage from './pages/vendor/ManageCouponsPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import DashboardSummaryPage from './pages/admin/DashboardSummaryPage.jsx';
import VendorSalesSummaryPage from './pages/admin/VendorSalesSummaryPage.jsx';

// ===== Route Guards =====
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const VendorRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    return token && user?.role === 'vendor' ? children : <Navigate to="/" />;
};

const CustomerRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    return token && user?.role === 'customer' ? children : <Navigate to="/" />;
};

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    return token && user?.role === 'superadmin' ? children : <Navigate to="/" />;
};

// ===== App Component =====
function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const token = localStorage.getItem('token');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            <main style={{ flexGrow: 1 }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage searchTerm={searchTerm} />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />

                    {/* Auth Routes */}
                    <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
                    <Route path="/register" element={token ? <Navigate to="/" /> : <RegisterPage />} />
                    <Route path="/complete-profile" element={<CompleteProfilePage />} />

                    {/* Protected Routes */}
                    <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="/chat/:orderId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                    <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />

                    <Route path="/become-vendor" element={<CustomerRoute><BecomeVendorPage /></CustomerRoute>} />

                    {/* Vendor Routes */}
                    <Route path="/vendor/dashboard" element={<VendorRoute><VendorDashboard /></VendorRoute>} />
                    <Route path="/vendor/add-product" element={<VendorRoute><AddProductPage /></VendorRoute>} />
                    <Route path="/vendor/products" element={<VendorRoute><ManageProductsPage /></VendorRoute>} />
                    <Route path="/vendor/edit-product/:id" element={<VendorRoute><EditProductPage /></VendorRoute>} />
                    <Route path="/vendor/orders" element={<VendorRoute><ManageOrdersPage /></VendorRoute>} />
                    <Route path="/vendor/manage-shop" element={<VendorRoute><ManageShopPage /></VendorRoute>} />
                    <Route path="/vendor/manage-coupons" element={<VendorRoute><ManageCouponsPage /></VendorRoute>} />
                    <Route path="/vendor/banners" element={<VendorBannerManager />} />

                    {/* Admin Routes */}
                    <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                    <Route path="/admin/vendors" element={<AdminRoute><AdminManageVendorsPage /></AdminRoute>} />
                    <Route path="/admin/orders" element={<AdminRoute><AdminManageOrdersPage /></AdminRoute>} />
                    <Route path="/admin/products" element={<AdminRoute><AdminManageProductsPage /></AdminRoute>} />
<Route
  path="/admin/summary"
  element={
    <AdminRoute>
      <DashboardSummaryPage />
    </AdminRoute>
  }
/>
<Route path="/admin/vendor-sales" element={<AdminRoute><VendorSalesSummaryPage /></AdminRoute>} />
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;


