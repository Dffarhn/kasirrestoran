import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderStatusPage from './pages/OrderStatusPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import FloatingCartButton from './components/UI/FloatingCartButton';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { SessionProvider } from './context/SessionContext';
import SessionHistory from './components/Session/SessionHistory';
import SessionBootstrap from './components/Session/SessionBootstrap';
import CloseBillSummaryPage from './pages/CloseBillSummaryPage';
import PortalPage from './pages/PortalPage';
import TokoWebsitePage from './pages/TokoWebsitePage';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll to top when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
};

// Root route handler:
// - Jika ada toko_id di query → redirect ke /default/pesan dengan parameter yang sama (kompatibel dengan URL lama)
// - Jika tidak ada → tampilkan PortalPage (portal resto)
const RootRoute = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const tokoId = searchParams.get('toko_id') || searchParams.get('restaurant_id');
  const table = searchParams.get('table') || searchParams.get('nomor_meja') || '1';

  if (tokoId) {
    const params = new URLSearchParams();
    params.set('toko_id', tokoId);
    if (table) {
      params.set('table', table);
    }

    return <Navigate to={`/default/pesan?${params.toString()}`} replace />;
  }

  return <PortalPage />;
};

function App() {
  return (
    <RestaurantProvider>
      <SessionProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen bg-[#0D0D0D]">
              <Header />
              <main className="pb-20">
                <SessionBootstrap />
                <Routes>
                  {/* Root wrapper: portal atau redirect dari URL lama */}
                  <Route path="/" element={<RootRoute />} />

                  {/* Grup default (tanpa slug / website khusus) */}
                  <Route path="/default">
                    <Route path="pesan" element={<MenuPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="confirmation" element={<OrderConfirmationPage />} />
                    <Route path="order-status" element={<OrderStatusPage />} />
                    <Route path="order-history" element={<OrderHistoryPage />} />
                    <Route path="session-history" element={<SessionHistory />} />
                    <Route path="close-bill-summary" element={<CloseBillSummaryPage />} />
                  </Route>

                  {/* Grup dengan slug toko: index = website toko (template HTML full), pesan/cart hanya lewat QR */}
                  <Route path="/:slug">
                    <Route index element={<TokoWebsitePage />} />
                    <Route path="pesan" element={<MenuPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="confirmation" element={<OrderConfirmationPage />} />
                    <Route path="order-status" element={<OrderStatusPage />} />
                    <Route path="order-history" element={<OrderHistoryPage />} />
                    <Route path="session-history" element={<SessionHistory />} />
                    <Route path="close-bill-summary" element={<CloseBillSummaryPage />} />
                  </Route>
                </Routes>
              </main>
              <FloatingCartButton />
            </div>
          </Router>
        </CartProvider>
      </SessionProvider>
    </RestaurantProvider>
  );
}

export default App;