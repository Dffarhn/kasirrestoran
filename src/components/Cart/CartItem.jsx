import React from 'react';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleQuantityChange = (newQuantity) => {
    updateQuantity(item.cartItemId, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.cartItemId);
  };

  return (
    <div className="p-4 border border-[#333333] rounded-2xl bg-[#1A1A1A] shadow-sm">
      <div className="flex items-start space-x-4">
        {/* Image */}
        <img
          src="/nasgor.jpg"
          alt={item.name}
          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
        />
        
        {/* Item Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-[#FFFFFF] text-base mb-1" style={{fontFamily: 'Playfair Display, serif'}}>
          {item.name}
        </h3>
        {item.variasi_name && (
          <p className="text-xs text-[#B3B3B3] mb-1">
            Variasi: {item.variasi_name}
          </p>
        )}
        <p className="text-sm text-[#FFD700] font-semibold mb-3">
          {formatPrice(item.totalPrice)} per item
        </p>
          
          {/* Quantity Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-8 h-8 rounded-full bg-[#333333] border border-[#555555] flex items-center justify-center hover:bg-[#FFD700]/10 hover:border-[#FFD700] transition-colors active:bg-[#FFD700]/20"
            >
              <span className="text-[#FFFFFF] text-sm font-semibold">-</span>
            </button>
            
            <span className="w-8 text-center font-medium text-sm text-[#FFFFFF]">{item.quantity}</span>
            
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-8 h-8 rounded-full bg-[#333333] border border-[#555555] flex items-center justify-center hover:bg-[#FFD700]/10 hover:border-[#FFD700] transition-colors active:bg-[#FFD700]/20"
            >
              <span className="text-[#FFFFFF] text-sm font-semibold">+</span>
            </button>
          </div>
        </div>

        {/* Price and Remove */}
        <div className="text-right flex-shrink-0">
        <p className="font-semibold text-[#FFD700] text-lg mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
          {formatPrice(item.totalPrice * item.quantity)}
        </p>
          <button
            onClick={handleRemove}
            className="text-[#FFD700] hover:text-[#E6B800] text-sm active:text-[#B8860B] transition-colors"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
