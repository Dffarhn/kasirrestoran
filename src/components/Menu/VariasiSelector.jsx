import React, { useState, useEffect } from 'react';

const VariasiSelector = ({ variasi, onVariasiSelect, selectedVariasiId, menuPrice, discountPercentage = 0 }) => {
  const [selectedId, setSelectedId] = useState(selectedVariasiId);

  useEffect(() => {
    setSelectedId(selectedVariasiId);
  }, [selectedVariasiId]);

  // Jika tidak ada variasi, return null
  if (!variasi || variasi.length === 0) {
    return null;
  }

  const handleVariasiChange = (variasiId) => {
    setSelectedId(variasiId);
    onVariasiSelect(variasiId);
  };

  // Cari variasi yang dipilih untuk mendapatkan harga
  const selectedVariasi = variasi.find(v => v.id === selectedId);
  const basePrice = selectedVariasi 
    ? menuPrice + selectedVariasi.harga_tambahan 
    : menuPrice;
  
  // Calculate price with discount
  const discountAmount = Math.round((basePrice * discountPercentage) / 100);
  const totalPrice = basePrice - discountAmount;

  return (
    <div className="mt-2">
      <div className="text-xs text-[#B3B3B3] mb-2">Pilih Variasi:</div>
      <div className="space-y-2">
        {variasi.map((v) => (
          <label
            key={v.id}
            className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
              selectedId === v.id
                ? 'border-[#FFD700] bg-[#FFD700]/10'
                : 'border-[#333333] bg-[#0D0D0D] hover:border-[#FFD700]/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                name={`variasi-${v.id}`}
                value={v.id}
                checked={selectedId === v.id}
                onChange={() => handleVariasiChange(v.id)}
                className="w-4 h-4 text-[#FFD700] bg-[#0D0D0D] border-[#333333] focus:ring-[#FFD700] focus:ring-2"
              />
              <div>
                <span className="text-sm text-[#FFFFFF] font-medium">
                  {v.nama}
                </span>
                {v.harga_tambahan > 0 && (
                  <span className="text-xs text-[#FFD700] ml-2">
                    (+{new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(v.harga_tambahan)})
                  </span>
                )}
              </div>
            </div>
            {selectedId === v.id && (
              <div className="text-sm text-[#FFD700] font-semibold">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(totalPrice)}
                {discountPercentage > 0 && (
                  <div className="text-xs text-[#B3B3B3] line-through">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(basePrice)}
                  </div>
                )}
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

export default VariasiSelector;
