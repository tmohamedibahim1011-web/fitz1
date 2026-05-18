import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Truck, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const [trackingId, setTrackingId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [orders, setOrders] = useState([]);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    
    setIsSearching(true);
    setOrders([]);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/track/${trackingId}`);
      if (res.data.success && res.data.orders) {
        setOrders(res.data.orders);
        if (res.data.orders.length === 0) {
          toast.error('No orders found');
        }
      } else {
        toast.error('No orders found');
      }
    } catch (error) {
      toast.error('No orders found');
    } finally {
      setIsSearching(false);
    }
  };

  const statusSteps = [
    { id: 'processing', label: 'Order Confirmed', icon: Package },
    { id: 'packing', label: 'Packing', icon: Package },
    { id: 'shipping', label: 'On Delivery', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const getStepIndex = (status) => {
    return statusSteps.findIndex(s => s.id === status);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'processing': return 'bg-yellow-500';
      case 'packing': return 'bg-blue-500';
      case 'shipping': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-primary-white min-h-screen pt-32 pb-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-primary-text mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
            Track Your Order
          </h1>
          <p className="text-secondary-text text-sm md:text-base">
            Enter your order number (e.g., FZ1-001-20260516) or phone number to see your orders.
          </p>
        </div>

        <div className="bg-white border border-black/10 p-8 md:p-12 mb-12 shadow-sm">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <input 
                type="text" 
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                placeholder="Order Number or Phone" 
                className="w-full bg-secondary-white border border-transparent focus:border-luxury-gold focus:bg-white transition-colors p-4 pl-12 text-sm outline-none"
              />
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
            </div>
            <button 
              type="submit" 
              disabled={isSearching}
              className="bg-primary-text text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors disabled:opacity-80 flex justify-center items-center md:w-auto w-full min-w-[160px]"
            >
              {isSearching ? <Loader2 size={20} className="animate-spin" /> : 'Track'}
            </button>
          </form>
        </div>

        <AnimatePresence>
          {orders.length > 0 && (
            <div className="space-y-8">
              {orders.map((order, idx) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white border border-black/10 p-8 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-black/10 pb-6 gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-1">Order Number</p>
                      <h3 className="text-2xl font-bold font-mono text-luxury-gold">{order.orderId}</h3>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs font-bold uppercase tracking-widest text-secondary-text mb-1">Order Date</p>
                      <p className="font-bold text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mb-10 relative">
                    <div className="absolute top-6 left-0 w-full h-[2px] bg-gray-200 z-0"></div>
                    <div className="absolute top-6 left-0 h-[2px] bg-luxury-gold z-10 transition-all" 
                         style={{ width: `${(getStepIndex(order.status) / (statusSteps.length - 1)) * 100}%` }}></div>
                    <div className="flex justify-between relative z-20">
                      {statusSteps.map((step, idx) => {
                        const isActive = getStepIndex(order.status) >= idx;
                        const Icon = step.icon;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActive ? getStatusColor(order.status) + ' text-white' : 'bg-gray-100 text-gray-400'}`}>
                              <Icon size={20} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-primary-text' : 'text-gray-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary-text mb-4 border-b border-black/10 pb-2">Items</h4>
                      <div className="space-y-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-sm text-primary-text">{item.name}</p>
                              <p className="text-xs text-secondary-text">{item.color} × {item.quantity}</p>
                            </div>
                            <span className="font-bold text-sm">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-black/10 flex justify-between items-center">
                        <span className="font-bold uppercase">Total</span>
                        <span className="text-xl font-bold text-luxury-gold">Rs. {order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-primary-text mb-4 border-b border-black/10 pb-2">Shipping</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-primary-text">{order.shippingAddress?.address}</p>
                        <p className="text-sm text-secondary-text">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">{order.shippingAddress?.method}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderTracking;