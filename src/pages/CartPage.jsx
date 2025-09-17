import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import CartItem from '../components/Cart/CartItem';
import CartSummary from '../components/Cart/CartSummary';
import EmptyCart from '../components/Cart/EmptyCart';

const CartPage = () => {
  const { cartItems, getTotalPrice } = useCart();
  const { restaurant, tableNumber } = useRestaurant();

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="px-4 py-4 pb-24">
      {/* Header - Mobile Optimized */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-[#FFFFFF] mb-1" style={{fontFamily: 'Playfair Display, serif'}}>Pesanan Meja {tableNumber}</h1>

      </div>

      {/* Cart Items - Mobile First */}
      <div className="space-y-4">
        <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333]">
          <div className="p-4">
            <div className="space-y-3">
              {cartItems.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Cart Summary - Mobile Optimized */}
        <CartSummary />
      </div>
    </div>
  );
};

export default CartPage;
