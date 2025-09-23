import React, { useState } from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import CategoryFilter from '../components/Menu/CategoryFilter';
import FeaturedMenuCard from '../components/Menu/FeaturedMenuCard';
import MenuItem from '../components/Menu/MenuItem';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useKeyboardShortcuts, useDesktopFeatures } from '../hooks/useKeyboardShortcuts';

const MenuPage = () => {
  const { restaurant, loading } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Desktop features
  useKeyboardShortcuts();
  useDesktopFeatures();

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
    <div className="min-h-screen bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D]">
      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Desktop Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-[#FFD700] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>
                  Menu Digital
                </h1>
                <p className="text-lg text-[#B3B3B3]" style={{fontFamily: 'Inter, sans-serif'}}>
                  Pilih menu favorit Anda dengan mudah
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#B3B3B3]">Total Menu</div>
                <div className="text-2xl font-bold text-[#FFD700]">{filteredMenu.length}</div>
              </div>
            </div>
            
            {/* Desktop Category Filter */}
            <CategoryFilter
              categories={restaurant.categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          </div>

          {/* Desktop Content Layout */}
          <div className="grid grid-cols-12 gap-8">
            {/* Featured Menu - Desktop Layout */}
            {featuredItem && (
              <div className="col-span-12 mb-8">
                <FeaturedMenuCard item={featuredItem} />
              </div>
            )}

            {/* Menu Grid - Desktop Optimized */}
            {regularMenu.length > 0 && (
              <div className="col-span-12">
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                  {regularMenu.map((item, index) => (
                    <div key={item.id} data-menu-item tabIndex={0} className="focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-opacity-50 rounded-3xl">
                      <MenuItem item={item} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredMenu.length === 0 && (
              <div className="col-span-12 text-center py-16">
                <div className="text-8xl mb-6">🍽️</div>
                <h3 className="text-2xl font-semibold text-[#FFFFFF] mb-4" style={{fontFamily: 'Playfair Display, serif'}}>
                  Tidak ada menu tersedia
                </h3>
                <p className="text-lg text-[#B3B3B3] max-w-md mx-auto" style={{fontFamily: 'Inter, sans-serif'}}>
                  Belum ada menu untuk kategori yang dipilih. Silakan pilih kategori lain.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden px-4 py-4 pb-24">
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
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
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
    </div>
  );
};

export default MenuPage;
