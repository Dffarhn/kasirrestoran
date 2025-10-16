import React from 'react';
import { useSession } from '../../context/SessionContext';

const SessionHistory = () => {
  const { session, sessionOrders, sessionTotal, closeBill, loading } = useSession();

  if (!session) {
    return (
      <div className="px-4 py-6 text-[#B3B3B3]">
        Tidak ada session aktif.
      </div>
    );
  }

  return (
    <div className="px-4 py-6 text-[#FFFFFF]">
      <h2 className="text-xl font-bold mb-2">Session Orders</h2>
      <div className="mb-4 text-sm text-[#B3B3B3]">
        <div>Table: {session.table_number}</div>
        <div>Customer: {session.customer_name || '-'}</div>
        <div>Phone: {session.customer_phone || '-'}</div>
      </div>

      <div className="space-y-3">
        {sessionOrders.map(order => (
          <div key={order.id} className="border border-[#333333] rounded-lg p-3 bg-[#111111]">
            <div className="flex justify-between text-sm">
              <div>Order #{order.order_number || order.id?.slice(0,8)}</div>
              <div className="text-[#FFD700]">Rp {((order.total_amount)||0).toLocaleString()}</div>
            </div>
            <div className="text-xs text-[#B3B3B3] mt-1">
              <span>Status: {order.status}</span>
              <span className="ml-4">{new Date(order.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[#1A1A1A] rounded-lg border border-[#333333] text-center">
        <div className="text-sm text-[#B3B3B3] mb-1">Session Total</div>
        <div className="text-2xl font-semibold text-[#FFD700]">Rp {sessionTotal.toLocaleString()}</div>
        <button
          onClick={closeBill}
          disabled={loading}
          className="mt-4 w-full px-4 py-3 bg-[#0D0D0D] border-2 border-[#FFD700] text-[#FFD700] rounded-lg hover:bg-[#FFD700] hover:text-[#0D0D0D] disabled:bg-[#333333] disabled:border-[#555555] disabled:text-[#B3B3B3]"
        >
          {loading ? 'Memproses...' : 'Close Bill & Akhiri Session'}
        </button>
      </div>
    </div>
  );
};

export default SessionHistory;


