import React from 'react';
import { Link } from 'react-router-dom';
import { safeBuildUrl } from '../../utils/safeNavigation';

const EmptyCart = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-[#FFFFFF] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
          Keranjang Kosong
        </h1>
        <p className="text-[#B3B3B3] mb-8 max-w-md mx-auto" style={{fontFamily: 'Inter, sans-serif'}}>
          Belum ada item di keranjang Anda. Mulai pesan makanan favorit Anda sekarang!
        </p>
        <Link
          to={safeBuildUrl("/")}
          className="inline-flex items-center px-6 py-3 bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] font-medium rounded-lg hover:bg-[#FFD700] hover:text-[#0D0D0D] transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Lihat Menu
        </Link>
      </div>
    </div>
  );
};

export default EmptyCart;
