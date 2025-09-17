import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import FloatingCartButton from './components/UI/FloatingCartButton';
import { CartProvider } from './context/CartContext';
import { RestaurantProvider } from './context/RestaurantContext';

function App() {
  return (
    <RestaurantProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-[#0D0D0D]">
            <Header />
            <main className="pb-20">
              <Routes>
                <Route path="/" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/confirmation" element={<OrderConfirmationPage />} />
              </Routes>
            </main>
            <FloatingCartButton />
          </div>
        </Router>
      </CartProvider>
    </RestaurantProvider>
  );
}

export default App;