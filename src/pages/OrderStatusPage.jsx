import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { useKitchenQueue } from '../hooks/useKitchenQueue';
import OrderStatusCard from '../components/OrderStatus/OrderStatusCard';
import QueuePosition from '../components/OrderStatus/QueuePosition';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { checkKitchenModeEnabled } from '../services/database';

const OrderStatusPage = () => {
  const { restaurant } = useRestaurant();
  const { 
    kitchenOrders, 
    loading, 
    error,
    refresh
  } = useKitchenQueue(restaurant?.id, null, true); // null = semua status
  const [kitchenModeEnabled, setKitchenModeEnabled] = useState(false);
  const [checkingKitchenMode, setCheckingKitchenMode] = useState(true);

  // Debug logging
  console.log('OrderStatusPage - restaurant:', restaurant);
  console.log('OrderStatusPage - loading:', loading);
  console.log('OrderStatusPage - error:', error);
  console.log('OrderStatusPage - kitchenOrders:', kitchenOrders);

  // Filter hanya pesanan yang sedang berjalan (pending)
  const pendingOrders = kitchenOrders
    .filter(order => order.status === 'pending')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Gunakan pendingOrders sebagai sortedOrders untuk antrian
  const sortedOrders = pendingOrders;

  // Cari pesanan customer saat ini (berdasarkan table number atau customer name)
  const currentCustomerOrders = sortedOrders.filter(order => 
    order.table_number === restaurant?.tableNumber || 
    order.customer_name === restaurant?.customerName
  );

  // Hitung posisi dalam antrian
  const getQueuePosition = (orderId) => {
    return sortedOrders.findIndex(order => order.id === orderId) + 1;
  };

  // Estimasi waktu tunggu
  const getEstimatedWaitTime = (position) => {
    const avgTimePerOrder = 15; // menit per pesanan (bisa disesuaikan)
    const estimatedMinutes = (position - 1) * avgTimePerOrder;
    
    if (estimatedMinutes < 1) return 'Segera diproses';
    if (estimatedMinutes < 60) return `~${estimatedMinutes} menit`;
    
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    return `~${hours}j ${minutes}m`;
  };

  // Check kitchen mode when restaurant data is available
  useEffect(() => {
    const checkKitchenMode = async () => {
      if (restaurant?.id) {
        try {
          setCheckingKitchenMode(true);
          const enabled = await checkKitchenModeEnabled(restaurant.id);
          setKitchenModeEnabled(enabled);
        } catch (error) {
          console.error('Error checking kitchen mode:', error);
          setKitchenModeEnabled(false);
        } finally {
          setCheckingKitchenMode(false);
        }
      }
    };

    checkKitchenMode();
  }, [restaurant?.id]);

  if (loading || checkingKitchenMode) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  // Show message if kitchen mode is disabled
  if (!kitchenModeEnabled) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-[#1a1a1a] border-2 border-[#FFD700] rounded-2xl p-8 shadow-lg">
            <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[#0D0D0D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#FFD700] mb-4">
              Fitur Antrian Tidak Tersedia
            </h2>
            <p className="text-gray-300 mb-6">
              Fitur antrian dapur belum diaktifkan untuk toko ini. Silakan hubungi admin untuk mengaktifkan fitur ini.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-[#FFD700] text-[#0D0D0D] font-semibold rounded-xl hover:bg-[#FFE55C] transition-colors duration-200"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-4xl mx-auto px-4 py-6">
         {/* Header */}
         <div className="mb-8 text-center">
           <h1 className="text-3xl font-bold text-[#FFD700] mb-2">
             Antrian Dapur
           </h1>
           <p className="text-gray-400">
             Pantau posisi pesanan Anda dalam antrian dapur
           </p>
         </div>

        {/* Queue Position untuk Customer */}
        {currentCustomerOrders.length > 0 && (
          <div className="mb-8">
            <QueuePosition 
              orders={currentCustomerOrders}
              totalQueue={sortedOrders.length}
              getQueuePosition={getQueuePosition}
              getEstimatedWaitTime={getEstimatedWaitTime}
            />
          </div>
        )}

        {/* Pending Orders */}
        {pendingOrders.length > 0 && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Antrian Aktif ({pendingOrders.length})
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="px-3 py-1 bg-[#FFD700] text-[#0D0D0D] text-xs font-medium rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <div className="text-xs text-gray-400">
                  Sedang diproses
                </div>
              </div>
            </div>

            {pendingOrders.map((order) => (
              <OrderStatusCard
                key={order.id}
                order={order}
                isCurrentCustomer={currentCustomerOrders.some(co => co.id === order.id)}
                queuePosition={getQueuePosition(order.id)}
                estimatedWaitTime={getEstimatedWaitTime(getQueuePosition(order.id))}
              />
            ))}
          </div>
        )}


        {/* All Orders List (Fallback) */}
        {pendingOrders.length === 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Antrian (0)
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="px-3 py-1 bg-[#FFD700] text-[#0D0D0D] text-xs font-medium rounded hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <div className="text-xs text-gray-400">
                  Urutan waktu pesanan
                </div>
              </div>
            </div>

            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Belum ada antrian dapur
              </h3>
              <p className="text-gray-400 mb-6">
                Antrian dapur akan muncul di sini ketika ada pesanan yang sedang diproses
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Pesan menu terlebih dahulu</p>
                <p>• Staff dapur akan memproses pesanan Anda</p>
                <p>• Status akan muncul di halaman ini</p>
              </div>
              <a 
                href="/" 
                className="inline-flex items-center px-6 py-3 bg-[#FFD700] text-[#0D0D0D] font-semibold rounded-lg hover:bg-yellow-400 transition-colors mt-6"
              >
                Lihat Menu
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusPage;
