import React from 'react';
import { X, Receipt, Clock, CreditCard } from 'lucide-react';

const CloseBillModal = ({ isOpen, onClose, onConfirm, sessionData, loading }) => {
  if (!isOpen) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#1A1A1A] rounded-2xl shadow-2xl border border-[#333333] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#FFD700] to-[#E6B800] p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#0D0D0D] hover:text-[#B8860B] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-16 h-16 bg-[#0D0D0D] rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-[#FFD700]" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#0D0D0D] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
            Close Bill
          </h2>
          <p className="text-[#0D0D0D] text-sm opacity-90">
            Akhiri session dan siapkan pembayaran
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Session Info */}
          <div className="bg-[#0D0D0D] rounded-lg p-4 mb-6 border border-[#333333]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#B3B3B3]">Meja</span>
              <span className="font-semibold text-[#FFFFFF]">{sessionData?.tableNumber}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#B3B3B3]">Jumlah Pesanan</span>
              <span className="font-semibold text-[#FFFFFF]">{sessionData?.ordersCount || 0} pesanan</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#B3B3B3]">Total Session</span>
              <span className="text-xl font-bold text-[#FFD700]">
                {formatPrice(sessionData?.totalAmount || 0)}
              </span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-[#FFD700] mb-1">Perhatian</h4>
                <p className="text-sm text-[#B3B3B3]">
                  Setelah Close Bill, Anda tidak dapat menambah pesanan lagi. 
                  Pastikan semua pesanan sudah benar sebelum melanjutkan.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-[#0D0D0D] rounded-lg p-4 mb-6 border border-[#333333]">
            <div className="flex items-center space-x-3 mb-3">
              <CreditCard className="w-5 h-5 text-[#FFD700]" />
              <h4 className="font-semibold text-[#FFFFFF]">Pembayaran</h4>
            </div>
            <p className="text-sm text-[#B3B3B3]">
              Silakan lakukan pembayaran di kasir dengan total yang tertera di atas.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#333333] text-[#B3B3B3] font-semibold rounded-lg hover:bg-[#555555] hover:text-[#FFFFFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#FFD700] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#E6B800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0D0D0D]"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Close Bill</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloseBillModal;
