import { supabase } from '../lib/supabase'

// Database service layer untuk semua operasi database

/**
 * Get admin fee from database settings
 */
export const getAdminFee = async (tokoId) => {
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('admin_fee')
      .eq('toko_id', tokoId)
      .single()

    if (error) {
      console.error('Error fetching admin fee:', error)
      return 1000 // Fallback to default
    }

    return data?.admin_fee || 1000
  } catch (error) {
    console.error('Error in getAdminFee:', error)
    return 1000 // Fallback to default
  }
}

/**
 * Fetch toko (restaurant) data berdasarkan ID
 */
export const fetchTokoById = async (tokoId) => {
  try {
    const { data, error } = await supabase
      .from('toko')
      .select('*')
      .eq('id', tokoId)
      .single()

    if (error) {
      console.error('Error fetching toko:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in fetchTokoById:', error)
    throw error
  }
}

/**
 * Fetch semua kategori untuk toko tertentu
 */
export const fetchKategoriByTokoId = async (tokoId) => {
  try {
    const { data, error } = await supabase
      .from('kategori')
      .select('*')
      .eq('toko_id', tokoId)
      .order('nama')

    if (error) {
      console.error('Error fetching kategori:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchKategoriByTokoId:', error)
    throw error
  }
}

/**
 * Fetch menu dengan variasi menggunakan view menu_with_variasi
 */
export const fetchMenuWithVariasi = async (tokoId) => {
  try {
    const { data, error } = await supabase
      .from('menu_with_variasi')
      .select('*')
      .eq('toko_id', tokoId)
      .order('kategori_nama, nama')

    if (error) {
      console.error('Error fetching menu with variasi:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchMenuWithVariasi:', error)
    throw error
  }
}

/**
 * Fetch menu berdasarkan kategori
 */
export const fetchMenuByKategori = async (tokoId, kategoriId) => {
  try {
    const { data, error } = await supabase
      .from('menu_with_variasi')
      .select('*')
      .eq('toko_id', tokoId)
      .eq('kategori_id', kategoriId)
      .order('nama')

    if (error) {
      console.error('Error fetching menu by kategori:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in fetchMenuByKategori:', error)
    throw error
  }
}

/**
 * Fetch atau create pelanggan berdasarkan nomor HP
 */
export const fetchOrCreatePelanggan = async (tokoId, nama, noHp) => {
  try {
    // Validasi parameter
    if (!tokoId || !nama || !noHp) {
      throw new Error('Missing required parameters: tokoId, nama, or noHp');
    }

    // Clean phone number
    const cleanPhone = noHp.replace(/[\s\-\(\)]/g, '');

    // Coba cari pelanggan yang sudah ada
    const { data: existingCustomer, error: searchError } = await supabase
      .from('pelanggan')
      .select('*')
      .eq('toko_id', tokoId)
      .eq('no_hp', cleanPhone)
      .maybeSingle() // Use maybeSingle to avoid error when no rows

    if (searchError) {
      console.error('Error searching for customer:', searchError)
      // Don't throw error, continue to create new customer
    }

    if (existingCustomer) {
      // Update nama jika berbeda
      if (existingCustomer.nama !== nama) {
        const { data: updatedCustomer, error: updateError } = await supabase
          .from('pelanggan')
          .update({ nama })
          .eq('id', existingCustomer.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating customer:', updateError)
          throw updateError
        }

        return updatedCustomer
      }
      return existingCustomer
    }

    // Create new customer
    const { data: newCustomer, error: createError } = await supabase
      .from('pelanggan')
      .insert({
        toko_id: tokoId,
        nama,
        no_hp: cleanPhone
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating customer:', createError)
      throw createError
    }

    return newCustomer
  } catch (error) {
    console.error('Error in fetchOrCreatePelanggan:', error)
    throw error
  }
}

/**
 * Create transaksi baru
 */
export const createTransaksi = async (transaksiData) => {
  try {
    const { data, error } = await supabase
      .from('transaksi')
      .insert(transaksiData)
      .select()
      .single()

    if (error) {
      console.error('Error creating transaksi:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createTransaksi:', error)
    throw error
  }
}

/**
 * Create transaksi detail
 */
export const createTransaksiDetail = async (detailData) => {
  try {
    const { data, error } = await supabase
      .from('transaksi_detail')
      .insert(detailData)
      .select()

    if (error) {
      console.error('Error creating transaksi detail:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createTransaksiDetail:', error)
    throw error
  }
}

/**
 * Submit order lengkap (transaksi + detail)
 */
export const submitOrder = async (orderData) => {
  try {
    // 1. Create transaksi
    const transaksi = await createTransaksi({
      toko_id: orderData.tokoId,
      user_id: orderData.userId, // Bisa null untuk anonymous
      total: orderData.total,
      subtotal: orderData.subtotal,
      admin_fee: orderData.adminFee || 1000,
      nama_pembeli: orderData.customerInfo.name,
      no_hp_pembeli: orderData.customerInfo.phone,
      pelanggan_id: orderData.pelangganId,
      pesan: orderData.orderNotes,
      is_anonymous: orderData.isAnonymous || false,
      customer_type: orderData.customerType || 'anonymous'
    })

    // 2. Create transaksi detail untuk setiap item
    const detailPromises = orderData.items.map(item => 
      createTransaksiDetail({
        transaksi_id: transaksi.id,
        menu_id: item.menu_id,
        variasi_id: item.variasi_id,
        qty: item.quantity,
        harga_satuan: item.harga_satuan,
        nama_menu: item.nama_menu
      })
    )

    const details = await Promise.all(detailPromises)

    return {
      transaksi,
      details
    }
  } catch (error) {
    console.error('Error in submitOrder:', error)
    throw error
  }
}

/**
 * Search customer by phone number
 */
export const searchCustomerByPhone = async (phone, tokoId) => {
  try {
    // Validasi parameter
    if (!phone || !tokoId) {
      console.warn('Missing phone or tokoId parameter');
      return null;
    }

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    const { data, error } = await supabase
      .from('pelanggan')
      .select('id, nama, no_hp')
      .eq('toko_id', tokoId)
      .eq('no_hp', cleanPhone)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no rows

    if (error) {
      console.error('Error searching customer:', error);
      // Don't throw error, just return null for better UX
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in searchCustomerByPhone:', error);
    // Return null instead of throwing to prevent app crash
    return null;
  }
};

/**
 * Create pesanan online
 */
export const createPesananOnline = async (orderData) => {
  try {
    let customerId = null;
    
    // Jika customer ditemukan, gunakan ID-nya
    if (orderData.customerInfo.customerId) {
      customerId = orderData.customerInfo.customerId;
    } else {
      // Jika customer baru, create atau update
      const customer = await fetchOrCreatePelanggan(
        orderData.tokoId,
        orderData.customerInfo.name,
        orderData.customerInfo.phone
      );
      customerId = customer.id;
    }

    // Create pesanan_online
    const { data: pesanan, error: pesananError } = await supabase
      .from('pesanan_online')
      .insert({
        toko_id: orderData.tokoId,
        customer_name: orderData.customerInfo.name,
        customer_phone: orderData.customerInfo.phone,
        customer_email: null,
        table_number: orderData.tableNumber,
        order_notes: orderData.orderNotes,
        total_amount: orderData.total,
        subtotal: orderData.subtotal,
        admin_fee: orderData.adminFee,
        is_anonymous: false,
        customer_type: 'online',
        status: 'pending',
        pelanggan_id: customerId
      })
      .select()
      .single();

    if (pesananError) throw pesananError;

    // Create pesanan_online_detail
    const details = orderData.items.map(item => ({
      pesanan_online_id: pesanan.id,
      menu_id: item.menu_id,
      variasi_id: item.variasi_id,
      menu_name: item.name,
      variasi_name: item.variasi_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      notes: item.notes || ''
    }));

    const { error: detailError } = await supabase
      .from('pesanan_online_detail')
      .insert(details);

    if (detailError) throw detailError;

    return pesanan;
  } catch (error) {
    console.error('Error creating pesanan online:', error);
    throw error;
  }
};

/**
 * Update pesanan online status dan link ke transaksi
 * Digunakan saat kasir memproses pembayaran di Flutter POS
 */
export const updatePesananOnlineStatus = async (pesananId, status, transaksiId = null) => {
  try {
    const updateData = {
      status: status,
      paid_at: status === 'paid' ? new Date().toISOString() : null
    };

    if (transaksiId) {
      updateData.transaksi_id = transaksiId;
    }

    const { data, error } = await supabase
      .from('pesanan_online')
      .update(updateData)
      .eq('id', pesananId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating pesanan online status:', error);
    throw error;
  }
};

/**
 * Get pesanan online by status untuk Flutter POS
 */
export const getPesananOnlineByStatus = async (tokoId, status = 'pending') => {
  try {
    const { data, error } = await supabase
      .from('pesanan_online')
      .select(`
        *,
        pesanan_online_detail(*)
      `)
      .eq('toko_id', tokoId)
      .eq('status', status)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching pesanan online:', error);
    throw error;
  }
};

/**
 * Convert pesanan online ke transaksi
 * Digunakan saat kasir memproses pembayaran
 */
export const convertPesananOnlineToTransaksi = async (pesananOnlineId, userId) => {
  try {
    // 1. Get pesanan online dengan detail
    const { data: pesanan, error: pesananError } = await supabase
      .from('pesanan_online')
      .select(`
        *,
        pesanan_online_detail(*)
      `)
      .eq('id', pesananOnlineId)
      .single();

    if (pesananError) throw pesananError;

    // 2. Create transaksi
    const { data: transaksi, error: transaksiError } = await supabase
      .from('transaksi')
      .insert({
        toko_id: pesanan.toko_id,
        user_id: userId,
        total: pesanan.total_amount,
        subtotal: pesanan.subtotal,
        admin_fee: pesanan.admin_fee,
        nama_pembeli: pesanan.customer_name,
        no_hp_pembeli: pesanan.customer_phone,
        pelanggan_id: pesanan.pelanggan_id,
        pesan: pesanan.order_notes,
        is_anonymous: pesanan.is_anonymous,
        customer_type: pesanan.customer_type,
        order_type: 'online' // Tambahan field untuk membedakan order type
      })
      .select()
      .single();

    if (transaksiError) throw transaksiError;

    // 3. Create transaksi detail
    const detailPromises = pesanan.pesanan_online_detail.map(detail => 
      supabase
        .from('transaksi_detail')
        .insert({
          transaksi_id: transaksi.id,
          menu_id: detail.menu_id,
          variasi_id: detail.variasi_id,
          qty: detail.quantity,
          harga_satuan: detail.unit_price,
          nama_menu: detail.menu_name,
          variasi_nama: detail.variasi_name
        })
    );

    await Promise.all(detailPromises);

    // 4. Update pesanan online status
    await updatePesananOnlineStatus(pesananOnlineId, 'paid', transaksi.id);

    return transaksi;
  } catch (error) {
    console.error('Error converting pesanan online to transaksi:', error);
    throw error;
  }
};
