import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { useKitchenQueue } from '../hooks/useKitchenQueue';
import OrderStatusCard from '../components/OrderStatus/OrderStatusCard';
import QueuePosition from '../components/OrderStatus/QueuePosition';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const OrderStatusPage = () => {
  const { restaurant } = useRestaurant();
  const { 
    kitchenOrders, 
    loading, 
    error,
    refresh
  } = useKitchenQueue(restaurant?.id, null, true); // null = semua status

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

  if (loading) {
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
