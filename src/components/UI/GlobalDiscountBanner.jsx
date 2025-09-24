import React from 'react';

const GlobalDiscountBanner = ({ globalDiscount }) => {
  // Jika discount tidak aktif atau 0%, jangan tampilkan banner
  if (!globalDiscount?.enabled || globalDiscount?.percentage <= 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 border-2 border-[#FFD700] rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
                Diskon Spesial!
              </h3>
              <p className="text-sm text-[#FFFFFF]" style={{fontFamily: 'Inter, sans-serif'}}>
                Hemat {globalDiscount.percentage}% untuk semua menu
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
              {globalDiscount.percentage}%
            </div>
            <div className="text-xs text-[#B3B3B3]" style={{fontFamily: 'Inter, sans-serif'}}>
              OFF
            </div>
          </div>
        </div>
        
        {/* Additional info */}
        <div className="mt-3 pt-3 border-t border-[#FFD700]/30">
          <p className="text-xs text-[#B3B3B3] text-center" style={{fontFamily: 'Inter, sans-serif'}}>
            💡 Diskon akan otomatis diterapkan saat checkout
          </p>
        </div>
      </div>
    </div>
  );
};

export default GlobalDiscountBanner;
