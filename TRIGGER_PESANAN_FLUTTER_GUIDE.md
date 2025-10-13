# 🚀 Trigger Pesanan - Flutter Implementation Guide

## 📋 Overview

Dokumentasi lengkap tentang bagaimana sistem trigger pesanan bekerja, untuk implementasi di project Flutter.

## 🔄 Flow Lengkap Trigger Pesanan

### **1. Customer Pesan Menu (Frontend)**
```javascript
// React/Web Implementation
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // 1. Prepare order data
    const orderData = {
      tokoId: restaurant.id,
      tableNumber: tableNumber, // 🆕 Include table number
      customerInfo: {
        name: customerInfo.name,
        phone: customerInfo.phone
      },
      orderNotes: orderNotes,
      items: cartItems.map(item => ({
        menu_id: item.id,
        variasi_id: item.variasi_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      })),
      total: total,
      subtotal: finalSubtotal
    };

    // 2. Submit pesanan
    const pesanan = await createPesananOnline(orderData);
    
    // 3. Clear cart
    clearCart();
    
    // 4. Redirect to confirmation
    navigate('/confirmation');
  } catch (error) {
    console.error('Error creating pesanan:', error);
  }
};
```

### **2. Backend Processing (Database) - Web (Tanpa Trigger)**
```javascript
// src/services/database.js
const createPesananOnline = async (orderData) => {
  try {
    // 1. Save pesanan to database
    const { data: pesanan, error: pesananError } = await supabase
      .from('pesanan_online')
      .insert(pesananData)
      .select()
      .single();

    if (pesananError) throw pesananError;

    // 2. Send notification to kasir
    try {
      await sendOrderNotification(notificationData);
    } catch (notificationError) {
      console.warn('Notification failed but order was created successfully');
    }

    // 3. AUTO-CREATE KITCHEN QUEUE dipindahkan ke Flutter (single source of truth)

    return pesanan;
  } catch (error) {
    console.error('Error creating pesanan:', error);
    throw error;
  }
};
```

### **3. Kitchen Queue Auto-Creation**
```javascript
const createKitchenQueueFromPesanan = async (pesananId, orderData) => {
  try {
    console.log('🍳 Creating kitchen queue for pesanan:', pesananId);
    
    // 1. Get pesanan details
    const { data: pesanan } = await supabase
      .from('pesanan_online')
      .select('*, pesanan_online_detail(*)')
      .eq('id', pesananId)
      .single();

    if (!pesanan) {
      throw new Error('Pesanan not found');
    }

    // 2. Create kitchen queue entry
    const { data: kitchenQueue } = await supabase
      .from('kitchen_queue')
      .insert({
        toko_id: orderData.tokoId,
        source_type: 'online',
        source_id: pesananId,
        order_number: 'ORD-' + pesananId,
        table_number: orderData.tableNumber, // 🆕 Include table number
        customer_name: orderData.customerInfo.name,
        customer_phone: orderData.customerInfo.phone,
        total_amount: orderData.total,
        subtotal: orderData.subtotal
      })
      .select()
      .single();

    if (!kitchenQueue) {
      throw new Error('Failed to create kitchen queue');
    }

    console.log('✅ Kitchen queue created:', kitchenQueue.id);

    // 3. Create kitchen queue items
    const items = pesanan.pesanan_online_detail.map(item => ({
      kitchen_queue_id: kitchenQueue.id,
      menu_id: item.menu_id,
      menu_name: item.menu_name,
      variasi_name: item.variasi_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_percentage: item.discount_percentage || 0,
      total_discount: item.total_discount || 0
    }));

    const { error: itemsError } = await supabase
      .from('kitchen_queue_items')
      .insert(items);

    if (itemsError) {
      throw itemsError;
    }

    console.log('✅ Kitchen queue items created:', items.length, 'items');
    return kitchenQueue;
  } catch (error) {
    console.error('❌ Error creating kitchen queue from pesanan:', error);
    throw error;
  }
};
```

## 🎯 Flutter Implementation

