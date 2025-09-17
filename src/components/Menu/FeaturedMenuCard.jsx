import React from 'react';
import { useCart } from '../../context/CartContext';
import { Plus } from 'lucide-react';

const FeaturedMenuCard = ({ item }) => {
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (item.available) {
      addToCart(item);
    }
  };

  return (
    <div className="relative bg-[#1A1A1A] rounded-3xl shadow-lg border border-[#333333] overflow-hidden mb-6 group">
      {/* Featured Badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-gradient-to-r from-[#FFD700] to-[#E6B800] text-[#0D0D0D] px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          ⭐ Chef's Special
        </span>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="relative">
          <img
            src="/nasgor.jpg"
            alt={item.name}
            className="w-full h-48 object-cover"
          />
          {!item.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Habis
              </span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#FFFFFF] mb-2 line-clamp-2" style={{fontFamily: 'Playfair Display, serif'}}>
              {item.name}
            </h2>
            <p className="text-[#B3B3B3] text-sm line-clamp-3 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
              {item.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm text-[#B3B3B3] line-through">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!item.available}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-hidden ${
                item.available
                  ? 'bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0D0D0D] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-[#333333] text-[#B3B3B3] cursor-not-allowed'
              }`}
            >
              {item.available && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
              <span className="relative z-10 flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <div className="relative w-1/2">
          <img
            src="/nasgor.jpg"
            alt={item.name}
            className="w-full h-64 object-cover"
          />
          {!item.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Habis
              </span>
            </div>
          )}
        </div>
        
        <div className="w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#FFFFFF] mb-3" style={{fontFamily: 'Playfair Display, serif'}}>
              {item.name}
            </h2>
            <p className="text-[#B3B3B3] text-base leading-relaxed mb-6" style={{fontFamily: 'Inter, sans-serif'}}>
              {item.description}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
                {formatPrice(item.price)}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-sm text-[#B3B3B3] line-through">
                  {formatPrice(item.originalPrice)}
                </span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!item.available}
              className={`px-8 py-4 rounded-full text-base font-semibold transition-all duration-300 relative overflow-hidden ${
                item.available
                  ? 'bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0D0D0D] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-[#333333] text-[#B3B3B3] cursor-not-allowed'
              }`}
            >
              {item.available && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
              <span className="relative z-10 flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Tambah ke Keranjang</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedMenuCard;
