import React from 'react';
import { useCart } from '../../context/CartContext';
import { Plus } from 'lucide-react';
import { getMenuImageUrl } from '../../services/database';

const FeaturedMenuCard = ({ item }) => {
  const { addToCart } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate display price with discount
  const discountPercentage = item.discount_percentage || 0;
  const discountAmount = Math.round((item.price * discountPercentage) / 100);
  const displayPrice = item.price - discountAmount;

  // Get menu image URL
  const menuImageUrl = getMenuImageUrl(item);

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

      {/* Discount Badge */}
      {discountPercentage > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            -{discountPercentage}%
          </span>
        </div>
      )}

      {/* Mobile/Tablet Layout */}
      <div className="block lg:hidden">
        <div className="relative">
          <img
            src={menuImageUrl}
            alt={item.name}
            className="w-full h-40 object-cover"
            onError={(e) => {
              // Fallback ke default image jika image gagal load
              e.target.src = '/DefaultMenu.png';
            }}
          />
          {!item.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Habis
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="mb-3">
            <h2 className="text-lg font-bold text-[#FFFFFF] mb-2 line-clamp-2" style={{fontFamily: 'Playfair Display, serif'}}>
              {item.name}
            </h2>
            <p className="text-[#B3B3B3] text-sm line-clamp-2 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
              {item.description}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
                {formatPrice(displayPrice)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-sm text-[#B3B3B3] line-through">
                  {formatPrice(item.price)}
                </span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!item.available}
              className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 relative overflow-hidden w-full sm:w-auto ${
                item.available
                  ? 'bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0D0D0D] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
                  : 'bg-[#333333] text-[#B3B3B3] cursor-not-allowed'
              }`}
            >
              {item.available && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Tambah</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="flex">
          <div className="relative w-2/5">
            <img
              src={menuImageUrl}
              alt={item.name}
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = '/DefaultMenu.png';
              }}
            />
            {!item.available && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-full text-lg font-semibold shadow-lg">
                  Habis
                </span>
              </div>
            )}
          </div>
          
          <div className="w-3/5 p-10 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-[#FFFFFF] mb-4 group-hover:text-[#FFD700] transition-colors" style={{fontFamily: 'Playfair Display, serif'}}>
                {item.name}
              </h2>
              <p className="text-[#B3B3B3] text-lg leading-relaxed mb-6" style={{fontFamily: 'Inter, sans-serif'}}>
                {item.description || "Menu spesial yang dipilih khusus untuk Anda. Nikmati cita rasa autentik yang menggugah selera."}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-[#FFD700] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
                  {formatPrice(displayPrice)}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-lg text-[#B3B3B3] line-through">
                    {formatPrice(item.price)}
                  </span>
                )}
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!item.available}
                className={`px-10 py-5 rounded-2xl text-xl font-semibold transition-all duration-300 relative overflow-hidden ${
                  item.available
                    ? 'bg-[#FFD700] text-[#0D0D0D] hover:bg-[#E6B800] hover:shadow-2xl hover:-translate-y-1 active:translate-y-0'
                    : 'bg-[#333333] text-[#B3B3B3] cursor-not-allowed'
                }`}
              >
                {item.available && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                )}
                <span className="relative z-10 flex items-center space-x-3">
                  <Plus className="w-6 h-6" />
                  <span>Tambah ke Keranjang</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedMenuCard;