### **1. Flutter Service Layer**
```dart
// lib/services/order_service.dart
class OrderService {
  final SupabaseClient _supabase;
  
  OrderService(this._supabase);
  
  Future<Map<String, dynamic>> createPesananOnline({
    required String tokoId,
    required String tableNumber,
    required Map<String, dynamic> customerInfo,
    required List<Map<String, dynamic>> items,
    required int total,
    required int subtotal,
  }) async {
    try {
      // 1. Create pesanan
      final pesananResponse = await _supabase
          .from('pesanan_online')
          .insert({
            'toko_id': tokoId,
            'table_number': tableNumber,
            'customer_name': customerInfo['name'],
            'customer_phone': customerInfo['phone'],
            'total': total,
            'subtotal': subtotal,
            'status': 'pending',
            'created_at': DateTime.now().toIso8601String(),
          })
          .select()
          .single();
      
      // 2. Create pesanan details
      for (var item in items) {
        await _supabase
            .from('pesanan_online_detail')
            .insert({
              'pesanan_id': pesananResponse['id'],
              'menu_id': item['menu_id'],
              'menu_name': item['menu_name'],
              'variasi_name': item['variasi_name'],
              'quantity': item['quantity'],
              'unit_price': item['unit_price'],
            });
      }
      
      // 3. 🆕 AUTO-CREATE KITCHEN QUEUE
      await _createKitchenQueueFromPesanan(
        pesananResponse['id'],
        tokoId: tokoId,
        tableNumber: tableNumber,
        customerInfo: customerInfo,
        total: total,
        subtotal: subtotal,
      );
      
      return pesananResponse;
    } catch (e) {
      print('Error creating pesanan: $e');
      rethrow;
    }
  }
  
  Future<void> _createKitchenQueueFromPesanan(
    String pesananId, {
    required String tokoId,
    required String tableNumber,
    required Map<String, dynamic> customerInfo,
    required int total,
    required int subtotal,
  }) async {
    try {
      print('🍳 Creating kitchen queue for pesanan: $pesananId');
      
      // 1. Get pesanan details
      final pesananResponse = await _supabase
          .from('pesanan_online')
          .select('*, pesanan_online_detail(*)')
          .eq('id', pesananId)
          .single();
      
      // 2. Create kitchen queue
      final kitchenQueueResponse = await _supabase
          .from('kitchen_queue')
          .insert({
            'toko_id': tokoId,
            'source_type': 'online',
            'source_id': pesananId,
            'order_number': 'ORD-$pesananId',
            'table_number': tableNumber, // 🆕 Include table number
            'customer_name': customerInfo['name'],
            'customer_phone': customerInfo['phone'],
            'total_amount': total,
            'subtotal': subtotal,
            'status': 'pending',
            'created_at': DateTime.now().toIso8601String(),
          })
          .select()
          .single();
      
      print('✅ Kitchen queue created: ${kitchenQueueResponse['id']}');
      
      // 3. Create kitchen queue items
      final items = (pesananResponse['pesanan_online_detail'] as List)
          .map((item) => {
                'kitchen_queue_id': kitchenQueueResponse['id'],
                'menu_id': item['menu_id'],
                'menu_name': item['menu_name'],
                'variasi_name': item['variasi_name'],
                'quantity': item['quantity'],
                'unit_price': item['unit_price'],
                'discount_percentage': item['discount_percentage'] ?? 0,
                'total_discount': item['total_discount'] ?? 0,
              })
          .toList();
      
      await _supabase
          .from('kitchen_queue_items')
          .insert(items);
      
      print('✅ Kitchen queue items created: ${items.length} items');
    } catch (e) {
      print('❌ Error creating kitchen queue: $e');
      rethrow;
    }
  }
}
```

