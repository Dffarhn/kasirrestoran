import React from 'react';

const OrderNotes = ({ orderNotes, setOrderNotes }) => {
  const handleChange = (e) => {
    setOrderNotes(e.target.value);
  };

  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-4">
      <h2 className="text-base font-semibold text-[#FFFFFF] mb-3" style={{fontFamily: 'Playfair Display, serif'}}>
        Catatan Pesanan
      </h2>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-[#B3B3B3] mb-1">
          Catatan Khusus (Opsional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={orderNotes}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-3 border border-[#333333] bg-[#0D0D0D] text-[#FFFFFF] rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors resize-none text-base placeholder-[#B3B3B3]"
          placeholder="Contoh: Tidak pedas, tambah es, dll."
        />
        <p className="text-xs text-[#B3B3B3] mt-1">
          Maksimal 200 karakter
        </p>
      </div>
    </div>
  );
};

export default OrderNotes;
