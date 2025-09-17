import React from 'react';
import { useCart } from '../../context/CartContext';

const OrderSummary = () => {
  const { cartItems, getTotalPrice, getTotalItems } = useCart();

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
      
      <div className="space-y-2 mb-3">
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between items-center text-sm">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#FFFFFF] line-clamp-1" style={{fontFamily: 'Playfair Display, serif'}}>{item.name}</p>
              <p className="text-[#B3B3B3] text-xs">x{item.quantity}</p>
            </div>
            <p className="font-medium text-[#FFD700] text-sm flex-shrink-0 ml-2" style={{fontFamily: 'Playfair Display, serif'}}>
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#333333] pt-3 space-y-2">
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

      <div className="mt-3 p-3 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg">
        <p className="text-xs text-[#FFD700]">
          💰 Pembayaran tunai di kasir setelah pesanan selesai
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
