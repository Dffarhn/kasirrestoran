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

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('restaurant_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('restaurant_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, selectedVariasi = null) => {
    setCartItems(prevItems => {
      // Create unique cart item ID berdasarkan menu ID dan variasi ID
      const cartItemId = selectedVariasi ? `${item.id}-${selectedVariasi.id}` : item.id;
      
      const existingItem = prevItems.find(cartItem => cartItem.cartItemId === cartItemId);
      
      if (existingItem) {
        return prevItems.map(cartItem =>
          cartItem.cartItemId === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Calculate total price including variasi
        const variasiPrice = selectedVariasi ? selectedVariasi.harga_tambahan : 0;
        const totalPrice = item.price + variasiPrice;
        
        // Calculate discount
        const discountPercentage = item.discount_percentage || 0;
        const discountAmount = Math.round((totalPrice * discountPercentage) / 100);
        const finalPrice = totalPrice - discountAmount;

        const newCartItem = {
          cartItemId, // Unique ID untuk cart item
          id: item.id, // Menu ID
          name: item.name,
          price: item.price, // Base price
          totalPrice: finalPrice, // Price including variasi and discount
          originalPrice: totalPrice, // Price before discount
          discountPercentage,
          discountAmount,
          quantity: 1,
          variasi_id: selectedVariasi ? selectedVariasi.id : null,
          variasi_name: selectedVariasi ? selectedVariasi.nama : null,
          variasi_price: variasiPrice,
          image: item.image,
          category: item.category
        };

        // Debug logging untuk image
        console.log('Adding to cart:', {
          itemName: item.name,
          itemImage: item.image,
          cartItemImage: newCartItem.image
        });
        
        return [...prevItems, newCartItem];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('restaurant_cart');
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
