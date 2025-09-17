import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchTokoById, fetchKategoriByTokoId, fetchMenuWithVariasi } from '../services/database';
import { getUrlParams, getParamFromStorage, saveParamsToStorage } from '../utils/urlParams';

const RestaurantContext = createContext();

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};

export const RestaurantProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRestaurantData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ambil parameter dari URL atau localStorage
        let urlParams;
        try {
          urlParams = getUrlParams();
        } catch (error) {
          console.error('Error getting URL params in RestaurantContext:', error);
          urlParams = { toko_id: null, table: '1' };
        }
        
        let restaurantId = urlParams.toko_id;
        let table = urlParams.table;

        // Jika tidak ada di URL, coba ambil dari localStorage
        if (!restaurantId) {
          const storedParams = getParamFromStorage();
          if (storedParams && storedParams.toko_id) {
            restaurantId = storedParams.toko_id;
            table = storedParams.table || '1';
          }
        }

        if (!restaurantId) {
          throw new Error('Restaurant ID tidak ditemukan di URL atau localStorage');
        }

        // Simpan parameter ke localStorage untuk backup
        saveParamsToStorage({ toko_id: restaurantId, table });

        // Fetch data toko, kategori, dan menu secara parallel
        const [tokoData, kategoriData, menuData] = await Promise.all([
          fetchTokoById(restaurantId),
          fetchKategoriByTokoId(restaurantId),
          fetchMenuWithVariasi(restaurantId)
        ]);

        // Transform data toko menjadi format restaurant
        const restaurantData = {
          id: tokoData.id,
          name: tokoData.nama_toko,
          address: tokoData.gmaps_link || "Alamat tidak tersedia",
          phone: tokoData.whatsapp_number || "Nomor telepon tidak tersedia",
          logo: "/logo.png", // Default logo
          description: "Restoran dengan cita rasa yang autentik",
          social_media: tokoData.social_media,
          license_status: tokoData.license_status,
          license_type: tokoData.license_type,
          // Transform kategori data
          categories: kategoriData.map(kategori => ({
            id: kategori.id,
            name: kategori.nama,
            icon: "🍽️" // Default icon, bisa diupdate sesuai kebutuhan
          })),
          // Transform menu data dengan variasi
          menu: menuData.map(menu => ({
            id: menu.id,
            name: menu.nama,
            price: menu.harga,
            image: "/nasgor.jpg", // Default image untuk MVP
            category: menu.kategori_id,
            category_name: menu.kategori_nama,
            available: true, // Default available
            variasi: menu.variasi || [] // Array variasi dari database
          }))
        };

        setRestaurant(restaurantData);
        setTableNumber(table);
      } catch (err) {
        console.error('Error loading restaurant data:', err);
        setError(err.message);
        
        // Fallback ke mock data jika ada error
        const mockRestaurant = {
          id: 'fallback',
          name: "Warung Makan Sederhana",
          address: "Jl. Raya No. 123, Jakarta",
          phone: "+62 812-3456-7890",
          logo: "/logo.png",
          description: "Warung makan dengan cita rasa tradisional yang autentik",
          categories: [
            { id: 1, name: "Makanan Utama", icon: "🍽️" },
            { id: 2, name: "Minuman", icon: "🥤" },
            { id: 3, name: "Snack", icon: "🍿" }
          ],
          menu: [
            {
              id: 1,
              name: "Nasi Goreng Spesial",
              price: 25000,
              image: "/nasgor.jpg",
              category: 1,
              available: true,
              variasi: []
            },
            {
              id: 2,
              name: "Ayam Bakar Madu",
              price: 35000,
              image: "/nasgor.jpg",
              category: 1,
              available: true,
              variasi: []
            }
          ]
        };
        
        setRestaurant(mockRestaurant);
        setTableNumber('1');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurantData();
  }, []);

  const value = {
    restaurant,
    tableNumber,
    loading,
    error,
    setRestaurant,
    setTableNumber,
    getUrlParams: () => getUrlParams()
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
};
