import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchTokoById, fetchKategoriByTokoId, fetchMenuWithVariasiAndImages, getMenuImageUrl, getGlobalDiscount } from '../services/database';
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

        // Fetch data toko, kategori, menu, dan global discount secara parallel
        const [tokoData, kategoriData, menuData, globalDiscountData] = await Promise.all([
          fetchTokoById(restaurantId),
          fetchKategoriByTokoId(restaurantId),
          fetchMenuWithVariasiAndImages(restaurantId),
          getGlobalDiscount(restaurantId)
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
          // Global discount settings
          globalDiscount: globalDiscountData,
          // Transform kategori data
          categories: kategoriData.map(kategori => ({
            id: kategori.id,
            name: kategori.nama,
            icon: "🍽️" // Default icon, bisa diupdate sesuai kebutuhan
          })),
          // Transform menu data dengan variasi + stok
          menu: menuData.map(menu => {
            const stockEnabled = menu.stock_enabled === true;
            const stockQuantity = typeof menu.stock_quantity === 'number' ? menu.stock_quantity : 0;
            const stockAlertThreshold = typeof menu.stock_alert_threshold === 'number' ? menu.stock_alert_threshold : 5;
            const available = stockEnabled ? stockQuantity > 0 : true;
            return {
              id: menu.id,
              name: menu.nama,
              price: menu.harga,
              image: getMenuImageUrl(menu),
              category: menu.kategori_id,
              category_name: menu.kategori_nama,
              available,
              stock_enabled: stockEnabled,
              stock_quantity: stockQuantity,
              stock_alert_threshold: stockAlertThreshold,
              variasi: menu.variasi || [],
              image_url: menu.image_url,
              image_path: menu.image_path,
              discount_percentage: menu.discount_percentage || 0
            };
          })
        };

        console.log('Restaurant Data:', restaurantData);
        console.log('Menu Data with Discount:', menuData.map(menu => ({
          name: menu.nama,
          price: menu.harga,
          discount_percentage: menu.discount_percentage
        })));

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
              image: "/DefaultMenu.png",
              category: 1,
              available: true,
              stock_enabled: false,
              stock_quantity: 0,
              stock_alert_threshold: 5,
              variasi: [],
              image_url: null,
              image_path: null,
              discount_percentage: 20
            },
            {
              id: 2,
              name: "Ayam Bakar Madu",
              price: 35000,
              image: "/DefaultMenu.png",
              category: 1,
              available: true,
              stock_enabled: false,
              stock_quantity: 0,
              stock_alert_threshold: 5,
              variasi: [],
              image_url: null,
              image_path: null,
              discount_percentage: 15
            },
            {
              id: 3,
              name: "Es Teh Manis",
              price: 8000,
              image: "/DefaultMenu.png",
              category: 2,
              available: true,
              stock_enabled: false,
              stock_quantity: 0,
              stock_alert_threshold: 5,
              variasi: [],
              image_url: null,
              image_path: null,
              discount_percentage: 0
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
