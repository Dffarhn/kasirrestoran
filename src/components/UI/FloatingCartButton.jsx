import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { safeBuildUrl } from '../../utils/safeNavigation';

const FloatingCartButton = () => {
  const { getTotalItems, getTotalPrice } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (getTotalItems() === 0) {
    return null;
  }

  return (
    <Link
      to={safeBuildUrl("/cart")}
      className="fixed bottom-6 right-6 z-50 lg:hidden group"
    >
      <div className="relative">
        {/* Main button */}
        <div className="flex items-center space-x-3 px-5 py-4 bg-[#0D0D0D] border-2 border-[#FFD700] rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#FFD700] hover:text-[#0D0D0D]">
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200">{getTotalItems()} item</p>
            <p className="text-xs text-[#B3B3B3] group-hover:text-[#0D0D0D] transition-colors duration-200">{formatPrice(getTotalPrice() + 1000)}</p>
          </div>
        </div>
        
        {/* Badge - removed excessive animations */}
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg border-2 border-white">
          {getTotalItems()}
        </span>
      </div>
    </Link>
  );
};

export default FloatingCartButton;
