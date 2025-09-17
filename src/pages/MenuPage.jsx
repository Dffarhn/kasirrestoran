import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import CategoryFilter from '../components/Menu/CategoryFilter';
import FeaturedMenuCard from '../components/Menu/FeaturedMenuCard';
import MenuItem from '../components/Menu/MenuItem';
import LoadingSpinner from '../components/UI/LoadingSpinner';

const MenuPage = () => {
  const { restaurant, loading } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#FFFFFF] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
            Restoran tidak ditemukan
          </h2>
          <p className="text-[#B3B3B3]" style={{fontFamily: 'Inter, sans-serif'}}>
            Silakan periksa kembali URL atau hubungi admin.
          </p>
        </div>
      </div>
    );
  }

  const filteredMenu = selectedCategory
    ? restaurant.menu.filter(item => item.category === selectedCategory)
    : restaurant.menu;

  // Get featured item (first item or a special one)
  const featuredItem = filteredMenu.length > 0 ? filteredMenu[0] : null;
  const regularMenu = filteredMenu.slice(1); // Rest of the menu items

  return (
    <div className="px-4 py-4 pb-24">


      {/* Category Filter - Mobile Optimized */}
      <CategoryFilter
        categories={restaurant.categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Featured Menu Card */}
      {featuredItem && (
        <FeaturedMenuCard item={featuredItem} />
      )}

      {/* Menu Grid - Responsive Grid Layout */}
      {regularMenu.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regularMenu.map(item => (
            <MenuItem key={item.id} item={item} />
          ))}
        </div>
      )}

      {filteredMenu.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-[#FFFFFF] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
            Tidak ada menu tersedia
          </h3>
          <p className="text-sm text-[#B3B3B3]" style={{fontFamily: 'Inter, sans-serif'}}>
            Belum ada menu untuk kategori yang dipilih.
          </p>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
