import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  createCustomerSession,
  findActiveSession,
  getSessionByToken,
  getSessionOrders,
  updateSessionActivity,
  updateSessionCustomerData,
  closeSession
} from '../services/sessionService';
import { useRestaurant } from './RestaurantContext';

const SessionContext = createContext();

const getSessionTokenKey = (tokoId) => (tokoId ? `session_token_${tokoId}` : null);

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
};

export const SessionProvider = ({ children }) => {
  const { restaurant } = useRestaurant();
  const [session, setSession] = useState(null);
  const [sessionOrders, setSessionOrders] = useState([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState(null);

  const tokenKey = getSessionTokenKey(restaurant?.id);

  const loadSessionData = useCallback(async (sessionToken, currentTokoId) => {
    setLoading(true);
    try {
      const s = await getSessionByToken(sessionToken);
      if (!s || s.status !== 'active') {
        const key = getSessionTokenKey(currentTokoId);
        if (key) localStorage.removeItem(key);
        setSession(null);
        setSessionOrders([]);
        setSessionTotal(0);
        setCustomerData(null);
        return;
      }
      // Session harus untuk toko yang sedang aktif
      if (currentTokoId && s.toko_id !== currentTokoId) {
        const key = getSessionTokenKey(currentTokoId);
        if (key) localStorage.removeItem(key);
        setSession(null);
        setSessionOrders([]);
        setSessionTotal(0);
        setCustomerData(null);
        return;
      }
      const orders = await getSessionOrders(sessionToken);
      setSession(s);
      setSessionOrders(orders);
      
      // Set customer data dari session untuk auto-fill
      if (s.customer_name || s.customer_phone) {
        setCustomerData({
          name: s.customer_name || '',
          phone: s.customer_phone || ''
        });
      }
      
      // Debug logging untuk cek data
      console.log('Session orders:', orders);
      console.log('Orders total_amount fields:', orders.map(o => ({ id: o.id, total_amount: o.total_amount, total: o.total })));
      
      // Perhitungan total yang lebih robust
      const total = orders.reduce((sum, order) => {
        // Coba field total_amount dulu, fallback ke total
        const amount = order.total_amount || order.total || 0;
        console.log(`Order ${order.id}: amount = ${amount}`);
        return sum + amount;
      }, 0);
      
      console.log('Calculated session total:', total);
      setSessionTotal(total);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load session untuk toko aktif (setiap ganti toko, load token toko tersebut)
  useEffect(() => {
    if (!tokenKey) {
      setSession(null);
      setSessionOrders([]);
      setSessionTotal(0);
      setCustomerData(null);
      return;
    }
    const token = localStorage.getItem(tokenKey);
    if (token) {
      loadSessionData(token, restaurant?.id);
    } else {
      setSession(null);
      setSessionOrders([]);
      setSessionTotal(0);
      setCustomerData(null);
    }
  }, [tokenKey, restaurant?.id]);

  const createNewSession = async (tokoId, tableNumber, customerInfo) => {
    setLoading(true);
    try {
      const s = await createCustomerSession({
        toko_id: tokoId,
        table_number: tableNumber,
        customer_name: customerInfo?.name || null,
        customer_phone: customerInfo?.phone || null
      });
      const key = getSessionTokenKey(tokoId);
      if (key) localStorage.setItem(key, s.session_token);
      setSession(s);
      setSessionOrders([]);
      setSessionTotal(0);
      
      // Set customer data untuk auto-fill di pesanan berikutnya
      if (customerInfo?.name || customerInfo?.phone) {
        setCustomerData({
          name: customerInfo.name || '',
          phone: customerInfo.phone || ''
        });
      }
      
      return s;
    } finally {
      setLoading(false);
    }
  };

  const joinExistingSession = async (tokoId, tableNumber) => {
    setLoading(true);
    try {
      const s = await findActiveSession(tokoId, tableNumber);
      if (!s) return null;
      const key = getSessionTokenKey(tokoId);
      if (key) localStorage.setItem(key, s.session_token);
      await loadSessionData(s.session_token, tokoId);
      return s;
    } finally {
      setLoading(false);
    }
  };

  const closeBill = async () => {
    const token = tokenKey ? localStorage.getItem(tokenKey) : null;
    if (!token) return false;
    setLoading(true);
    try {
      // Simpan data summary sebelum close session
      const summaryData = {
        sessionId: session?.id,
        sessionToken: session?.session_token,
        tableNumber: session?.table_number,
        customerName: session?.customer_name,
        customerPhone: session?.customer_phone,
        orders: sessionOrders,
        totalAmount: sessionTotal,
        closedAt: new Date().toISOString()
      };

      await closeSession(token);
      
      // Simpan summary data ke localStorage untuk halaman summary
      localStorage.setItem('close_bill_summary', JSON.stringify(summaryData));
      // Simpan token session yang baru saja di-close (per toko) untuk pemuatan data dari DB
      if (summaryData.sessionToken && restaurant?.id) {
        localStorage.setItem(`closed_session_token_${restaurant.id}`, summaryData.sessionToken);
      }
      
      // Clear session state untuk toko ini
      if (tokenKey) localStorage.removeItem(tokenKey);
      setSession(null);
      setSessionOrders([]);
      setSessionTotal(0);
      setCustomerData(null);
      
      return summaryData;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    const token = tokenKey ? localStorage.getItem(tokenKey) : null;
    if (token && restaurant?.id) await loadSessionData(token, restaurant.id);
  };

  const updateCustomerData = async (customerData) => {
    const token = tokenKey ? localStorage.getItem(tokenKey) : null;
    if (!token) return;
    
    try {
      await updateSessionCustomerData(token, customerData);
      // Update local state
      setCustomerData(customerData);
      // Refresh session data
      if (restaurant?.id) await loadSessionData(token, restaurant.id);
    } catch (error) {
      console.error('Error updating customer data:', error);
    }
  };

  const value = {
    session,
    sessionOrders,
    sessionTotal,
    loading,
    customerData,
    createNewSession,
    joinExistingSession,
    closeBill,
    refreshSession,
    loadSessionData,
    updateCustomerData
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};