### **2. Flutter UI Implementation**
```dart
// lib/pages/checkout_page.dart
class CheckoutPage extends StatefulWidget {
  @override
  _CheckoutPageState createState() => _CheckoutPageState();
}

class _CheckoutPageState extends State<CheckoutPage> {
  final OrderService _orderService = OrderService(Supabase.instance.client);
  bool _isSubmitting = false;
  
  Future<void> _handleSubmit() async {
    setState(() {
      _isSubmitting = true;
    });
    
    try {
      // 1. Prepare order data
      final orderData = {
        'tokoId': restaurant.id,
        'tableNumber': tableNumber,
        'customerInfo': {
          'name': customerName,
          'phone': customerPhone,
        },
        'items': cartItems.map((item) => {
          'menu_id': item.id,
          'menu_name': item.name,
          'variasi_name': item.variasiName,
          'quantity': item.quantity,
          'unit_price': item.price,
        }).toList(),
        'total': total,
        'subtotal': subtotal,
      };
      
      // 2. Submit pesanan (auto-trigger kitchen queue)
      final pesanan = await _orderService.createPesananOnline(
        tokoId: orderData['tokoId'],
        tableNumber: orderData['tableNumber'],
        customerInfo: orderData['customerInfo'],
        items: orderData['items'],
        total: orderData['total'],
        subtotal: orderData['subtotal'],
      );
      
      // 3. Clear cart
      _clearCart();
      
      // 4. Navigate to confirmation
      Navigator.pushReplacementNamed(context, '/confirmation');
      
    } catch (e) {
      print('Error creating pesanan: $e');
      // Show error dialog
      _showErrorDialog(e.toString());
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Checkout')),
      body: Column(
        children: [
          // Order summary
          Expanded(child: OrderSummary()),
          
          // Submit button
          Padding(
            padding: EdgeInsets.all(16),
            child: ElevatedButton(
              onPressed: _isSubmitting ? null : _handleSubmit,
              child: _isSubmitting 
                ? CircularProgressIndicator() 
                : Text('Pesan Sekarang'),
            ),
          ),
        ],
      ),
    );
  }
}
```

### **3. Flutter Realtime Subscription**
```dart
// lib/services/kitchen_queue_service.dart
class KitchenQueueService {
  final SupabaseClient _supabase;
  StreamSubscription? _subscription;
  
  KitchenQueueService(this._supabase);
  
  Stream<List<Map<String, dynamic>>> watchKitchenQueue(String tokoId) {
    return _supabase
        .from('kitchen_queue')
        .stream(primaryKey: ['id'])
        .eq('toko_id', tokoId)
        .order('created_at', ascending: false)
        .map((data) => data as List<Map<String, dynamic>>);
  }
  
  Future<List<Map<String, dynamic>>> getKitchenQueue(String tokoId) async {
    final response = await _supabase
        .from('kitchen_queue')
        .select('*, kitchen_queue_items(*)')
        .eq('toko_id', tokoId)
        .order('created_at', ascending: false);
    
    return response as List<Map<String, dynamic>>;
  }
  
  void dispose() {
    _subscription?.cancel();
  }
}
```

