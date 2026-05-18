import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('fitzone_cart');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fitzone_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const addToCart = (product, quantity = 1, variant = null) => {
    const variantId = variant?.id || 'default';
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && (item.variant?.id || 'default') === variantId
      );
      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity
        };
        return newItems;
      }
      return [...prev, { ...product, quantity, variant }];
    });
    openCart();
  };

  const removeFromCart = (productId, variantId = null) => {
    setCartItems(prev => {
      const vid = variantId || 'default';
      return prev.filter(item => 
        !(item.id === productId && (item.variant?.id || 'default') === vid)
      );
    });
  };

  const updateQuantity = (productId, quantity, variantId = null) => {
    if (quantity < 1) {
      removeFromCart(productId, variantId);
      return;
    }
    const vid = variantId || 'default';
    setCartItems(prev => prev.map(item => 
      item.id === productId && (item.variant?.id || 'default') === vid
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce((total, item) => {
    const itemPrice = (item.price || 0) + (item.variant?.priceOffset || 0);
    return total + (itemPrice * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
