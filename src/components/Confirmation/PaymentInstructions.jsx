import React from 'react';

const PaymentInstructions = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Instruksi Pembayaran
      </h2>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">
                Langkah Pembayaran
              </h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Datang ke kasir dengan membawa pesanan ini</li>
                <li>Tunjukkan nomor meja dan detail pesanan</li>
                <li>Lakukan pembayaran tunai sesuai total harga</li>
                <li>Tunggu konfirmasi dari kasir</li>
                <li>Pesanan akan segera diproses</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructions;
