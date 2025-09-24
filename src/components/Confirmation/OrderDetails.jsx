import React from 'react';
import { useCart } from '../../context/CartContext';

const OrderDetails = ({ orderData }) => {
  const { getGlobalDiscountInfo, getGlobalDiscountAmount, getTotalPriceWithGlobalDiscount } = useCart();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Safe access to customer info with fallbacks
  const customerName = orderData?.customerInfo?.name || orderData?.customerName || 'Tidak tersedia';
  const customerPhone = orderData?.customerInfo?.phone || orderData?.customerPhone || 'Tidak tersedia';
  const orderItems = orderData?.items || [];
  const orderNotes = orderData?.orderNotes || orderData?.notes;
  
  // Calculate subtotal from items (BEFORE global discount)
  const calculateSubtotal = () => {
    if (orderItems.length > 0) {
      return orderItems.reduce((total, item) => {
        // Gunakan originalPrice jika ada, jika tidak gunakan price
        const itemPrice = item.originalPrice || item.price || 0;
        return total + (itemPrice * (item.quantity || 1));
      }, 0);
    }
    // Fallback: gunakan subtotal dari orderData jika ada
    return orderData?.subtotal || 0;
  };

  // Calculate item-level discount (per item discount)
  const calculateItemDiscount = () => {
    if (orderItems.length > 0) {
      return orderItems.reduce((total, item) => {
        const originalPrice = (item.originalPrice || item.price || 0) * (item.quantity || 1);
        const finalPrice = (item.totalPrice || item.price || 0) * (item.quantity || 1);
        return total + (originalPrice - finalPrice);
      }, 0);
    }
    return 0;
  };

  // Calculate subtotal before any discount (original prices)
  const calculateSubtotalBeforeDiscount = () => {
    if (orderItems.length > 0) {
      return orderItems.reduce((total, item) => {
        return total + ((item.originalPrice || item.price || 0) * (item.quantity || 1));
      }, 0);
    }
    return calculateSubtotal();
  };
  
  const subtotal = orderData?.subtotalBeforeDiscount ?? calculateSubtotal();
  const globalDiscountInfo = getGlobalDiscountInfo();
  const globalDiscountAmount = orderData?.globalDiscountAmount ?? getGlobalDiscountAmount();
  const adminFee = orderData?.adminFee ?? 1000;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Detail Pesanan
      </h2>
      
      <div className="space-y-4">
        {/* Customer Info */}
        <div className="border-b pb-4">
          <h3 className="font-medium text-gray-900 mb-2">Informasi Pelanggan</h3>
          <div className="space-y-1 text-sm">
            <p><span className="text-gray-600">Nama:</span> {customerName}</p>
            <p><span className="text-gray-600">Telepon:</span> {customerPhone}</p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3">Item Pesanan</h3>
          {orderItems.length > 0 ? (
            <div className="space-y-3">
              {orderItems.map((item, index) => (
                <div key={item.id || index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={item.image || "/DefaultMenu.png"}
                    alt={item.name || 'Menu Item'}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = "/DefaultMenu.png";
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name || 'Menu Item'}</p>
                    <p className="text-sm text-gray-600">x{item.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice((item.totalPrice || item.price || 0) * (item.quantity || 1))}
                    </p>
                    {item.discountPercentage > 0 && (
                      <div className="text-xs text-gray-500">
                        <span className="line-through">
                          {formatPrice((item.originalPrice || item.price || 0) * (item.quantity || 1))}
                        </span>
                        <span className="ml-2 text-red-500">-{item.discountPercentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Detail item tidak tersedia</p>
          )}
        </div>

        {/* Order Notes */}
        {orderNotes && (
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Catatan Khusus</h3>
            <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
              {orderNotes}
            </p>
          </div>
        )}

        {/* Price Breakdown - Ringkas */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-3">Ringkasan Pesanan</h3>
          <div className="space-y-2">
            {/* Items (harga sebelum diskon) */}
            {orderItems.map((item, idx) => {
              const qty = item.quantity || 1;
              const original = (item.originalPrice || item.price || 0) * qty;
              return (
                <div key={item.id || idx} className="flex justify-between text-sm">
                  <span className="text-gray-900 truncate pr-2">
                    {item.name} x{qty}
                  </span>
                  <span className="text-gray-900">
                    {formatPrice(original)} <span className="text-gray-500 text-xs">(sebelum diskon)</span>
                  </span>
                </div>
              );
            })}

            {/* Diskon Item (akumulasi) */}
            {calculateItemDiscount() > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diskon Item</span>
                <span className="font-medium text-red-500">-{formatPrice(calculateItemDiscount())}</span>
              </div>
            )}

            {/* Diskon Global */}
            {(globalDiscountInfo && globalDiscountInfo.percentage > 0) && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diskon Global ({globalDiscountInfo.percentage}%)</span>
                <span className="font-medium text-[#FFD700]">-{formatPrice(globalDiscountAmount || 0)}</span>
              </div>
            )}

            {/* Biaya Aplikasi */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Biaya Aplikasi</span>
              <span className="font-medium text-gray-900">{formatPrice(adminFee)}</span>
            </div>

            {/* Separator dan Total Bayar */}
            <div className="border-t pt-2">
              <div className="flex justify-between text-base font-semibold">
                <span className="text-gray-900">Total Bayar</span>
                <span className="text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
                  {formatPrice(orderData?.totalPrice || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
