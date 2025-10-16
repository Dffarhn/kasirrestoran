import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Layout/Header';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderStatusPage from './pages/OrderStatusPage';
import FloatingCartButton from './components/UI/FloatingCartButton';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { SessionProvider } from './context/SessionContext';
import SessionHistory from './components/Session/SessionHistory';
import SessionBootstrap from './components/Session/SessionBootstrap';
import CloseBillSummaryPage from './pages/CloseBillSummaryPage';

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
                  <Route path="/" element={<MenuPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/confirmation" element={<OrderConfirmationPage />} />
                  <Route path="/order-status" element={<OrderStatusPage />} />
                  <Route path="/session-history" element={<SessionHistory />} />
                  <Route path="/close-bill-summary" element={<CloseBillSummaryPage />} />
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