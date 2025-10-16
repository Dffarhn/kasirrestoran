import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { useCart } from '../context/CartContext';
import { useSession } from '../context/SessionContext';
import OrderDetails from '../components/Confirmation/OrderDetails';
import PaymentInstructions from '../components/Confirmation/PaymentInstructions';
import CloseBillModal from '../components/UI/CloseBillModal';
import { safeBuildUrl } from '../utils/safeNavigation';

const OrderConfirmationPage = () => {
  const { restaurant, tableNumber } = useRestaurant();
  const { getGlobalDiscountInfo, getGlobalDiscountAmount, getTotalPriceWithGlobalDiscount } = useCart();
  const { session, sessionOrders, sessionTotal, closeBill, loading: sessionLoading } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCloseBillModal, setShowCloseBillModal] = useState(false);

  const handleCloseBillClick = () => {
    setShowCloseBillModal(true);
  };

  const handleCloseBillConfirm = async () => {
    try {
      const summaryData = await closeBill();
      // Redirect ke halaman summary dengan data
      navigate(safeBuildUrl('/close-bill-summary'), {
        state: { summaryData }
      });
    } catch (error) {
      alert('Error closing session: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setShowCloseBillModal(false);
  };

  useEffect(() => {
    // Ambil data order dari state navigation atau localStorage
    if (location.state) {
      // Data dari navigation state (online order)
      setOrderData({
        orderId: location.state.orderId,
        orderType: location.state.orderType,
        customerName: location.state.customerName,
        customerInfo: {
          name: location.state.customerName,
          phone: location.state.customerPhone || 'Tidak tersedia'
        },
        totalPrice: location.state.totalAmount,
        tableNumber: tableNumber,
        orderTime: new Date().toISOString(),
        items: location.state.items || [], // Items dari navigation state
        orderNotes: location.state.orderNotes || '',
        restaurantId: restaurant?.id,
        // nilai tambahan dari checkout, untuk konsistensi
        adminFee: location.state.adminFee,
        subtotalBeforeDiscount: location.state.subtotalBeforeDiscount,
        finalSubtotalAfterGlobal: location.state.finalSubtotalAfterGlobal,
        globalDiscountAmount: location.state.globalDiscountAmount,
        globalDiscountPercentage: location.state.globalDiscountPercentage
      });
    } else {
      // Fallback ke localStorage (legacy)
      const savedOrder = localStorage.getItem('current_order');
      if (savedOrder) {
        setOrderData(JSON.parse(savedOrder));
      }
    }
    setLoading(false);
  }, [location.state, tableNumber, restaurant?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700]"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-[#FFFFFF] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
            Pesanan Tidak Ditemukan
          </h1>
          <p className="text-[#B3B3B3] mb-8" style={{fontFamily: 'Inter, sans-serif'}}>
            Tidak ada data pesanan yang ditemukan.
          </p>
          <Link
            to={safeBuildUrl("/")}
            className="inline-flex items-center px-6 py-3 bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] font-medium rounded-lg hover:bg-[#FFD700] hover:text-[#0D0D0D] transition-colors"
          >
            Kembali ke Menu
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#FFD700]/10 border-2 border-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
          Pesanan Berhasil!
        </h1>
        <p className="text-[#B3B3B3]" style={{fontFamily: 'Inter, sans-serif'}}>
          Terima kasih atas pesanan Anda. Silakan lakukan pembayaran di kasir.
        </p>
        {orderData.orderId && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-[#FFD700]" style={{fontFamily: 'Inter, sans-serif'}}>
              Order ID: {orderData.orderId.substring(0, 8).toUpperCase()}
            </p>
            <p className="text-sm text-[#B3B3B3]" style={{fontFamily: 'Inter, sans-serif'}}>
              Meja: {orderData.tableNumber}
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          <OrderDetails orderData={orderData} />
          <PaymentInstructions />
        </div>

        {/* Order Status & Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Session Info & Close Bill Button */}
          {session && sessionOrders.length > 0 && (
            <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-[#FFD700] mb-2">Session Aktif</h3>
                <div className="text-sm text-[#B3B3B3]">
                  Total Session: <span className="text-[#FFD700] font-semibold">Rp {sessionTotal.toLocaleString()}</span>
                </div>
                <div className="text-xs text-[#B3B3B3] mt-1">
                  {sessionOrders.length} orders dalam session
                </div>
              </div>
              
              <button
                onClick={handleCloseBillClick}
                disabled={sessionLoading}
                className="w-full px-4 py-3 bg-[#FFD700] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#E6B800] transition-colors disabled:bg-[#333333] disabled:text-[#B3B3B3] disabled:cursor-not-allowed"
              >
                {sessionLoading ? 'Memproses...' : 'Close Bill & Akhiri Session'}
              </button>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-6">
            <h3 className="text-lg font-semibold text-[#FFFFFF] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
              Ringkasan Pesanan
            </h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#B3B3B3]">Nomor Meja:</span>
                <span className="font-medium text-[#FFFFFF]">{orderData.tableNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#B3B3B3]">Waktu Pesan:</span>
                <span className="font-medium text-[#FFFFFF]">{formatDate(orderData.orderTime)}</span>
              </div>
              {orderData.customerName && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#B3B3B3]">Nama:</span>
                  <span className="font-medium text-[#FFFFFF]">{orderData.customerName}</span>
                </div>
              )}
              {orderData.items && orderData.items.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#B3B3B3]">Total Item:</span>
                  <span className="font-medium text-[#FFFFFF]">{orderData.items.length} item</span>
                </div>
              )}
            </div>

            <div className="border-t border-[#333333] pt-4">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-[#FFFFFF]">Total Harga:</span>
                <span className="text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>{formatPrice(orderData.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={safeBuildUrl("/")}
          className="px-6 py-3 bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] font-medium rounded-lg hover:bg-[#FFD700] hover:text-[#0D0D0D] transition-colors text-center"
        >
          Pesan Lagi
        </Link>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-[#333333] text-[#B3B3B3] font-medium rounded-lg hover:bg-[#555555] hover:text-[#FFFFFF] transition-colors"
        >
          Cetak Struk
        </button>
      </div>

      {/* Close Bill Modal */}
      <CloseBillModal
        isOpen={showCloseBillModal}
        onClose={handleCloseModal}
        onConfirm={handleCloseBillConfirm}
        sessionData={{
          tableNumber: session?.table_number,
          ordersCount: sessionOrders?.length || 0,
          totalAmount: sessionTotal || 0
        }}
        loading={sessionLoading}
      />
    </div>
  );
};

export default OrderConfirmationPage;

