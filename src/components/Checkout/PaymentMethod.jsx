import React from 'react';

const PaymentMethod = () => {
  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-4">
      <h2 className="text-base font-semibold text-[#FFFFFF] mb-3" style={{fontFamily: 'Playfair Display, serif'}}>
        Metode Pembayaran
      </h2>
      
      <div className="space-y-3">
        <div className="flex items-center p-3 border-2 border-[#FFD700] bg-[#FFD700]/10 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-[#0D0D0D]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[#FFFFFF] text-sm" style={{fontFamily: 'Playfair Display, serif'}}>Pembayaran Tunai</p>
              <p className="text-xs text-[#B3B3B3]">Bayar di kasir setelah pesanan selesai</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 p-3 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-lg">
        <p className="text-xs text-[#FFD700]">
          💡 Pesanan akan diproses setelah Anda melakukan pembayaran tunai di kasir
        </p>
      </div>
    </div>
  );
};

export default PaymentMethod;
