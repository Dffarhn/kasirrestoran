import { supabase } from '../lib/supabase'
/**
 * Service untuk real-time sync pesanan online
 * Menggunakan Supabase Realtime untuk mendengarkan perubahan di database
 */
class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
    this.listeners = new Map();
  }

  /**
   * Subscribe ke perubahan pesanan online untuk toko tertentu
   * 
   * @param {string} tokoId - ID toko
   * @param {string|null} status - Status pesanan (opsional)
   * @param {boolean} includeDetails - Include detail pesanan
   * @param {function} callback - Callback function untuk handle perubahan
   * @returns {string} - Subscription ID untuk unsubscribe
   */
  subscribeToPesananOnline({
    tokoId,
    status = null,
    includeDetails = true,
    callback
  }) {
    const subscriptionId = `pesanan_online_${tokoId}_${status || 'all'}_${Date.now()}`;
    
    // Query untuk filter
    let query = supabase
      .from('pesanan_online')
      .select(includeDetails ? '*, pesanan_online_detail(*)' : '*')
      .eq('toko_id', tokoId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    // Subscribe ke perubahan real-time
    const subscription = query.on('*', (payload) => {
      console.log('Real-time update received:', payload);
      callback(payload);
    }).subscribe();

    // Simpan subscription
    this.subscriptions.set(subscriptionId, subscription);
    this.listeners.set(subscriptionId, callback);

    // Load data awal
    this.loadInitialData(tokoId, status, includeDetails, callback);

    return subscriptionId;
  }

  /**
   * Subscribe ke pesanan pending saja (untuk notification badge)
   * 
   * @param {string} tokoId - ID toko
   * @param {function} callback - Callback function
   * @returns {string} - Subscription ID
   */
  subscribeToPendingOrders(tokoId, callback) {
    return this.subscribeToPesananOnline({
      tokoId,
      status: 'pending',
      includeDetails: false,
      callback: (payload) => {
        // Hitung jumlah pesanan pending
        this.getPendingOrdersCount(tokoId).then(count => {
          callback({ type: 'count_update', count, payload });
        });
      }
    });
  }

  /**
   * Subscribe ke semua pesanan untuk toko
   * 
   * @param {string} tokoId - ID toko
   * @param {function} callback - Callback function
   * @returns {string} - Subscription ID
   */
  subscribeToAllOrders(tokoId, callback) {
    return this.subscribeToPesananOnline({
      tokoId,
      includeDetails: true,
      callback
    });
  }

  /**
   * Subscribe ke kitchen queue untuk toko tertentu
   * 
   * @param {string} tokoId - ID toko
   * @param {string|null} status - Status pesanan (opsional)
   * @param {boolean} includeItems - Include detail items
   * @param {function} callback - Callback function untuk handle perubahan
   * @returns {string} - Subscription ID untuk unsubscribe
   */
  subscribeToKitchenQueue({
    tokoId,
    status = null,
    includeItems = true,
    callback
  }) {
    const subscriptionId = `kitchen_queue_${tokoId}_${status || 'all'}_${Date.now()}`;
    
    console.log('🔗 Creating kitchen queue subscription:', {
      subscriptionId,
      tokoId,
      status,
      includeItems
    });
    
    // Subscribe ke perubahan real-time
    const subscription = supabase
      .channel(`kitchen_queue_${tokoId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'kitchen_queue',
        filter: `toko_id=eq.${tokoId}`
      }, (payload) => {
        console.log('📡 Kitchen queue real-time update:', payload);
        callback(payload);
      })
      .subscribe((status) => {
        console.log('📡 Kitchen queue subscription status:', status);
      });

    this.subscriptions.set(subscriptionId, subscription);
    this.listeners.set(subscriptionId, callback);

    // Load data awal
    console.log('📊 Loading initial kitchen data...');
    this.loadInitialKitchenData(tokoId, status, includeItems, callback);

    return subscriptionId;
  }

  /**
   * Subscribe ke kitchen items untuk tracking progress
   * 
   * @param {string} tokoId - ID toko
   * @param {function} callback - Callback function
   * @returns {string} - Subscription ID
   */
  subscribeToKitchenItems({
    tokoId,
    callback
  }) {
    const subscriptionId = `kitchen_items_${tokoId}_${Date.now()}`;
    
    const subscription = supabase
      .channel(`kitchen_items_${tokoId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'kitchen_queue_items'
      }, (payload) => {
        console.log('Kitchen items real-time update:', payload);
        callback(payload);
      })
      .subscribe();

    this.subscriptions.set(subscriptionId, subscription);
    this.listeners.set(subscriptionId, callback);

    return subscriptionId;
  }

  /**
   * Load data awal saat subscribe
   */
  async loadInitialData(tokoId, status, includeDetails, callback) {
    try {
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
        console.error('Error loading initial data:', error);
        callback({ type: 'error', error });
        return;
      }

      callback({ type: 'initial_data', data });
    } catch (error) {
      console.error('Error loading initial data:', error);
      callback({ type: 'error', error });
    }
  }

  /**
   * Load data awal kitchen queue saat subscribe
   */
  async loadInitialKitchenData(tokoId, status, includeItems, callback) {
    try {
      console.log('📊 Loading kitchen data with params:', { tokoId, status, includeItems });
      
      let query = supabase
        .from('kitchen_queue')
        .select(includeItems ? '*, kitchen_queue_items(*)' : '*')
        .eq('toko_id', tokoId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      console.log('📊 Kitchen data query result:', { data, error });

      if (error) {
        console.error('❌ Error loading initial kitchen data:', error);
        // Jika tabel tidak ada atau error, return empty array
        callback({ type: 'initial_data', data: [] });
        return;
      }

      console.log('✅ Kitchen data loaded successfully:', data?.length || 0, 'records');
      callback({ type: 'initial_data', data: data || [] });
    } catch (error) {
      console.error('❌ Error loading initial kitchen data:', error);
      // Return empty array jika error
      callback({ type: 'initial_data', data: [] });
    }
  }

  /**
   * Get count pesanan pending
   * 
   * @param {string} tokoId - ID toko
   * @returns {Promise<number>} - Jumlah pesanan pending
   */
  async getPendingOrdersCount(tokoId) {
    try {
      const { count, error } = await supabase
        .from('pesanan_online')
        .select('*', { count: 'exact', head: true })
        .eq('toko_id', tokoId)
        .eq('status', 'pending');

      if (error) {
        console.error('Error getting pending orders count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting pending orders count:', error);
      return 0;
    }
  }

  /**
   * Unsubscribe dari subscription tertentu
   * 
   * @param {string} subscriptionId - ID subscription
   */
  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      this.listeners.delete(subscriptionId);
    }
  }

  /**
   * Unsubscribe dari semua subscription
   */
  unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.listeners.clear();
  }

  /**
   * Get status subscription
   * 
   * @returns {object} - Status semua subscription
   */
  getSubscriptionStatus() {
    const status = {};
    this.subscriptions.forEach((subscription, id) => {
      status[id] = {
        id,
        status: subscription.state,
        subscribed: subscription.state === 'SUBSCRIBED'
      };
    });
    return status;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Export class untuk testing
export { RealtimeService };
