import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService } from '../services/realtimeService';

/**
 * Custom hook untuk kitchen queue real-time
 * 
 * @param {string} tokoId - ID toko
 * @param {string|null} status - Status pesanan (opsional)
 * @param {boolean} includeItems - Include detail items
 * @returns {object} - { kitchenOrders, loading, error, pendingCount, markItemOut }
 */
export const useKitchenQueue = (tokoId, status = null, includeItems = true) => {
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  
  const subscriptionIdRef = useRef(null);
  const isSubscribedRef = useRef(false);

  // Callback untuk handle real-time updates
  const handleRealtimeUpdate = useCallback((payload) => {
    console.log('🔄 Kitchen queue update received:', {
      type: payload.type,
      eventType: payload.eventType,
      new: payload.new,
      old: payload.old,
      data: payload.data
    });

    // Handle initial data
    if (payload.type === 'initial_data') {
      console.log('📊 Initial data received:', payload.data?.length || 0, 'records');
      setKitchenOrders(payload.data || []);
      setPendingCount(payload.data?.filter(order => order.status === 'pending').length || 0);
      setLoading(false);
      console.log('✅ Loading set to false, orders updated');
      return;
    }

    // Handle error
    if (payload.type === 'error') {
      console.error('❌ Kitchen queue error:', payload.error);
      setError(payload.error);
      setLoading(false);
      return;
    }

    // Handle real-time updates (Supabase postgres_changes)
    if (payload.eventType === 'INSERT') {
      console.log('➕ New kitchen order inserted');
      setKitchenOrders(prev => [payload.new, ...prev]);
      setPendingCount(prev => prev + 1);
    } else if (payload.eventType === 'UPDATE') {
      console.log('🔄 Kitchen order updated');
      setKitchenOrders(prev => 
        prev.map(order => 
          order.id === payload.new.id ? payload.new : order
        )
      );
    } else if (payload.eventType === 'DELETE') {
      console.log('➖ Kitchen order deleted');
      setKitchenOrders(prev => 
        prev.filter(order => order.id !== payload.old.id)
      );
      setPendingCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const subscribe = useCallback(() => {
    if (!tokoId || isSubscribedRef.current) return;

    console.log('🔗 Subscribing to kitchen queue for tokoId:', tokoId);

    try {
      const subscriptionId = realtimeService.subscribeToKitchenQueue({
        tokoId,
        status,
        includeItems,
        callback: handleRealtimeUpdate
      });

      console.log('✅ Subscription created with ID:', subscriptionId);
      subscriptionIdRef.current = subscriptionId;
      isSubscribedRef.current = true;
    } catch (err) {
      console.error('❌ Error subscribing to kitchen queue:', err);
      setError(err);
      setLoading(false);
    }
  }, [tokoId, status, includeItems, handleRealtimeUpdate]);

  // Function untuk mark item out (HANYA untuk internal use, customer tidak bisa)
  const markItemOut = useCallback(async (itemId, isOut) => {
    // Customer tidak bisa mengubah status - ini hanya untuk internal
    console.warn('Customer cannot modify kitchen queue status');
    return false;
  }, []);


  // Effect untuk subscribe/unsubscribe
  useEffect(() => {
    subscribe();
    
    // Timeout untuk menangani kasus loading terlalu lama
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('Kitchen queue loading timeout - setting loading to false');
        setLoading(false);
      }
    }, 10000); // 10 detik timeout

    return () => {
      clearTimeout(timeout);
      if (subscriptionIdRef.current) {
        realtimeService.unsubscribe(subscriptionIdRef.current);
      }
    };
  }, [subscribe, loading]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    if (!tokoId) return;
    
    console.log('🔄 Manual refresh kitchen queue...');
    setLoading(true);
    
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error } = await supabase
        .from('kitchen_queue')
        .select('*, kitchen_queue_items(*)')
        .eq('toko_id', tokoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error refreshing kitchen queue:', error);
        setError(error);
      } else {
        console.log('✅ Kitchen queue refreshed:', data?.length || 0, 'records');
        setKitchenOrders(data || []);
        setPendingCount(data?.filter(order => order.status === 'pending').length || 0);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error in manual refresh:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [tokoId]);

  return {
    kitchenOrders,
    loading,
    error,
    pendingCount,
    markItemOut,
    refresh
  };
};
