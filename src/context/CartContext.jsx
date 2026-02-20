import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRestaurant } from './RestaurantContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { restaurant } = useRestaurant();

  // Key cart per toko agar buka 2 toko bersamaan tidak campur
  const cartStorageKey = restaurant?.id ? `restaurant_cart_${restaurant.id}` : null;

  // Load cart untuk toko yang aktif (saat ganti toko, load cart toko tersebut)
  useEffect(() => {
    if (!cartStorageKey) {
      setCartItems([]);
      return;
    }
    const savedCart = localStorage.getItem(cartStorageKey);
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [cartStorageKey]);

  // Save cart ke localStorage per toko
  useEffect(() => {
    if (!cartStorageKey) return;
    localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
  }, [cartItems, cartStorageKey]);

  /** Total qty di keranjang untuk satu menu_id (semua variasi digabung) */
  const getTotalQtyInCartForMenu = (menuId) => {
    return cartItems
      .filter((i) => i.id === menuId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  /** Maksimal qty yang masih boleh dipesan untuk menu ini (sisa stok minus yang sudah di cart) */
  const getMaxQuantityForMenu = (menuId) => {
    const menu = restaurant?.menu?.find((m) => m.id === menuId);
    if (!menu) return null;
    if (!menu.stock_enabled) return null; // unlimited
    const inCart = getTotalQtyInCartForMenu(menuId);
    return Math.max(0, menu.stock_quantity - inCart);
  };

  const addToCart = (item, selectedVariasi = null) => {
    const menu = restaurant?.menu?.find((m) => m.id === item.id) ?? item;
    if (menu.stock_enabled) {
      if (menu.stock_quantity <= 0) {
        return { success: false, errorMessage: 'Stok habis.' };
      }
      const totalInCart = getTotalQtyInCartForMenu(item.id);
      if (totalInCart + 1 > menu.stock_quantity) {
        return {
          success: false,
          errorMessage: `Stok ${item.name} hanya tersedia ${menu.stock_quantity} unit.`
        };
      }
    }

    setCartItems(prevItems => {
      const cartItemId = selectedVariasi ? `${item.id}-${selectedVariasi.id}` : item.id;
      const existingItem = prevItems.find(cartItem => cartItem.cartItemId === cartItemId);

      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.cartItemId === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      const variasiPrice = selectedVariasi ? selectedVariasi.harga_tambahan : 0;
      const totalPrice = item.price + variasiPrice;
      const discountPercentage = item.discount_percentage || 0;
      const discountAmount = Math.round((totalPrice * discountPercentage) / 100);
      const finalPrice = totalPrice - discountAmount;

      const newCartItem = {
        cartItemId,
        id: item.id,
        name: item.name,
        price: item.price,
        totalPrice: finalPrice,
        originalPrice: totalPrice,
        discountPercentage,
        discountAmount,
        quantity: 1,
        variasi_id: selectedVariasi ? selectedVariasi.id : null,
        variasi_name: selectedVariasi ? selectedVariasi.nama : null,
        variasi_price: variasiPrice,
        image: item.image,
        category: item.category
      };

      return [...prevItems, newCartItem];
    });
    return { success: true };
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return { success: true };
    }

    const cartItem = cartItems.find((i) => i.cartItemId === cartItemId);
    if (!cartItem) return { success: false, errorMessage: 'Item tidak ditemukan.' };

    const menu = restaurant?.menu?.find((m) => m.id === cartItem.id);
    if (menu?.stock_enabled) {
      const totalInCart = getTotalQtyInCartForMenu(cartItem.id);
      const newTotalForMenu = totalInCart - cartItem.quantity + quantity;
      if (newTotalForMenu > menu.stock_quantity) {
        return {
          success: false,
          errorMessage: `Stok ${cartItem.name} hanya tersedia ${menu.stock_quantity} unit.`
        };
      }
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
    return { success: true };
  };

  const clearCart = () => {
    setCartItems([]);
    if (cartStorageKey) localStorage.removeItem(cartStorageKey);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
  };

  // Calculate global discount
  const getGlobalDiscountAmount = () => {
    if (!restaurant?.globalDiscount?.enabled || restaurant?.globalDiscount?.percentage <= 0) {
      return 0;
    }
    
    const subtotal = getTotalPrice();
    return Math.round((subtotal * restaurant.globalDiscount.percentage) / 100);
  };

  // Get total price with global discount
  const getTotalPriceWithGlobalDiscount = () => {
    const subtotal = getTotalPrice();
    const globalDiscountAmount = getGlobalDiscountAmount();
    return subtotal - globalDiscountAmount;
  };

  // Get global discount info
  const getGlobalDiscountInfo = () => {
    if (!restaurant?.globalDiscount?.enabled || restaurant?.globalDiscount?.percentage <= 0) {
      return null;
    }
    
    return {
      enabled: restaurant.globalDiscount.enabled,
      percentage: restaurant.globalDiscount.percentage,
      amount: getGlobalDiscountAmount()
    };
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getTotalQtyInCartForMenu,
    getMaxQuantityForMenu,
    getGlobalDiscountAmount,
    getTotalPriceWithGlobalDiscount,
    getGlobalDiscountInfo,
    isCartOpen,
    setIsCartOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
