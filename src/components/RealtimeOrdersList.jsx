import React from 'react';
import { useRealtimeOrders, usePendingOrdersCount } from '../hooks/useRealtimeOrders';

/**
 * Komponen untuk menampilkan list pesanan dengan real-time sync
 * 
 * @param {string} tokoId - ID toko
 * @param {string|null} status - Status pesanan (opsional)
 * @param {boolean} showTitle - Tampilkan title
 * @param {string} title - Custom title
 * @param {boolean} showCount - Tampilkan count badge
 * @param {function} onOrderClick - Callback saat order diklik
 */
export const RealtimeOrdersList = ({
  tokoId,
  status = null,
  showTitle = true,
  title,
  showCount = false,
  onOrderClick
}) => {
  const { orders, loading, error, count, refresh } = useRealtimeOrders(
    tokoId,
    status,
    true // includeDetails
  );

  const getDisplayTitle = () => {
    if (title) return title;
    
    switch (status) {
      case 'pending':
        return 'Pesanan Menunggu Pembayaran';
      case 'paid':
        return 'Pesanan Sudah Dibayar';
      case 'cancelled':
        return 'Pesanan Dibatalkan';
      default:
        return 'Semua Pesanan Online';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Menunggu' },
      paid: { color: 'bg-green-100 text-green-800', text: 'Dibayar' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Dibatalkan' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Memuat pesanan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error memuat pesanan
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message || 'Terjadi kesalahan saat memuat data'}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={refresh}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {getDisplayTitle()}
          </h2>
          {showCount && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {count} pesanan
            </span>
          )}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada pesanan</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pesanan dari web akan muncul di sini secara real-time
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onOrderClick && onOrderClick(order)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{order.customer_name}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.customer_phone}
                    </p>
                    {order.table_number && (
                      <p className="text-sm text-gray-500">
                        Meja: {order.table_number}
                      </p>
                    )}
                  </div>

                  {order.pesanan_online_detail && order.pesanan_online_detail.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Items:</p>
                      <div className="space-y-1">
                        {order.pesanan_online_detail.slice(0, 2).map((detail, index) => (
                          <p key={index} className="text-xs text-gray-600">
                            {detail.quantity}x {detail.menu_name}
                            {detail.variasi_name && ` (${detail.variasi_name})`}
                          </p>
                        ))}
                        {order.pesanan_online_detail.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{order.pesanan_online_detail.length - 2} item lainnya
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(order.created_at)}
                  </p>
                </div>
              </div>

              {order.order_notes && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Catatan:</span> {order.order_notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Komponen untuk menampilkan badge count pesanan pending
 * 
 * @param {string} tokoId - ID toko
 * @param {function} children - Render function dengan count sebagai parameter
 */
export const PendingOrdersBadge = ({ tokoId, children }) => {
  const { count, loading, error } = usePendingOrdersCount(tokoId);

  if (loading) {
    return children(0);
  }

  if (error) {
    console.error('Error loading pending orders count:', error);
    return children(0);
  }

  return children(count);
};

/**
 * Komponen untuk dashboard dengan real-time orders
 */
export const RealtimeOrdersDashboard = ({ tokoId }) => {
  const handleOrderClick = (order) => {
    console.log('Order clicked:', order);
    // Implementasi navigasi ke detail order
  };

  return (
    <div className="space-y-6">
      {/* Header dengan count */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pesanan Online</h1>
            <p className="text-gray-600">Kelola pesanan dari web secara real-time</p>
          </div>
          <PendingOrdersBadge tokoId={tokoId}>
            {(count) => (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{count}</div>
                <div className="text-sm text-gray-500">Pesanan Menunggu</div>
              </div>
            )}
          </PendingOrdersBadge>
        </div>
      </div>

      {/* Pesanan pending */}
      <div className="bg-white rounded-lg shadow p-6">
        <RealtimeOrdersList
          tokoId={tokoId}
          status="pending"
          showTitle={true}
          showCount={true}
          onOrderClick={handleOrderClick}
        />
      </div>

      {/* Pesanan sudah dibayar */}
      <div className="bg-white rounded-lg shadow p-6">
        <RealtimeOrdersList
          tokoId={tokoId}
          status="paid"
          showTitle={true}
          showCount={true}
          onOrderClick={handleOrderClick}
        />
      </div>
    </div>
  );
};
