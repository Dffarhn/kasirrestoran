import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService } from '../services/realtimeService';

/**
 * Custom hook untuk real-time orders
 * 
 * @param {string} tokoId - ID toko
 * @param {string|null} status - Status pesanan (opsional)
 * @param {boolean} includeDetails - Include detail pesanan
 * @returns {object} - { orders, loading, error, count, refresh }
 */
export const useRealtimeOrders = (tokoId, status = null, includeDetails = true) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(0);
  
  const subscriptionIdRef = useRef(null);
  const isSubscribedRef = useRef(false);

  // Callback untuk handle real-time updates
  const handleRealtimeUpdate = useCallback((payload) => {
    console.log('Real-time update received:', payload);

    switch (payload.type) {
      case 'initial_data':
        setOrders(payload.data || []);
        setCount(payload.data?.length || 0);
        setLoading(false);
        setError(null);
        break;

      case 'count_update':
        setCount(payload.count);
        break;

      case 'error':
        setError(payload.error);
        setLoading(false);
        break;

      default:
        // Handle Supabase real-time events
        if (payload.eventType) {
          // Reload data setelah ada perubahan
          refresh();
        }
        break;
    }
  }, []);

  // Subscribe ke real-time updates
  const subscribe = useCallback(() => {
    if (!tokoId || isSubscribedRef.current) return;

    try {
      const subscriptionId = realtimeService.subscribeToPesananOnline({
        tokoId,
        status,
        includeDetails,
        callback: handleRealtimeUpdate
      });

      subscriptionIdRef.current = subscriptionId;
      isSubscribedRef.current = true;
      
      console.log('Subscribed to real-time orders:', subscriptionId);
    } catch (err) {
      console.error('Error subscribing to real-time orders:', err);
      setError(err);
      setLoading(false);
    }
  }, [tokoId, status, includeDetails, handleRealtimeUpdate]);

  // Unsubscribe dari real-time updates
  const unsubscribe = useCallback(() => {
    if (subscriptionIdRef.current) {
      realtimeService.unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
      isSubscribedRef.current = false;
      console.log('Unsubscribed from real-time orders');
    }
  }, []);

  // Refresh data
  const refresh = useCallback(async () => {
    if (!tokoId) return;

    setLoading(true);
    setError(null);

    try {
      // Import supabase client
      const { supabase } = await import('../lib/supabase');
      
      // Reload data dengan query manual
      let query = supabase
        .from('pesanan_online')
        .select(includeDetails ? '*, pesanan_online_detail(*)' : '*')
        .eq('toko_id', tokoId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setOrders(data || []);
      setCount(data?.length || 0);
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing orders:', err);
      setError(err);
      setLoading(false);
    }
  }, [tokoId, status, includeDetails]);

  // Effect untuk subscribe/unsubscribe
  useEffect(() => {
    if (tokoId) {
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [tokoId, status, includeDetails, subscribe, unsubscribe]);

  // Cleanup saat component unmount
  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    orders,
    loading,
    error,
    count,
    refresh,
    isSubscribed: isSubscribedRef.current
  };
};

/**
 * Custom hook untuk pending orders count
 * 
 * @param {string} tokoId - ID toko
 * @returns {object} - { count, loading, error }
 */
export const usePendingOrdersCount = (tokoId) => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const subscriptionIdRef = useRef(null);
  const isSubscribedRef = useRef(false);

  // Callback untuk handle count updates
  const handleCountUpdate = useCallback((payload) => {
    console.log('Count update received:', payload);
    
    if (payload.type === 'count_update') {
      setCount(payload.count);
      setLoading(false);
      setError(null);
    } else if (payload.type === 'error') {
      setError(payload.error);
      setLoading(false);
    }
  }, []);

  // Subscribe ke pending orders count
  const subscribe = useCallback(() => {
    if (!tokoId || isSubscribedRef.current) return;

    try {
      const subscriptionId = realtimeService.subscribeToPendingOrders(
        tokoId,
        handleCountUpdate
      );

      subscriptionIdRef.current = subscriptionId;
      isSubscribedRef.current = true;
      
      console.log('Subscribed to pending orders count:', subscriptionId);
    } catch (err) {
      console.error('Error subscribing to pending orders count:', err);
      setError(err);
      setLoading(false);
    }
  }, [tokoId, handleCountUpdate]);

  // Unsubscribe
  const unsubscribe = useCallback(() => {
    if (subscriptionIdRef.current) {
      realtimeService.unsubscribe(subscriptionIdRef.current);
      subscriptionIdRef.current = null;
      isSubscribedRef.current = false;
      console.log('Unsubscribed from pending orders count');
    }
  }, []);

  // Effect untuk subscribe/unsubscribe
  useEffect(() => {
    if (tokoId) {
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [tokoId, subscribe, unsubscribe]);

  // Cleanup saat component unmount
  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    count,
    loading,
    error,
    isSubscribed: isSubscribedRef.current
  };
};

/**
 * Custom hook untuk semua orders dengan real-time
 * 
 * @param {string} tokoId - ID toko
 * @returns {object} - { orders, loading, error, count, refresh }
 */
export const useAllRealtimeOrders = (tokoId) => {
  return useRealtimeOrders(tokoId, null, true);
};

/**
 * Custom hook untuk orders dengan status tertentu
 * 
 * @param {string} tokoId - ID toko
 * @param {string} status - Status pesanan
 * @returns {object} - { orders, loading, error, count, refresh }
 */
export const useOrdersByStatus = (tokoId, status) => {
  return useRealtimeOrders(tokoId, status, true);
};
