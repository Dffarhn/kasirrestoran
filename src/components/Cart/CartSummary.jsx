import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { safeBuildUrl } from '../../utils/safeNavigation';

const CartSummary = () => {
  const { getTotalPrice, getTotalItems } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-4">
      <h2 className="text-base font-semibold text-[#FFFFFF] mb-3" style={{fontFamily: 'Playfair Display, serif'}}>
        Ringkasan Pesanan
      </h2>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-[#B3B3B3]">Total Item:</span>
          <span className="font-medium text-[#FFFFFF]">{getTotalItems()} item</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-[#B3B3B3]">Subtotal:</span>
          <span className="font-medium text-[#FFFFFF]">{formatPrice(getTotalPrice())}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-[#B3B3B3]">Biaya Aplikasi:</span>
          <span className="font-medium text-[#FFFFFF]">{formatPrice(1000)}</span>
        </div>
        
        <div className="border-t border-[#333333] pt-2">
          <div className="flex justify-between text-base font-semibold">
            <span className="text-[#FFFFFF]">Total Harga:</span>
            <span className="text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>{formatPrice(getTotalPrice() + 1000)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          to={safeBuildUrl("/checkout")}
          className="w-full bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] py-3 px-4 rounded-lg font-medium hover:bg-[#FFD700] hover:text-[#0D0D0D] active:bg-[#E6B800] transition-colors text-center block"
        >
          Pesan
        </Link>
        
        <Link
          to={safeBuildUrl("/")}
          className="w-full bg-[#333333] text-[#B3B3B3] py-3 px-4 rounded-lg font-medium hover:bg-[#555555] hover:text-[#FFFFFF] active:bg-[#666666] transition-colors text-center block"
        >
          Ubah Pesanan
        </Link>
      </div>

      <div className="mt-3 p-3 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg">
        <p className="text-xs text-[#FFD700]">
          💡 Pembayaran dilakukan di kasir setelah pesanan selesai
        </p>
      </div>
    </div>
  );
};

export default CartSummary;
