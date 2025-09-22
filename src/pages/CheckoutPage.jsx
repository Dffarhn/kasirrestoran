import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useRestaurant } from '../context/RestaurantContext';
import { createPesananOnline, getAdminFee } from '../services/database';
import OrderSummary from '../components/Checkout/OrderSummary';
import CustomerInfo from '../components/Checkout/CustomerInfo';
import PaymentMethod from '../components/Checkout/PaymentMethod';
import OrderNotes from '../components/Checkout/OrderNotes';
import { safeNavigate } from '../utils/safeNavigation';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { restaurant, tableNumber } = useRestaurant();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    customerId: null
  });
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get admin fee from database
      const adminFee = await getAdminFee(restaurant.id);
      const subtotal = getTotalPrice();
      const total = subtotal + adminFee;

      // Submit pesanan online
      const orderData = {
        tokoId: restaurant.id,
        tableNumber: tableNumber,
        customerInfo,
        orderNotes,
        items: cartItems.map(item => ({
          menu_id: item.id,
          variasi_id: item.variasi_id,
          name: item.name,
          variasi_name: item.variasi_name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.totalPrice,
          notes: ''
        })),
        total: total,
        subtotal: subtotal,
        adminFee: adminFee,
        isAnonymous: false
      };

      const pesanan = await createPesananOnline(orderData);
      
      // Clear cart
      clearCart();
      
      // Redirect ke halaman konfirmasi
      safeNavigate(navigate, '/confirmation', {}, { 
        state: { 
          orderId: pesanan.id,
          orderType: 'online',
          customerName: customerInfo.name,
          customerPhone: customerInfo.phone,
          totalAmount: total, // Total yang sudah termasuk admin fee
          items: cartItems, // Kirim items dari cart
          orderNotes: orderNotes
        } 
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      // Show error message - bisa ditambahkan toast notification
      alert('Terjadi kesalahan saat mengirim pesanan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    // Gunakan useEffect untuk navigasi, bukan langsung di render
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  return (
    <div className="px-4 py-4 pb-24">
      {/* Header - Mobile Optimized */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[#FFFFFF] mb-1" style={{fontFamily: 'Playfair Display, serif'}}>Checkout</h1>
        <p className="text-sm text-[#B3B3B3]" style={{fontFamily: 'Inter, sans-serif'}}>
          {restaurant?.name} - Meja {tableNumber}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Form Section - Mobile First */}
          <CustomerInfo
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
          />
          
          <OrderNotes
            orderNotes={orderNotes}
            setOrderNotes={setOrderNotes}
          />
          
          <PaymentMethod />
          
          {/* Order Summary - Mobile Optimized */}
          <OrderSummary />
        </div>

        {/* Submit Button - Mobile Optimized */}
        <div className="mt-6">
          <button
            type="submit"
            disabled={isSubmitting || !customerInfo.name || !customerInfo.phone}
            className="w-full px-6 py-4 bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] font-medium rounded-lg hover:bg-[#FFD700] hover:text-[#0D0D0D] active:bg-[#E6B800] disabled:bg-[#333333] disabled:border-[#555555] disabled:text-[#B3B3B3] disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FFD700]"></div>
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Konfirmasi Pesanan</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
