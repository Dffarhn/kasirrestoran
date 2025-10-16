import React from 'react';
import { X, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';

const ConfirmSelesaiModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-[#1A1A1A] rounded-2xl shadow-2xl border border-[#333333] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#28a745] to-[#20c997] p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-[#28a745]" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
            Konfirmasi Selesai
          </h2>
          <p className="text-white text-sm opacity-90">
            Pastikan transaksi sudah selesai
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-[#FFD700] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-[#FFD700] mb-2">Perhatian Penting</h4>
                <p className="text-sm text-[#B3B3B3] mb-2">
                  Apakah Anda sudah menunjukkan struk ini kepada kasir dan melakukan pembayaran?
                </p>
                <p className="text-sm text-[#B3B3B3]">
                  Setelah mengklik "Ya, Sudah Selesai", tab akan ditutup dan data session akan dihapus.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-[#0D0D0D] rounded-lg p-4 mb-6 border border-[#333333]">
            <div className="flex items-center space-x-3 mb-3">
              <CreditCard className="w-5 h-5 text-[#FFD700]" />
              <h4 className="font-semibold text-[#FFFFFF]">Status Pembayaran</h4>
            </div>
            <div className="space-y-2 text-sm text-[#B3B3B3]">
              <p>• Pastikan kasir sudah menerima pembayaran</p>
              <p>• Struk sudah dicetak atau disimpan</p>
              <p>• Transaksi sudah selesai sepenuhnya</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#333333] text-[#B3B3B3] font-semibold rounded-lg hover:bg-[#555555] hover:text-[#FFFFFF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Belum
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#28a745] text-white font-semibold rounded-lg hover:bg-[#218838] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Ya, Sudah Selesai</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSelesaiModal;
