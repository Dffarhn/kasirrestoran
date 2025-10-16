import React, { useState } from 'react';
import { searchCustomerByPhone } from '../../services/database';
import { useRestaurant } from '../../context/RestaurantContext';
import { useSession } from '../../context/SessionContext';

const CustomerInfo = ({ customerInfo, setCustomerInfo }) => {
  const { restaurant } = useRestaurant();
  const { customerData } = useSession();
  const [isSearching, setIsSearching] = useState(false);
  const [customerFound, setCustomerFound] = useState(null);

  const handlePhoneChange = async (e) => {
    const phone = e.target.value;
    setCustomerInfo(prev => ({ ...prev, phone }));

    // Auto-search customer jika phone sudah lengkap (min 10 digit)
    if (phone.length >= 10) {
      setIsSearching(true);
      try {
        const customer = await searchCustomerByPhone(phone, restaurant.id);
        if (customer) {
          setCustomerFound(customer);
          setCustomerInfo(prev => ({ 
            ...prev, 
            name: customer.nama,
            customerId: customer.id 
          }));
        } else {
          setCustomerFound(null);
          setCustomerInfo(prev => ({ 
            ...prev, 
            name: '',
            customerId: null 
          }));
        }
      } catch (error) {
        console.error('Error searching customer:', error);
        setCustomerFound(null);
      } finally {
        setIsSearching(false);
      }
    } else {
      setCustomerFound(null);
      setCustomerInfo(prev => ({ 
        ...prev, 
        name: '',
        customerId: null 
      }));
    }
  };

  const handleNameChange = (e) => {
    setCustomerInfo(prev => ({ ...prev, name: e.target.value }));
  };


  return (
    <div className="bg-[#1A1A1A] rounded-lg shadow-sm border border-[#333333] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[#FFFFFF]" style={{fontFamily: 'Playfair Display, serif'}}>
          Informasi Pelanggan
        </h2>
        {customerData && (customerData.name || customerData.phone) && (
          <div className="flex items-center space-x-1 text-xs text-[#FFD700]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Data tersimpan</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#B3B3B3] mb-1">
            Nomor Telepon *
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={handlePhoneChange}
              required
              className="w-full px-3 py-3 border border-[#333333] bg-[#0D0D0D] text-[#FFFFFF] rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors text-base placeholder-[#B3B3B3]"
              placeholder="08xxxxxxxxxx"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFD700]"></div>
              </div>
            )}
          </div>
          {customerFound && (
            <p className="text-xs text-[#FFD700] mt-1">
              ✓ Customer ditemukan: {customerFound.nama}
            </p>
          )}
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#B3B3B3] mb-1">
            Nama Lengkap *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={customerInfo.name}
            onChange={handleNameChange}
            required
            className="w-full px-3 py-3 border border-[#333333] bg-[#0D0D0D] text-[#FFFFFF] rounded-lg focus:ring-2 focus:ring-[#FFD700] focus:border-[#FFD700] transition-colors text-base placeholder-[#B3B3B3]"
            placeholder="Masukkan nama lengkap"
            disabled={customerFound} // Disabled jika customer ditemukan
          />
          {customerFound && (
            <p className="text-xs text-[#B3B3B3] mt-1">
              Nama otomatis terisi dari database
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerInfo;
