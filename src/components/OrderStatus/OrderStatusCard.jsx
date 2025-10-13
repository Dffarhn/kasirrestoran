import React from 'react';
import { Clock, User, Phone, CheckCircle, Circle, ChefHat } from 'lucide-react';

const OrderStatusCard = ({ 
  order, 
  queuePosition, 
  isCurrentCustomer, 
  estimatedWaitTime 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'border-green-500 bg-green-50';
      case 'pending': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Selesai';
      case 'pending': return 'Sedang Diproses';
      default: return 'Menunggu';
    }
  };

  const getProgressPercentage = () => {
    const totalItems = order.kitchen_queue_items?.length || 0;
    const completedItems = order.kitchen_queue_items?.filter(item => item.is_out).length || 0;
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  const getEstimatedTime = (createdAt) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60));
    
    if (diffMinutes < 5) return 'Baru dipesan';
    if (diffMinutes < 15) return 'Sedang disiapkan';
    if (diffMinutes < 30) return 'Hampir selesai';
    return 'Segera selesai';
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-4 shadow-md ${
      isCurrentCustomer 
        ? 'border-[#FFD700] bg-yellow-50' 
        : getStatusColor(order.status)
    }`}>
      {/* Order Header - Mobile Responsive */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-base font-bold text-gray-900 truncate">
              #{order.order_number}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {getStatusText(order.status)}
            </span>
            {isCurrentCustomer && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-[#FFD700] text-[#0D0D0D]">
                Anda
              </span>
            )}
          </div>
          
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span className="truncate">{order.customer_name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(order.created_at).toLocaleTimeString()}</span>
              {queuePosition && (
                <span className="ml-2">• #{queuePosition}</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right ml-2">
          {estimatedWaitTime && (
            <div className="text-xs text-gray-600">
              {estimatedWaitTime}
            </div>
          )}
        </div>
      </div>

      {/* Simple Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{getProgressPercentage()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#FFD700] h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>{order.kitchen_queue_items?.length || 0} item</span>
          <span>{order.kitchen_queue_items?.filter(item => item.is_out).length || 0} selesai</span>
        </div>
      </div>

      {/* Status Message */}
      {order.status === 'completed' && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ChefHat className="w-4 h-4 text-green-600" />
            <span className="text-green-800 text-sm font-medium">
              Selesai! Ambil di kasir.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusCard;
