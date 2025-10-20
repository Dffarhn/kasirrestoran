import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { useSession } from '../context/SessionContext';
import { Clock, Receipt, CheckCircle, Circle, User, Phone } from 'lucide-react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { supabase } from '../lib/supabase';

const OrderHistoryPage = () => {
  const { restaurant, tableNumber } = useRestaurant();
  const { session, sessionOrders, sessionTotal, loading } = useSession();
  const [ordersWithDetails, setOrdersWithDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (sessionOrders && sessionOrders.length > 0) {
      // Load order details for each order
      loadOrderDetails();
    } else {
      setOrdersWithDetails([]);
    }
  }, [sessionOrders]);

  const loadOrderDetails = async () => {
    setLoadingDetails(true);
    try {
      console.log('Loading order details for orders:', sessionOrders);
      
      const ordersWithItems = await Promise.all(
        sessionOrders.map(async (order) => {
          console.log(`Loading details for order ${order.id}`);
          
          // Fetch order items from database
          const { data: items, error } = await supabase
            .from('pesanan_online_detail')
            .select('*')
            .eq('pesanan_online_id', order.id);

          if (error) {
            console.error(`Error loading order details for ${order.id}:`, error);
            return { ...order, items: [] };
          }

          console.log(`Order ${order.id} items:`, items);
          return { ...order, items: items || [] };
        })
      );

      console.log('All orders with details:', ordersWithItems);
      setOrdersWithDetails(ordersWithItems);
    } catch (error) {
      console.error('Error loading order details:', error);
      setOrdersWithDetails(sessionOrders);
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'paid': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'paid': return 'Sudah Dibayar';
      case 'pending': return 'Menunggu';
      default: return 'Tidak Diketahui';
    }
  };

  const formatPrice = (price) => {
    // Handle NaN, null, undefined, or invalid numbers
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice === null || numPrice === undefined) {
      return 'Rp 0';
    }
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numPrice);
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

  if (loading || loadingDetails) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#FFD700] mb-2">
            Riwayat Pesanan
          </h1>
          <p className="text-gray-400">
            Lihat semua pesanan yang pernah Anda pesan
          </p>
        </div>

        {/* Session Info */}
        {session && (
          <div className="bg-[#1A1A1A] rounded-lg p-6 mb-8 border border-[#333333]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-[#0D0D0D]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#FFD700]">
                    {session.customer_name || 'Pelanggan'}
                  </h2>
                  <p className="text-gray-400">Meja {session.table_number}</p>
                  {session.customer_phone && (
                    <p className="text-sm text-gray-500">{session.customer_phone}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#FFD700]">
                  {formatPrice(sessionTotal || 0)}
                </div>
                <div className="text-sm text-gray-400">
                  Total {sessionOrders?.length || 0} pesanan
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Orders List */}
        {ordersWithDetails.length > 0 ? (
          <div className="space-y-4">
            {ordersWithDetails.map((order, index) => (
              <div key={order.id} className="bg-[#1A1A1A] rounded-lg border border-[#333333] overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-[#FFD700] to-[#E6B800] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Receipt className="w-6 h-6 text-[#0D0D0D]" />
                      <div>
                        <h3 className="text-lg font-bold text-[#0D0D0D]">
                          #{order.order_number}
                        </h3>
                        <p className="text-sm text-[#0D0D0D] opacity-80">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#0D0D0D]">
                        {formatPrice(order.total_amount)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4">
                  <div className="space-y-3">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center justify-between py-3 border-b border-[#333333] last:border-b-0">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-white">{item.menu_name}</h4>
                              <span className="text-sm text-gray-400">x{item.quantity}</span>
                            </div>
                            {item.variasi && (
                              <p className="text-sm text-gray-400 mb-1">Variasi: {item.variasi}</p>
                            )}
                            {item.notes && (
                              <p className="text-sm text-gray-400 mb-1">Catatan: {item.notes}</p>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-400">
                                {formatPrice(item.unit_price)} per item
                              </span>
                              <span className="font-medium text-[#FFD700]">
                                {formatPrice(item.total_price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-400">
                        <Circle className="w-8 h-8 mx-auto mb-2" />
                        <p>Detail pesanan tidak tersedia</p>
                        <p className="text-xs mt-1">Pesanan #{order.order_number} - {formatPrice(order.total_amount)}</p>
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="mt-4 pt-4 border-t border-[#333333]">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total Pesanan:</span>
                      <span className="text-lg font-bold text-[#FFD700]">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Belum ada riwayat pesanan
            </h3>
            <p className="text-gray-400 mb-6">
              Pesanan Anda akan muncul di sini setelah Anda melakukan pemesanan
            </p>
            <a 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-[#FFD700] text-[#0D0D0D] font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Lihat Menu
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
