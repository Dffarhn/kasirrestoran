import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import { useCart } from '../../context/CartContext';
import { useSession } from '../../context/SessionContext';
import { ShoppingCart, MapPin, Clock, Receipt } from 'lucide-react';
import { safeBuildUrl } from '../../utils/safeNavigation';
import CloseBillModal from '../UI/CloseBillModal';
import { checkKitchenModeEnabled } from '../../services/database';

const Header = () => {
  const { restaurant, tableNumber, loading } = useRestaurant();
  const { getTotalItems } = useCart();
  const { session, sessionOrders, sessionTotal, closeBill, loading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const [showCloseBillModal, setShowCloseBillModal] = useState(false);
  const [kitchenModeEnabled, setKitchenModeEnabled] = useState(false);

  const handleCloseBillClick = () => {
    setShowCloseBillModal(true);
  };

  const handleCloseBillConfirm = async () => {
    try {
      // Tutup modal terlebih dahulu agar tidak tertinggal di UI
      setShowCloseBillModal(false);
      const summaryData = await closeBill();
      // Redirect ke halaman summary dengan data
      navigate(safeBuildUrl('/close-bill-summary'), {
        state: { summaryData }
      });
    } catch (error) {
      alert('Error closing session: ' + error.message);
    }
  };

  const handleCloseModal = () => {
    setShowCloseBillModal(false);
  };

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
            <div className="relative flex-shrink-0">
              <img
                src="/logo.png"
                alt="Mibebi-Kasir Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-contain shadow-lg ring-2 ring-[#FFD700] bg-white p-1"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-[#FFD700] rounded-full border-2 border-[#0D0D0D]"></div>
            </div>
            <div className="min-w-0 flex-1">
              {/* Mobile: Simplified layout */}
              <div className="sm:hidden">
                <h1 className="text-lg font-bold text-[#FFD700] truncate">
                  {restaurant?.name}
                </h1>
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
                <h1 className="text-lg font-bold text-[#FFD700] truncate">
                  {restaurant?.name}
                </h1>
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
                <h1 className="text-xl font-bold text-[#FFD700] truncate">
                  {restaurant?.name}
                </h1>
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

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Close Bill Button - trigger modal */}
            {session && (
              <button
                onClick={handleCloseBillClick}
                disabled={sessionLoading}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0D0D0D] border-2 border-[#FFD700] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#FFD700] hover:text-[#0D0D0D] disabled:bg-[#333333] disabled:border-[#555555] disabled:text-[#B3B3B3] disabled:cursor-not-allowed"
              >
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] transition-colors duration-200" />
                <div className="text-center">
                  <div className="text-xs font-semibold text-[#FFD700] transition-colors duration-200">
                    {sessionLoading ? 'Processing...' : 'Close Bill'}
                  </div>
                  <div className="text-xs text-[#B3B3B3] transition-colors duration-200">
                    Rp {(sessionTotal || 0).toLocaleString()}
                  </div>
                </div>
              </button>
            )}

            {/* Kitchen Queue Button - Only show if kitchen mode is enabled */}
            {kitchenModeEnabled && (
              <Link
                to={safeBuildUrl("/order-status")}
                className="relative group"
              >
                <div className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-[#0D0D0D] border-2 border-[#FFD700] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#FFD700] hover:text-[#0D0D0D]">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200" />
                  <span className="hidden sm:block text-sm font-semibold text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200">
                    Antrian
                  </span>
                </div>
              </Link>
            )}

            {/* Cart Button */}
            <Link
              to={safeBuildUrl("/cart")}
              className="relative group"
            >
            <div className="flex items-center space-x-2 sm:space-x-3 px-4 sm:px-5 py-3 sm:py-3.5 bg-[#0D0D0D] border-2 border-[#FFD700] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:bg-[#FFD700] hover:text-[#0D0D0D]">
              {/* Cart Icon */}
              <div className="relative z-10">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200" />
              </div>
              
              {/* Text - Hidden on mobile, shown on larger screens */}
              <div className="hidden sm:block relative z-10">
                <div className="text-sm font-semibold text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200">Keranjang</div>
                <div className="text-xs text-[#B3B3B3] group-hover:text-[#0D0D0D] transition-colors duration-200">{getTotalItems()} item</div>
              </div>
              
              {/* Mobile: Show item count next to icon */}
              <div className="sm:hidden relative z-10">
                <span className="text-sm font-bold text-[#FFD700] group-hover:text-[#0D0D0D] transition-colors duration-200">{getTotalItems()}</span>
              </div>
            </div>
            
            {/* Badge for items count - removed excessive animations */}
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
    {/* Close Bill Modal - render as sibling to header to allow full-screen overlay */}
    <CloseBillModal
      isOpen={showCloseBillModal}
      onClose={handleCloseModal}
      onConfirm={handleCloseBillConfirm}
      sessionData={{
        tableNumber: session?.table_number,
        ordersCount: sessionOrders?.length || 0,
        totalAmount: sessionTotal || 0
      }}
      loading={sessionLoading}
    />
    </>
  );
};

export default Header;
