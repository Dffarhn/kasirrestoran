import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import { useCart } from '../../context/CartContext';
import { useSession } from '../../context/SessionContext';
import { ShoppingCart, MapPin, Clock, Receipt } from 'lucide-react';
import { safeBuildUrl } from '../../utils/safeNavigation';
import { checkKitchenModeEnabled } from '../../services/database';

const Header = () => {
  const { restaurant, tableNumber, loading } = useRestaurant();
  const { getTotalItems } = useCart();
  const { session, sessionOrders, sessionTotal } = useSession();
  const navigate = useNavigate();
  const [kitchenModeEnabled, setKitchenModeEnabled] = useState(false);


  // Check kitchen mode when restaurant data is available
  useEffect(() => {
    const checkKitchenMode = async () => {
      if (restaurant?.id) {
        try {
          const enabled = await checkKitchenModeEnabled(restaurant.id);
          setKitchenModeEnabled(enabled);
        } catch (error) {
          console.error('Error checking kitchen mode:', error);
          setKitchenModeEnabled(false);
        }
      }
    };

    checkKitchenMode();
  }, [restaurant?.id]);

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
    <header className="sticky top-0 z-50 bg-[#0D0D0D] backdrop-blur-xl border-b-2 border-[#FFD700] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Brand Section */}
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <Link to={safeBuildUrl("/")} className="relative flex-shrink-0 group">
              <img
                src="/LogoMibebiTransparan.png"
                alt="Mibebi-Kasir Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-contain shadow-lg ring-2 ring-[#FFD700] bg-white p-1 group-hover:ring-[#FFE55C] transition-all duration-200"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-[#FFD700] rounded-full border-2 border-[#0D0D0D] group-hover:bg-[#FFE55C] transition-colors duration-200"></div>
            </Link>
            <div className="min-w-0 flex-1">
              {/* Mobile: Simplified layout */}
              <div className="sm:hidden">
x                <Link to={safeBuildUrl("/")} className="group">
                  <h1 className="text-lg font-bold text-[#FFD700] truncate group-hover:text-[#FFE55C] transition-colors duration-200">
                    {restaurant?.name}
                  </h1>
                </Link>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs text-[#B3B3B3]">Meja {tableNumber}</span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <MapPin className="w-3 h-3 text-[#FFD700] flex-shrink-0" />
                  <span className="text-xs text-[#B3B3B3] truncate">{restaurant?.address}</span>
                </div>
              </div>
              
              {/* Tablet: Medium layout */}
              <div className="hidden sm:block lg:hidden">
                <Link to={safeBuildUrl("/")} className="group">
                  <h1 className="text-lg font-bold text-[#FFD700] truncate group-hover:text-[#FFE55C] transition-colors duration-200">
                    {restaurant?.name}
                  </h1>
                </Link>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs text-[#B3B3B3]">Meja {tableNumber}</span>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <MapPin className="w-3 h-3 text-[#FFD700] flex-shrink-0" />
                  <span className="text-xs text-[#B3B3B3] truncate">{restaurant?.address}</span>
                </div>
              </div>
              
              {/* Desktop: Full layout */}
              <div className="hidden lg:block">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium text-[#B3B3B3] uppercase tracking-wide">
                    {restaurant?.name}
                  </span>
                  <span className="text-xs text-[#B3B3B3]">•</span>
                  <span className="text-xs text-[#B3B3B3]">Meja {tableNumber}</span>
                </div>
                <Link to={safeBuildUrl("/")} className="group">
                  <h1 className="text-xl font-bold text-[#FFD700] truncate group-hover:text-[#FFE55C] transition-colors duration-200">
                    {restaurant?.name}
                  </h1>
                </Link>
                <p className="text-sm text-[#B3B3B3] line-clamp-1">
                  {restaurant?.description}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <MapPin className="w-3 h-3 text-[#FFD700]" />
                  <span className="text-xs text-[#B3B3B3]">{restaurant?.address}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Mobile Optimized */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
            {/* History Button - Compact on mobile */}
            {session && (
              <Link
                to={safeBuildUrl("/order-history")}
                className="relative group flex-shrink-0"
              >
                <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-[#0D0D0D] border-2 border-[#FFD700] rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#FFD700] hover:text-[#0D0D0D]">
                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200 flex-shrink-0" />
                  {/* Mobile: Hide text, show badge */}
                  <div className="hidden sm:block text-center">
                    <div className="text-xs font-semibold text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200">
                      History
                    </div>
                    <div className="text-xs text-[#B3B3B3] group-hover:text-[#0D0D0D] transition-colors duration-200">
                      {sessionOrders?.length || 0} pesanan
                    </div>
                  </div>
                  {/* Mobile badge */}
                  {sessionOrders?.length > 0 && (
                    <span className="sm:hidden absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-lg border border-white">
                      {sessionOrders.length}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* Kitchen Queue Button - Compact on mobile */}
            {kitchenModeEnabled && (
              <Link
                to={safeBuildUrl("/order-status")}
                className="relative group flex-shrink-0"
              >
                <div className="flex items-center justify-center px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-[#0D0D0D] border-2 border-[#FFD700] rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#FFD700] hover:text-[#0D0D0D]">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200" />
                  <span className="hidden md:block ml-2 text-sm font-semibold text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200">
                    Antrian
                  </span>
                </div>
              </Link>
            )}

            {/* Cart Button - Always visible, compact on mobile */}
            <Link
              to={safeBuildUrl("/cart")}
              className="relative group flex-shrink-0"
            >
              <div className="flex items-center justify-center px-2.5 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 bg-[#0D0D0D] border-2 border-[#FFD700] rounded-lg sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#FFD700] hover:text-[#0D0D0D]">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200" />
                
                {/* Text - Hidden on mobile, shown on tablet+ */}
                <div className="hidden sm:block ml-2 md:ml-3">
                  <div className="text-sm font-semibold text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200">Keranjang</div>
                  <div className="text-xs text-[#B3B3B3] group-hover:text-[#0D0D0D] transition-colors duration-200">{getTotalItems()} item</div>
                </div>
                
                {/* Mobile: Show item count as badge only */}
              </div>
              
              {/* Badge for items count */}
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-bold shadow-lg border-2 border-white">
                  {getTotalItems()}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

    </header>
    </>
  );
};

export default Header;