### **4. Flutter Kitchen Queue UI**
```dart
// lib/pages/kitchen_queue_page.dart
class KitchenQueuePage extends StatefulWidget {
  @override
  _KitchenQueuePageState createState() => _KitchenQueuePageState();
}

class _KitchenQueuePageState extends State<KitchenQueuePage> {
  final KitchenQueueService _kitchenService = KitchenQueueService(Supabase.instance.client);
  List<Map<String, dynamic>> _kitchenOrders = [];
  bool _loading = true;
  
  @override
  void initState() {
    super.initState();
    _loadKitchenQueue();
    _watchKitchenQueue();
  }
  
  Future<void> _loadKitchenQueue() async {
    try {
      final orders = await _kitchenService.getKitchenQueue(restaurant.id);
      setState(() {
        _kitchenOrders = orders;
        _loading = false;
      });
    } catch (e) {
      print('Error loading kitchen queue: $e');
      setState(() {
        _loading = false;
      });
    }
  }
  
  void _watchKitchenQueue() {
    _kitchenService.watchKitchenQueue(restaurant.id).listen((orders) {
      setState(() {
        _kitchenOrders = orders;
      });
    });
  }
  
  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    
    // Filter pending orders only
    final pendingOrders = _kitchenOrders
        .where((order) => order['status'] == 'pending')
        .toList();
    
    return Scaffold(
      appBar: AppBar(
        title: Text('Antrian Dapur'),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _loadKitchenQueue,
          ),
        ],
      ),
      body: Column(
        children: [
          // Queue position for current customer
          if (_getCurrentCustomerOrders().isNotEmpty)
            QueuePositionCard(
              orders: _getCurrentCustomerOrders(),
              totalQueue: pendingOrders.length,
            ),
          
          // Pending orders list
          Expanded(
            child: ListView.builder(
              itemCount: pendingOrders.length,
              itemBuilder: (context, index) {
                final order = pendingOrders[index];
                return OrderStatusCard(
                  order: order,
                  queuePosition: index + 1,
                  isCurrentCustomer: _isCurrentCustomer(order),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
  
  List<Map<String, dynamic>> _getCurrentCustomerOrders() {
    return _kitchenOrders.where((order) => 
      order['table_number'] == restaurant.tableNumber ||
      order['customer_name'] == restaurant.customerName
    ).toList();
  }
  
  bool _isCurrentCustomer(Map<String, dynamic> order) {
    return order['table_number'] == restaurant.tableNumber ||
           order['customer_name'] == restaurant.customerName;
  }
}
```

## 🔧 Database Schema (Supabase)

### **1. pesanan_online Table**
```sql
CREATE TABLE public.pesanan_online (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  table_number text,
  customer_name text,
  customer_phone text,
  total integer NOT NULL,
  subtotal integer NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pesanan_online_pkey PRIMARY KEY (id)
);
```

### **2. kitchen_queue Table**
```sql
CREATE TABLE public.kitchen_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  toko_id uuid NOT NULL,
  source_type text NOT NULL,
  source_id uuid NOT NULL,
  order_number text NOT NULL,
  table_number text, -- 🆕 Include table number
  customer_name text,
  customer_phone text,
  status text DEFAULT 'pending',
  total_amount integer NOT NULL,
  subtotal integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT kitchen_queue_pkey PRIMARY KEY (id)
);
```

### **3. kitchen_queue_items Table**
```sql
CREATE TABLE public.kitchen_queue_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  kitchen_queue_id uuid NOT NULL,
  menu_id uuid NOT NULL,
  menu_name text NOT NULL,
  variasi_name text,
  quantity integer NOT NULL,
  unit_price integer NOT NULL,
  discount_percentage integer DEFAULT 0,
  total_discount integer DEFAULT 0,
  is_out boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT kitchen_queue_items_pkey PRIMARY KEY (id)
);
```

## 🚀 Trigger Flow Summary

### **1. Customer Action:**
- Pesan menu → Submit pesanan
- Data: `{tokoId, tableNumber, customerInfo, items, total, subtotal}`

### **2. Backend Processing:**
- Save pesanan → `pesanan_online` table
- Auto-create kitchen queue → `kitchen_queue` table
- Create kitchen items → `kitchen_queue_items` table

### **3. Realtime Updates:**
- Supabase postgres_changes events
- Flutter stream subscription
- UI updates automatically

### **4. Staff Management:**
- Update kitchen queue status
- Mark items as completed
- Real-time sync across devices

## ✅ Implementation Checklist

- [ ] **Flutter Service Layer** - OrderService, KitchenQueueService
- [ ] **Database Integration** - Supabase client setup
- [ ] **Realtime Subscription** - Stream kitchen queue updates
- [ ] **UI Components** - CheckoutPage, KitchenQueuePage
- [ ] **Error Handling** - Try-catch blocks, user feedback
- [ ] **State Management** - Loading states, data persistence
- [ ] **Navigation** - Page routing, data passing
- [ ] **Testing** - Unit tests, integration tests

**Sekarang Anda bisa implementasikan trigger pesanan di Flutter dengan mengikuti guide ini!** 🚀✨
