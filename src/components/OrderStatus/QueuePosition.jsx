import React from 'react';
import { Clock, Users, ChefHat } from 'lucide-react';

const QueuePosition = ({ 
  orders, 
  totalQueue, 
  getQueuePosition, 
  getEstimatedWaitTime 
}) => {
  const currentOrder = orders[0]; // Ambil pesanan terbaru customer
  const position = getQueuePosition(currentOrder.id);
  const estimatedTime = getEstimatedWaitTime(position);

  const getStatusMessage = () => {
    if (position === 1) return 'Pesanan Anda sedang diproses!';
    if (position <= 3) return 'Pesanan Anda akan segera diproses';
    return 'Pesanan Anda dalam antrian';
  };

  const getStatusColor = () => {
    if (position === 1) return 'bg-green-500';
    if (position <= 3) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-gradient-to-r from-[#FFD700] to-yellow-400 rounded-lg p-4 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded ${getStatusColor()}`}>
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0D0D0D]">
              {currentOrder.table_number ? `Meja ${currentOrder.table_number}` : (currentOrder.customer_name || 'Pelanggan')}
            </h3>
            <p className="text-xs text-[#0D0D0D] opacity-80">
              #{currentOrder.order_number} • {getStatusMessage()}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-[#0D0D0D]">
            #{position}
          </div>
          <div className="text-xs text-[#0D0D0D] opacity-80">
            dari {totalQueue}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-xs text-[#0D0D0D] opacity-80 mb-1">Estimasi</div>
          <div className="text-sm font-bold text-[#0D0D0D]">
            {estimatedTime}
          </div>
        </div>

        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-xs text-[#0D0D0D] opacity-80 mb-1">Total</div>
          <div className="text-sm font-bold text-[#0D0D0D]">
            {totalQueue}
          </div>
        </div>

        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-xs text-[#0D0D0D] opacity-80 mb-1">Status</div>
          <div className="text-sm font-bold text-[#0D0D0D]">
            {position === 1 ? 'Diproses' : 'Menunggu'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#0D0D0D]">Progress Antrian</span>
          <span className="text-sm text-[#0D0D0D] opacity-80">
            {Math.round((position / totalQueue) * 100)}%
          </span>
        </div>
        <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
          <div 
            className="bg-[#0D0D0D] h-3 rounded-full transition-all duration-500"
            style={{ width: `${(position / totalQueue) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default QueuePosition;
