import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { getAdminFee } from '../../services/database';

const OrderSummary = () => {
  const { 
    cartItems, 
    getTotalPrice, 
    getTotalItems, 
    getGlobalDiscountAmount, 
    getTotalPriceWithGlobalDiscount, 
    getGlobalDiscountInfo 
  } = useCart();
  const [adminFee, setAdminFee] = useState(1000); // Default fallback

  useEffect(() => {
    const fetchAdminFee = async () => {
      try {
        const fee = await getAdminFee();
        setAdminFee(fee);
      } catch (error) {
        console.error('Error fetching admin fee:', error);
        setAdminFee(1000); // Fallback to default
      }
    };

    fetchAdminFee();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTotalDiscount = () => {
    return cartItems.reduce((total, item) => total + (item.discountAmount * item.quantity), 0);
  };

  const getSubtotalBeforeDiscount = () => {
    return cartItems.reduce((total, item) => total + (item.originalPrice * item.quantity), 0);
  };

  const globalDiscountInfo = getGlobalDiscountInfo();
  const globalDiscountAmount = getGlobalDiscountAmount();
  const finalTotal = getTotalPriceWithGlobalDiscount();

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
            <div className="text-sm flex-shrink-0 ml-2 text-right">
              <p className="font-medium text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
                {formatPrice(item.totalPrice * item.quantity)}
              </p>
              {item.discountPercentage > 0 && (
                <p className="text-xs text-[#B3B3B3] line-through">
                  {formatPrice(item.originalPrice * item.quantity)}
                </p>
              )}
            </div>
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
          <span className="font-medium text-[#FFFFFF]">{formatPrice(getSubtotalBeforeDiscount())}</span>
        </div>
        
        {getTotalDiscount() > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#B3B3B3]">Diskon:</span>
            <span className="font-medium text-red-400">-{formatPrice(getTotalDiscount())}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-[#B3B3B3]">Subtotal:</span>
          <span className="font-medium text-[#FFFFFF]">{formatPrice(getTotalPrice())}</span>
        </div>
        
        {/* Global Discount */}
        {globalDiscountInfo && globalDiscountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#B3B3B3]">Diskon Global ({globalDiscountInfo.percentage}%):</span>
            <span className="font-medium text-[#FFD700]">-{formatPrice(globalDiscountAmount)}</span>
          </div>
        )}
        
        {globalDiscountInfo && globalDiscountAmount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-[#B3B3B3]">Subtotal Setelah Diskon:</span>
            <span className="font-medium text-[#FFFFFF]">{formatPrice(finalTotal)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-[#B3B3B3]">Biaya Aplikasi:</span>
          <span className="font-medium text-[#FFFFFF]">{formatPrice(adminFee)}</span>
        </div>
        
        <div className="border-t border-[#333333] pt-2">
          <div className="flex justify-between text-base font-semibold">
            <span className="text-[#FFFFFF]">Total Harga:</span>
            <span className="text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
              {formatPrice(finalTotal + adminFee)}
            </span>
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
