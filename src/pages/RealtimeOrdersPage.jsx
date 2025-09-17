import React, { useState } from 'react';
import { RealtimeOrdersList, PendingOrdersBadge } from '../components/RealtimeOrdersList';

/**
 * Halaman untuk menampilkan pesanan online dengan real-time sync
 * 
 * @param {string} tokoId - ID toko (bisa dari props atau context)
 */
export const RealtimeOrdersPage = ({ tokoId = 'your-toko-id' }) => {
  const [activeTab, setActiveTab] = useState('pending');

  const handleOrderClick = (order) => {
    console.log('Order clicked:', order);
    // Implementasi navigasi ke detail order
    // Contoh: navigate(`/orders/${order.id}`);
  };

  const tabs = [
    { id: 'pending', label: 'Pending', status: 'pending' },
    { id: 'paid', label: 'Paid', status: 'paid' },
    { id: 'cancelled', label: 'Cancelled', status: 'cancelled' },
    { id: 'all', label: 'All', status: null }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pesanan Online</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Kelola pesanan dari web secara real-time
                </p>
              </div>
              
              {/* Real-time indicator */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Real-time</span>
                </div>
                
                {/* Pending count badge */}
                <PendingOrdersBadge tokoId={tokoId}>
                  {(count) => (
                    <div className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {count} pending
                    </div>
                  )}
                </PendingOrdersBadge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.status === 'pending' && (
                  <PendingOrdersBadge tokoId={tokoId}>
                    {(count) => count > 0 && (
                      <span className="ml-2 bg-red-100 text-red-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </PendingOrdersBadge>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={activeTab === tab.id ? 'block' : 'hidden'}
              >
                <RealtimeOrdersList
                  tokoId={tokoId}
                  status={tab.status}
                  showTitle={false}
                  onOrderClick={handleOrderClick}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time status indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Real-time Active</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Mendengarkan perubahan pesanan...
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Komponen untuk menampilkan real-time orders di sidebar atau widget
 */
export const RealtimeOrdersWidget = ({ tokoId, maxItems = 5 }) => {
  const { orders, loading, error } = useRealtimeOrders(tokoId, 'pending', false);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="text-red-600 text-sm">
          Error loading orders: {error.message}
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, maxItems);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Pesanan Terbaru</h3>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Tidak ada pesanan pending
          </p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {order.customer_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    Rp {order.total_amount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeOrdersPage;
