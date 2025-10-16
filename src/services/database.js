import { supabase } from '../lib/supabase'

// Database service layer untuk semua operasi database

/**
 * Get admin fee from database settings
 */
export const getAdminFee = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_admin_setting', { setting_key_param: 'admin_fee' })

    if (error) {
      console.error('Error fetching admin fee:', error)
      return 1000 // Fallback to default
    }

    return parseInt(data) || 1000
  } catch (error) {
    console.error('Error in getAdminFee:', error)
    return 1000 // Fallback to default
  }
}

/**
 * Get global discount settings from toko
 */
export const getGlobalDiscount = async (tokoId) => {
  try {
    const { data, error } = await supabase
      .from('toko')
      .select('global_discount_percentage, global_discount_enabled')
      .eq('id', tokoId)
      .single()

    if (error) {
      console.error('Error fetching global discount:', error)
      return { enabled: false, percentage: 0 }
    }

    return {
      enabled: data.global_discount_enabled || false,
      percentage: data.global_discount_percentage || 0
    }
  } catch (error) {
    console.error('Error in getGlobalDiscount:', error)
    return { enabled: false, percentage: 0 }
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
 * Fetch menu langsung dari tabel menu dengan variasi dan image
 */
export const fetchMenuWithVariasiAndImages = async (tokoId) => {
  try {
    // Fetch menu dengan variasi dan image fields
    const { data: menuData, error: menuError } = await supabase
      .from('menu')
      .select(`
        *,
        kategori(nama),
        menu_variasi(*)
      `)
      .eq('toko_id', tokoId)
      .order('nama', { ascending: true })

    if (menuError) {
      console.error('Error fetching menu with images:', menuError)
      throw menuError
    }

    // Transform data untuk kompatibilitas dengan format yang diharapkan
    const transformedData = menuData.map(menu => ({
      ...menu,
      kategori_nama: menu.kategori?.nama || 'Tanpa Kategori',
      variasi: menu.menu_variasi || []
    }))

    // Sort berdasarkan kategori dan nama menu
    transformedData.sort((a, b) => {
      // Sort by kategori first
      if (a.kategori_nama !== b.kategori_nama) {
        return a.kategori_nama.localeCompare(b.kategori_nama);
      }
      // Then sort by nama menu
      return a.nama.localeCompare(b.nama);
    });


    return transformedData || []
  } catch (error) {
    console.error('Error in fetchMenuWithVariasiAndImages:', error)
    throw error
  }
}

/**
 * Get menu image URL dengan fallback ke default image
 * Image hanya dari tabel menu (bukan dari variasi)
 */
export const getMenuImageUrl = (menuItem) => {
  // Jika ada image_url (link lengkap), gunakan langsung
  if (menuItem.image_url && menuItem.image_url.trim() !== '') {
    return menuItem.image_url;
  }
  
  // Jika ada image_path (path internal), gunakan image_path
  if (menuItem.image_path && menuItem.image_path.trim() !== '') {
    return menuItem.image_path;
  }
  
  // Fallback ke default image
  return '/DefaultMenu.png';
}

/**
 * Calculate discount amount and final price
 */
export const calculateDiscount = (basePrice, discountPercentage) => {
  const discountAmount = Math.round((basePrice * discountPercentage) / 100);
  const finalPrice = basePrice - discountAmount;
  
  return {
    originalPrice: basePrice,
    discountPercentage: discountPercentage || 0,
    discountAmount,
    finalPrice
  };
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
        nama_menu: item.nama_menu,
        variasi_nama: item.variasi_nama,
        discount_percentage: item.discount_percentage || 0,
        harga_asli: item.harga_asli || item.harga_satuan,
        total_discount: item.total_discount || 0
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

    // Debug logging untuk session data
    console.log('createPesananOnline - session_id:', orderData.session_id);
    console.log('createPesananOnline - session_token:', orderData.session_token);
    console.log('createPesananOnline - orderData keys:', Object.keys(orderData));

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
        subtotal: orderData.subtotal, // Subtotal SEBELUM global discount
        admin_fee: orderData.adminFee,
        is_anonymous: false,
        customer_type: 'online',
        status: 'pending',
        pelanggan_id: customerId,
        // Session fields
        session_id: orderData.session_id || null,
        session_token: orderData.session_token || null,
        // Global discount fields
        global_discount_amount: orderData.globalDiscountAmount || 0,
        global_discount_percentage: orderData.globalDiscountPercentage || 0
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
      notes: item.notes || '',
      discount_percentage: item.discount_percentage || 0,
      harga_asli: item.harga_asli || item.unit_price,
      total_discount: item.total_discount || 0
    }));

    const { error: detailError } = await supabase
      .from('pesanan_online_detail')
      .insert(details);

    if (detailError) throw detailError;

    // 🆕 KIRIM NOTIFIKASI SETELAH PESANAN BERHASIL DIBUAT
    try {
      await sendOrderNotification({
        order_id: pesanan.id,
        toko_id: pesanan.toko_id,
        customer_name: pesanan.customer_name,
        total_amount: pesanan.total_amount,
        created_at: pesanan.created_at
      });
    } catch (notificationError) {
      // Log error tapi jangan ganggu flow utama
      console.warn('Notification failed but order was created successfully:', notificationError);
    }

    // Auto-create kitchen queue dipindahkan ke aplikasi Flutter (single source of truth)

    return pesanan;
  } catch (error) {
    console.error('Error creating pesanan online:', error);
    throw error;
  }
};

/**
 * Send order notification to kasir devices
 */
export const sendOrderNotification = async (notificationData) => {
  try {
    console.log('Sending notification with data:', notificationData);
    
    const { data, error } = await supabase.functions.invoke('send-order-notification', {
      body: notificationData
    });
    
    if (error) {
      throw new Error(`Supabase function error: ${error.message}`);
    }
    
    console.log('✅ Notification sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    // Jangan throw error di sini, biarkan order tetap tersimpan
    // meskipun notifikasi gagal
    return null;
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
        order_type: 'online', // Tambahan field untuk membedakan order type
        // Global discount fields
        global_discount_amount: pesanan.global_discount_amount || 0,
        global_discount_percentage: pesanan.global_discount_percentage || 0
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
          variasi_nama: detail.variasi_name,
          discount_percentage: detail.discount_percentage || 0,
          harga_asli: detail.harga_asli || detail.unit_price,
          total_discount: detail.total_discount || 0
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
