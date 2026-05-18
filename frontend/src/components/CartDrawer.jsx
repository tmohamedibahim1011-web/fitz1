import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[450px] bg-white/95 backdrop-blur-xl border-l border-black/10 shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-black/10">
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text flex items-center gap-2" style={{ fontFamily: 'var(--font-bebas)' }}>
                <ShoppingBag size={20} /> Your Cart
              </h2>
              <button 
                onClick={closeCart}
                className="text-secondary-text hover:text-luxury-gold transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-6 scrollbar-hide">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-secondary-white flex items-center justify-center text-secondary-text mb-4">
                    <ShoppingBag size={40} strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-widest text-primary-text">Your cart is empty</h3>
                  <p className="text-secondary-text text-sm mb-8">Looks like you haven't added anything yet.</p>
                  <button 
                    onClick={closeCart}
                    className="px-8 py-4 bg-primary-text text-white text-sm font-bold uppercase tracking-widest hover:bg-luxury-gold transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {cartItems.map((item) => {
                      const itemPrice = item.variant ? item.price + item.variant.priceOffset : item.price;
                      return (
                        <motion.div 
                          key={`${item.id}-${item.variant?.id || 'default'}`}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex gap-4 bg-secondary-white/50 p-4 relative"
                        >
                          <div className="w-24 h-24 bg-white flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          
                          <div className="flex-grow flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-bold text-primary-text text-sm leading-tight">{item.name}</h4>
                                {item.variant && <p className="text-xs text-secondary-text mt-1">{item.variant.name}</p>}
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id, item.variant?.id)}
                                className="text-secondary-text hover:text-red-500 transition-colors"
                                title="Remove item"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            
                            <div className="flex justify-between items-end mt-4">
                              <div className="flex items-center border border-black/10 bg-white">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant?.id)}
                                  className="px-2 py-1 text-secondary-text hover:text-primary-text transition-colors"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant?.id)}
                                  className="px-2 py-1 text-secondary-text hover:text-primary-text transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <span className="font-bold text-primary-text text-sm">Rs. {(itemPrice * item.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-black/10 p-6 bg-white/80">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-secondary-text text-sm uppercase tracking-widest font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-primary-text">Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <p className="text-xs text-secondary-text mb-6">Shipping and taxes calculated at checkout.</p>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-primary-text text-white py-4 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Secure Checkout <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
