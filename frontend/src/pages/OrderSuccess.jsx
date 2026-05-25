import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Check, ArrowRight, Package, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Confetti = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#C9A84C', '#E8D39E', '#1A1A1A', '#FAFAF8'];
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20 - Math.random() * 50,
      size: Math.random() * 10 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ 
            left: `${p.x}%`, 
            top: `${p.y}%`, 
            width: p.size, 
            height: p.size, 
            backgroundColor: p.color,
            boxShadow: p.color === '#C9A84C' ? '0 0 10px rgba(201,168,76,0.5)' : 'none'
          }}
          animate={{
            y: ['0vh', '120vh'],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            x: p.x + (Math.random() * 20 - 10) + '%',
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
            repeat: Infinity
          }}
        />
      ))}
    </div>
  );
};

const OrderSuccess = () => {
  const { clearCart } = useCart();
  const location = useLocation();
  const orderId = location.state?.orderId || 'N/A';

  useEffect(() => {
    clearCart();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-primary-white min-h-screen pt-32 pb-32 relative overflow-hidden flex items-center justify-center">
      <Confetti />
      
      <div className="container mx-auto px-6 max-w-3xl relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
          className="w-24 h-24 bg-luxury-gold text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(201,168,76,0.4)]"
        >
          <Check size={48} strokeWidth={3} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold uppercase tracking-tighter text-primary-text mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Order Confirmed
          </h1>
          <p className="text-secondary-text text-lg max-w-md mx-auto mb-12">
            Thank you for your purchase. Your handcrafted equipment is being prepared for shipment.
          </p>

          <div className="bg-white border border-black/10 p-8 max-w-lg mx-auto text-left relative overflow-hidden group hover:border-luxury-gold/30 transition-colors mb-12">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <Package size={120} />
            </div>
            
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary-text mb-6 border-b border-black/10 pb-4">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-secondary-text text-sm">Order Number</span>
                <span className="font-bold font-mono text-sm text-luxury-gold">{orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text text-sm">Date</span>
                <span className="font-bold text-sm">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text text-sm">Payment Status</span>
                <span className="font-bold text-sm text-green-600">Paid</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-black/10">
              <p className="text-xs text-secondary-text mb-2">Track your order using:</p>
              <p className="font-bold text-sm">Your Order Number: <span className="text-luxury-gold">{orderId}</span></p>
              <p className="text-xs text-secondary-text mt-2">Or call us with your phone number</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/track"
              className="inline-flex items-center gap-2 bg-luxury-gold text-white px-10 py-5 font-bold uppercase tracking-widest text-sm hover:bg-luxury-gold/90 transition-colors"
            >
              <MapPin size={16} /> Track Order
            </Link>
            <Link 
              to="/products"
              className="inline-flex items-center gap-2 bg-primary-text text-white px-10 py-5 font-bold uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors"
            >
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;