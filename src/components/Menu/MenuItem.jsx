import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { Plus } from 'lucide-react';
import VariasiSelector from './VariasiSelector';

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

  // Calculate display price
  const displayPrice = selectedVariasi 
    ? item.price + selectedVariasi.harga_tambahan 
    : item.price;

  return (
    <>
      <div className="group bg-[#1A1A1A] rounded-2xl shadow-sm border border-[#333333] overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative h-80 flex flex-col">
        {/* Image Section */}
        <div className="relative h-40 flex-shrink-0">
          <img
            src="/nasgor.jpg"
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#FFFFFF] mb-2 line-clamp-2 group-hover:text-[#FFD700] transition-colors" style={{fontFamily: 'Playfair Display, serif'}}>
              {item.name}
            </h3>
            <p className="text-[#B3B3B3] text-sm line-clamp-2 leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
              {item.description}
            </p>
          </div>
          
          <div className="mt-3">
            <span className="text-lg font-bold text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
              {formatPrice(displayPrice)}
            </span>
            {selectedVariasi && selectedVariasi.harga_tambahan > 0 && (
              <span className="text-xs text-[#B3B3B3] ml-2">
                (base: {formatPrice(item.price)})
              </span>
            )}
            {item.originalPrice && item.originalPrice > item.price && (
              <span className="text-sm text-[#B3B3B3] line-through ml-2">
                {formatPrice(item.originalPrice)}
              </span>
            )}
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
