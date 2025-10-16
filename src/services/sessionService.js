import { supabase } from '../lib/supabase';

export const generateSessionToken = () => {
  return 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export const createCustomerSession = async ({ toko_id, table_number, customer_name, customer_phone }) => {
  const { data: sessionId, error } = await supabase.rpc('create_customer_session', {
    p_toko_id: toko_id,
    p_table_number: table_number,
    p_customer_name: customer_name,
    p_customer_phone: customer_phone
  });
  if (error) throw error;

  const { data: session, error: fetchError } = await supabase
    .from('customer_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (fetchError) throw fetchError;
  return session;
};

export const findActiveSession = async (tokoId, tableNumber) => {
  const { data, error } = await supabase
    .from('customer_sessions')
    .select('*')
    .eq('toko_id', tokoId)
    .eq('table_number', tableNumber)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getSessionByToken = async (sessionToken) => {
  const { data, error } = await supabase
    .from('customer_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('status', 'active')
    .single();
  if (error) return null;
  return data;
};

export const getSessionOrders = async (sessionToken) => {
  const { data, error } = await supabase
    .from('pesanan_online')
    .select('*')
    .eq('session_token', sessionToken)
    .order('created_at', { ascending: true });
  if (error) throw error;
  
  // Debug logging
  console.log('getSessionOrders - sessionToken:', sessionToken);
  console.log('getSessionOrders - raw data:', data);
  console.log('getSessionOrders - data length:', data?.length || 0);
  
  return data || [];
};

export const updateSessionActivity = async (sessionToken) => {
  await supabase.rpc('update_session_activity', { p_session_token: sessionToken });
};

export const updateSessionCustomerData = async (sessionToken, customerData) => {
  const { data, error } = await supabase
    .from('customer_sessions')
    .update({
      customer_name: customerData.name,
      customer_phone: customerData.phone,
      last_activity_at: new Date().toISOString()
    })
    .eq('session_token', sessionToken)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const closeSession = async (sessionToken) => {
  const { error } = await supabase.rpc('close_customer_session', { p_session_token: sessionToken });
  if (error) throw error;
  return true;
};

export const getSessionOrdersSummary = async (sessionToken) => {
  const { data, error } = await supabase.rpc('get_session_orders_summary', {
    p_session_token: sessionToken
  });
  if (error) throw error;
  return data; // { session, orders:[{... items:[] }], total_amount }
};


