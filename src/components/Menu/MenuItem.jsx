import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Plus } from 'lucide-react';
import VariasiSelector from './VariasiSelector';
import { getMenuImageUrl } from '../../services/database';

const MenuItem = ({ item }) => {
  const { addToCart } = useCart();
  const [selectedVariasi, setSelectedVariasi] = useState(null);
  const [showVariasiSelector, setShowVariasiSelector] = useState(false);

  // Set default variasi jika ada
  useEffect(() => {
    if (item.variasi && item.variasi.length > 0) {
      const defaultVariasi = item.variasi.find(v => v.is_default) || item.variasi[0];
      setSelectedVariasi(defaultVariasi);
    }
  }, [item.variasi]);

  const handleAddToCart = () => {
    if (item.available) {
      if (item.variasi && item.variasi.length > 0) {
        // Show variasi selector jika ada variasi
        setShowVariasiSelector(true);
      } else {
        // Add langsung jika tidak ada variasi
        addToCart(item, null);
      }
    }
  };

  const handleVariasiSelect = (variasiId) => {
    const variasi = item.variasi.find(v => v.id === variasiId);
    setSelectedVariasi(variasi);
  };

  const handleConfirmAddToCart = () => {
    addToCart(item, selectedVariasi);
    setShowVariasiSelector(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate display price with discount
  const basePrice = selectedVariasi 
    ? item.price + selectedVariasi.harga_tambahan 
    : item.price;
  
  const discountPercentage = item.discount_percentage || 0;
  const discountAmount = Math.round((basePrice * discountPercentage) / 100);
  const displayPrice = basePrice - discountAmount;

  // Debug logging
  console.log('MenuItem Debug:', {
    itemName: item.name,
    basePrice,
    discountPercentage,
    discountAmount,
    displayPrice,
    item: item
  });

  // Get menu image URL
  const menuImageUrl = getMenuImageUrl(item);

  return (
    <>
      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden group bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#333333] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative h-56 sm:h-64 flex flex-col">
        {/* Image Section */}
        <div className="relative h-28 sm:h-32 flex-shrink-0">
          <img
            src={menuImageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback ke default image jika image gagal load
              e.target.src = '/DefaultMenu.png';
            }}
          />
          {!item.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Habis
              </span>
            </div>
          )}
          
          {/* Category badge */}
          <div className="absolute top-2 left-2">
            <span className="bg-[#FFD700]/10 text-[#FFD700] px-2 py-1 rounded-full text-xs font-medium border border-[#FFD700]/20">
              {item.category_name || item.category}
            </span>
          </div>

          {/* Discount badge */}
          {discountPercentage > 0 && (
            <div className="absolute top-2 right-2">
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
                -{discountPercentage}%
              </span>
            </div>
          )}

          {/* Floating Add Button */}
          <button
            onClick={handleAddToCart}
            disabled={!item.available}
            className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              item.available
                ? 'bg-[#FFD700] text-[#0D0D0D] shadow-lg hover:bg-[#E6B800] hover:scale-110 active:scale-95'
                : 'bg-[#333333] text-[#B3B3B3] cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content Section */}
        <div className="flex-1 p-2 sm:p-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#FFFFFF] mb-1 line-clamp-2 group-hover:text-[#FFD700] transition-colors" style={{fontFamily: 'Playfair Display, serif'}}>
              {item.name}
            </h3>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm sm:text-lg font-bold text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
                {formatPrice(displayPrice)}
              </span>
              {discountPercentage > 0 && (
                <span className="text-sm text-[#B3B3B3] line-through">
                  {formatPrice(basePrice)}
                </span>
              )}
              {selectedVariasi && selectedVariasi.harga_tambahan > 0 && (
                <span className="text-xs text-[#B3B3B3]">
                  (base: {formatPrice(item.price)})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block group bg-[#1A1A1A] rounded-3xl shadow-lg border border-[#333333] overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative">
        <div className="flex">
          {/* Image Section - Desktop */}
          <div className="relative w-1/3 h-48 flex-shrink-0">
            <img
              src={menuImageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = '/DefaultMenu.png';
              }}
            />
            {!item.available && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Habis
                </span>
              </div>
            )}
            
            {/* Category badge - Desktop */}
            <div className="absolute top-3 left-3">
              <span className="bg-[#FFD700]/20 text-[#FFD700] px-3 py-1.5 rounded-full text-sm font-medium border border-[#FFD700]/30 backdrop-blur-sm">
                {item.category_name || item.category}
              </span>
            </div>

            {/* Discount badge - Desktop */}
            {discountPercentage > 0 && (
              <div className="absolute top-3 right-3">
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  -{discountPercentage}%
                </span>
              </div>
            )}
          </div>
          
          {/* Content Section - Desktop */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#FFFFFF] mb-3 group-hover:text-[#FFD700] transition-colors line-clamp-2" style={{fontFamily: 'Playfair Display, serif'}}>
                {item.name}
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
                  {formatPrice(displayPrice)}
                </span>
                {discountPercentage > 0 && (
                  <span className="text-lg text-[#B3B3B3] line-through">
                    {formatPrice(basePrice)}
                  </span>
                )}
                {selectedVariasi && selectedVariasi.harga_tambahan > 0 && (
                  <span className="text-sm text-[#B3B3B3]">
                    (base: {formatPrice(item.price)})
                  </span>
                )}
              </div>
            </div>
            
            {/* Add Button - Desktop */}
            <button
              onClick={handleAddToCart}
              disabled={!item.available}
              className={`w-full py-4 px-6 rounded-2xl text-lg font-semibold transition-all duration-300 relative overflow-hidden ${
                item.available
                  ? 'bg-[#FFD700] text-[#0D0D0D] hover:bg-[#E6B800] hover:shadow-xl hover:-translate-y-1 active:translate-y-0'
                  : 'bg-[#333333] text-[#B3B3B3] cursor-not-allowed'
              }`}
            >
              {item.available && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Plus className="w-6 h-6" />
                <span>Tambah ke Keranjang</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Variasi Selector Modal */}
      {showVariasiSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A1A] rounded-2xl border border-[#333333] p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[#FFFFFF] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
              Pilih Variasi - {item.name}
            </h3>
            
            <VariasiSelector
              variasi={item.variasi}
              onVariasiSelect={handleVariasiSelect}
              selectedVariasiId={selectedVariasi?.id}
              menuPrice={item.price}
              discountPercentage={discountPercentage}
            />
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowVariasiSelector(false)}
                className="flex-1 px-4 py-2 bg-[#333333] text-[#B3B3B3] rounded-lg hover:bg-[#555555] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 px-4 py-2 bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] rounded-lg hover:bg-[#FFD700] hover:text-[#0D0D0D] transition-colors"
              >
                Tambah ke Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItem;
