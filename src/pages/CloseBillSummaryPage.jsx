import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';
import { useSession } from '../context/SessionContext';
import ConfirmSelesaiModal from '../components/UI/ConfirmSelesaiModal';
import { getSessionOrdersSummary } from '../services/sessionService';
import { supabase } from '../lib/supabase';
import { safeBuildUrl } from '../utils/safeNavigation';

const CloseBillSummaryPage = () => {
  const { restaurant, tableNumber } = useRestaurant();
  const { session, sessionOrders, sessionTotal } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadFromRpc = async () => {
      try {
        // Ambil token dari state -> localStorage (per toko) -> context
        const tokenFromState = location.state?.summaryData?.sessionToken;
        const closedTokenKey = restaurant?.id ? `closed_session_token_${restaurant.id}` : null;
        const tokenFromStorage = closedTokenKey ? localStorage.getItem(closedTokenKey) : null;
        const tokenFromContext = session?.session_token;
        const sessionToken = tokenFromState || tokenFromStorage || tokenFromContext;
        
        if (!sessionToken) {
          // Fallback ke data lama jika tidak ada token
          if (location.state?.summaryData) {
            setSummaryData(location.state.summaryData);
          } else {
            const savedSummary = localStorage.getItem('close_bill_summary');
            if (savedSummary) {
              try {
                setSummaryData(JSON.parse(savedSummary));
                localStorage.removeItem('close_bill_summary');
              } catch (error) {
                console.error('Error parsing summary data:', error);
              }
            }
          }
          return;
        }

        // Ambil data dari database via RPC
        const payload = await getSessionOrdersSummary(sessionToken);
        // payload: { session, orders:[{... items:[] }], total_amount }

        // Debug logging untuk cek data
        console.log('RPC Payload:', payload);
        console.log('Orders:', payload?.orders);
        console.log('First order items:', payload?.orders?.[0]?.items);

        // Jika items kosong, coba ambil dari database langsung
        let ordersWithItems = payload?.orders || [];
        if (ordersWithItems.length > 0 && (!ordersWithItems[0].items || ordersWithItems[0].items.length === 0)) {
          console.log('Items kosong dari RPC, ambil dari database langsung...');
          
          // Ambil detail items untuk setiap order
          for (let i = 0; i < ordersWithItems.length; i++) {
            const order = ordersWithItems[i];
            const { data: items, error } = await supabase
              .from('pesanan_online_detail')
              .select('*')
              .eq('pesanan_online_id', order.id)
              .order('created_at', { ascending: true });
            
            if (!error && items) {
              ordersWithItems[i] = { ...order, items: items };
              console.log(`Order ${order.id} items:`, items);
            }
          }
        }

        setSummaryData({
          sessionId: payload?.session?.id,
          sessionToken: payload?.session?.session_token || sessionToken,
          tableNumber: payload?.session?.table_number,
          customerName: payload?.session?.customer_name,
          customerPhone: payload?.session?.customer_phone,
          orders: ordersWithItems,
          totalAmount: payload?.total_amount || 0,
          closedAt: payload?.session?.closed_at || new Date().toISOString()
        });
      } catch (e) {
        console.error('Failed to load summary via RPC:', e);
        // Fallback ke data lama jika RPC gagal
        if (location.state?.summaryData) {
          setSummaryData(location.state.summaryData);
        }
      } finally {
        // Bersihkan penyimpanan sementara (per toko)
        if (restaurant?.id) localStorage.removeItem(`closed_session_token_${restaurant.id}`);
        localStorage.removeItem('close_bill_summary');
      }
    };

    if (restaurant?.id) loadFromRpc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id]);

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

  const handleSelesai = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmSelesai = async () => {
    try {
      setIsProcessing(true);
      // Clear data session & cart untuk toko ini
      if (restaurant?.id) {
        localStorage.removeItem(`session_token_${restaurant.id}`);
        localStorage.removeItem(`closed_session_token_${restaurant.id}`);
        localStorage.removeItem(`restaurant_cart_${restaurant.id}`);
      }
      localStorage.removeItem('close_bill_summary');
      
      // Tutup tab/window
      window.close();
      
      // Fallback jika window.close() tidak berfungsi (beberapa browser)
      setTimeout(() => {
        window.location.href = 'about:blank';
      }, 100);
    } finally {
      setIsProcessing(false);
      setShowConfirmModal(false);
    }
  };

  const handlePesanLagi = () => {
    // Clear session toko ini dan redirect ke menu
    if (restaurant?.id) {
      localStorage.removeItem(`session_token_${restaurant.id}`);
      localStorage.removeItem(`closed_session_token_${restaurant.id}`);
    }
    localStorage.removeItem('close_bill_summary');
    navigate(safeBuildUrl('/'));
  };

  if (!summaryData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0D0D0D]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
          <p className="text-[#B3B3B3]">Memuat rangkuman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#FFD700]/10 border-2 border-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#FFFFFF] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
            Bill Ditutup
          </h1>
          <p className="text-[#B3B3B3]" style={{fontFamily: 'Inter, sans-serif'}}>
            Rangkuman pesanan Anda
          </p>
        </div>

        {/* Session Info */}
        <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#FFD700] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
            Informasi Session
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#B3B3B3]">Restaurant</p>
              <p className="font-semibold text-[#FFFFFF]">{restaurant?.name}</p>
            </div>
            <div>
              <p className="text-sm text-[#B3B3B3]">Meja</p>
              <p className="font-semibold text-[#FFFFFF]">{summaryData.tableNumber}</p>
            </div>
            <div>
              <p className="text-sm text-[#B3B3B3]">Nama</p>
              <p className="font-semibold text-[#FFFFFF]">{summaryData.customerName || 'Tidak tersedia'}</p>
            </div>
            <div>
              <p className="text-sm text-[#B3B3B3]">Telepon</p>
              <p className="font-semibold text-[#FFFFFF]">{summaryData.customerPhone || 'Tidak tersedia'}</p>
            </div>
            <div>
              <p className="text-sm text-[#B3B3B3]">Waktu Ditutup</p>
              <p className="font-semibold text-[#FFFFFF]">{formatDate(summaryData.closedAt)}</p>
            </div>
            <div>
              <p className="text-sm text-[#B3B3B3]">Jumlah Pesanan</p>
              <p className="font-semibold text-[#FFFFFF]">{summaryData.orders.length} pesanan</p>
            </div>
          </div>
        </div>

        {/* Orders Summary */}
        <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#FFD700] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
            Rangkuman Pesanan
          </h2>
          
          <div className="space-y-4">
            {summaryData.orders.map((order, index) => (
              <div key={order.id} className="border border-[#333333] rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-[#FFFFFF]">
                      Pesanan #{index + 1}
                    </h3>
                    <p className="text-sm text-[#B3B3B3]">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#FFD700]">
                      {formatPrice(order.total_amount || order.total || 0)}
                    </p>
                    <p className="text-sm text-[#B3B3B3]">
                      Status: {order.status}
                    </p>
                  </div>
                </div>
                
                {/* Itemized list */}
                <div className="mt-3 space-y-2">
                  {/* Debug: Log items untuk setiap order */}
                  {console.log(`Order ${index + 1} items:`, order.items)}
                  
                  {(!order.items || order.items.length === 0) ? (
                    <div className="text-sm text-[#B3B3B3] italic">
                      Detail item tidak tersedia
                    </div>
                  ) : (
                    order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="pr-3">
                          <div className="text-[#FFFFFF] font-medium">
                            {item.menu_name}{item.variasi_name ? ` - ${item.variasi_name}` : ''}
                          </div>
                          {item.notes ? (
                            <div className="text-xs text-[#B3B3B3] mt-0.5">Catatan: {item.notes}</div>
                          ) : null}
                          {(item.discount_percentage > 0 || item.total_discount > 0) && (
                            <div className="text-xs text-[#FFD700] mt-0.5">
                              Diskon: {item.discount_percentage ? `${item.discount_percentage}%` : ''} {item.total_discount ? `(${formatPrice(item.total_discount)})` : ''}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-[#FFFFFF]">
                          <div>{item.quantity} x {formatPrice(item.unit_price)}</div>
                          <div className="font-semibold">{formatPrice(item.total_price)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {order.order_notes && (
                  <div className="mt-3">
                    <p className="text-sm text-[#B3B3B3]">Catatan untuk pesanan:</p>
                    <p className="text-sm text-[#FFFFFF]">{order.order_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#FFD700] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
            Total Pembayaran
          </h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-[#FFFFFF]">Subtotal:</span>
              <span className="text-[#FFFFFF]">{formatPrice(summaryData.totalAmount)}</span>
            </div>
            <div className="border-t border-[#333333] pt-3">
              <div className="flex justify-between text-2xl font-bold">
                <span className="text-[#FFFFFF]">Total Bayar:</span>
                <span className="text-[#FFD700]" style={{fontFamily: 'Playfair Display, serif'}}>
                  {formatPrice(summaryData.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#FFD700] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
            Instruksi Pembayaran
          </h2>
          <div className="space-y-3 text-[#B3B3B3]">
            <p>• Silakan lakukan pembayaran di kasir</p>
            <p>• Tunjukkan halaman ini kepada kasir</p>
            <p>• Pembayaran dapat dilakukan dengan tunai atau QRIS</p>
            <p>• Terima kasih atas kunjungan Anda!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSelesai}
            className="px-8 py-4 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-[#218838] transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Selesai</span>
          </button>
          <button
            onClick={handlePesanLagi}
            className="px-8 py-4 bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] font-semibold rounded-lg hover:bg-[#FFD700] hover:text-[#0D0D0D] transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Pesan Lagi</span>
          </button>
        </div>
        {/* Modal Konfirmasi Selesai */}
        <ConfirmSelesaiModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSelesai}
          loading={isProcessing}
        />
      </div>
    </div>
  );
};

export default CloseBillSummaryPage;
// Modal dirender di dalam return di atas

