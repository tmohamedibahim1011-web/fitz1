import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { ShieldCheck, Loader2, Check, X, MapPin, User, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  "Tamil Nadu",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman & Nicobar Islands",
  "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu",
  "Delhi",
  "Lakshadweep",
  "Puducherry",
  "Ladakh"
];

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const [formData, setFormData] = useState({
    email: '', phone: '', firstName: '', lastName: '',
    address: '', city: '', state: '', zip: ''
  });

  const isTamilNadu = formData.state.toLowerCase().trim() === 'tamil nadu' || formData.state.toLowerCase().trim() === 'tn';
  
  const getShippingCost = () => {
    // Default to Free Shipping if no state is entered yet
    if (!formData.state.trim()) return 0;
    
    if (isTamilNadu) return 0;
    
    // Check if any item is "Mini" product
    const hasMini = cartItems.some(item => 
      item.name.toLowerCase().includes('mini')
    );
    return hasMini ? 50 : 100;
  };
  
  const shipping = getShippingCost();
  const finalTotal = cartTotal + shipping;

  const handleContinue = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

  const processPayment = async () => {
    setShowConfirmModal(false);
    setIsProcessing(true);
    
    try {
      // 1. Create Order & Payment Intent
      const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/orders/create-with-payment`, {
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          method: shipping === 0 ? 'Free Shipping' : (shipping === 50 ? 'Mini Shipping (Rs.50)' : 'Standard Shipping (Rs.100)')
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          color: item.variant?.name || 'Standard',
          price: item.price + (item.variant?.priceOffset || 0),
          quantity: item.quantity
        })),
        totalAmount: finalTotal
      });

      if (!orderRes.data.success) {
        throw new Error('Failed to create order');
      }

      const { razorpayOrderId, keyId, order } = orderRes.data;

      // 2. Open Razorpay
      const options = {
        key: keyId, // Received from backend or fallback
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        name: 'Fitzone',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            // Verify payment
            await axios.post(`${import.meta.env.VITE_API_URL}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: order._id
            });

            toast.success('Order placed successfully!');
            clearCart();
            navigate('/success', { state: { orderId: order.orderId } });
          } catch (err) {
            toast.error('Payment verified but issue with server. Your order is placed.');
            clearCart();
            navigate('/success', { state: { orderId: order.orderId } });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#B8860B'
        }
      };

      if (window.Razorpay) {
        const razorpayCheckout = new window.Razorpay(options);
        razorpayCheckout.open();
        razorpayCheckout.on('payment.failed', () => {
          toast.error('Payment failed. Please try again.');
          setIsProcessing(false);
        });
      } else {
        // Fallback for test mode without Razorpay library
        toast.success('Order placed in test mode!');
        clearCart();
        navigate('/success', { state: { orderId: order.orderId } });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Could not initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const createOrderDirect = async () => {
    try {
      const orderRes = await axios.post(`${import.meta.env.VITE_API_URL}/orders/create`, {
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          method: shipping === 0 ? 'Free Shipping' : (shipping === 50 ? 'Mini Shipping (Rs.50)' : 'Standard Shipping (Rs.100)')
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          color: item.variant?.name || 'Standard',
          price: item.price + (item.variant?.priceOffset || 0),
          quantity: item.quantity
        })),
        totalAmount: finalTotal,
        paymentStatus: 'pending'
      });

      if (orderRes.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate('/success', { state: { orderId: orderRes.data.order.orderId } });
      }
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-primary-white min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold uppercase tracking-widest text-primary-text mb-2" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Checkout
          </h1>
          <p className="text-secondary-text text-sm">Complete your order</p>
        </header>

        {/* Order Summary Sidebar - Shown above form */}
        <div className="bg-secondary-white p-6 border border-black/5 mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary-text mb-4">Order Summary</h2>
          <div className="space-y-3 max-h-[30vh] overflow-y-auto">
            {cartItems.map((item) => {
              const itemPrice = item.variant ? item.price + item.variant.priceOffset : item.price;
              return (
                <div key={`${item.id}-${item.variant?.id}`} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                    <div>
                      <p className="font-bold text-sm text-primary-text">{item.name}</p>
                      <p className="text-xs text-secondary-text">{item.variant?.name || 'Standard'} x {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium text-sm">Rs. {(itemPrice * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-black/10 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-secondary-text">Subtotal</span>
              <span>Rs. {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-secondary-text">Shipping</span>
              <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                {shipping === 0 ? 'Free' : `Rs. ${shipping}`}
              </span>
            </div>
            {shipping === 0 && !formData.state.trim() && (
              <p className="text-[11px] text-secondary-text text-right -mt-1 italic">
                Free shipping in Tamil Nadu. Other states calculated upon entering address.
              </p>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-black/5">
              <span>Total</span>
              <span className="text-luxury-gold">Rs. {finalTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Contact & Shipping Form */}
        <form onSubmit={handleContinue} className="space-y-8">
          {/* Contact Info */}
          <div className="bg-white p-6 border border-black/10">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <User size={20} className="text-luxury-gold" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">First Name *</label>
                <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required className="w-full bg-secondary-white border border-black/10 p-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="John" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">Last Name *</label>
                <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required className="w-full bg-secondary-white border border-black/10 p-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="Doe" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full bg-secondary-white border border-black/10 p-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">Phone *</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} required pattern="[0-9]{10}" maxLength="10" className="w-full bg-secondary-white border border-black/10 p-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="1234567890" />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 border border-black/10">
            <h2 className="text-lg font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
              <Home size={20} className="text-luxury-gold" /> Shipping Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">Address *</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required className="w-full bg-secondary-white border border-black/10 p-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="123 Street, Area" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">City *</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} required className="w-full bg-secondary-white border border-black/10 p-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="Chennai" />
                </div>
                 <div>
                  <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">State *</label>
                  <select 
                    value={formData.state} 
                    onChange={(e) => setFormData({...formData, state: e.target.value})} 
                    required 
                    className="w-full bg-secondary-white border border-black/10 p-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">Zip Code *</label>
                  <input type="text" value={formData.zip} onChange={(e) => setFormData({...formData, zip: e.target.value})} required className="w-full bg-secondary-white border border-black/10 p-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="600001" />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary-text text-white py-5 font-bold uppercase tracking-widest text-lg hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2"
          >
            Review Order - Rs. {finalTotal.toLocaleString()}
          </button>
        </form>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-fit max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-5 border-b border-black/10 flex justify-between items-center bg-luxury-gold/5">
                <h2 className="text-lg font-bold uppercase tracking-widest text-primary-text">Confirm Order</h2>
                <button onClick={handleCloseModal} className="text-secondary-text hover:text-primary-text">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
                {/* Customer Info */}
                <div className="bg-secondary-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-luxury-gold" />
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary-text">Customer</span>
                  </div>
                  <p className="font-bold text-primary-text">{formData.firstName} {formData.lastName}</p>
                  <p className="text-sm text-secondary-text">{formData.email} | {formData.phone}</p>
                </div>

                {/* Shipping */}
                <div className="bg-secondary-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-luxury-gold" />
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary-text">Shipping To</span>
                  </div>
                  <p className="text-primary-text">{formData.address}</p>
                  <p className="text-sm text-secondary-text">{formData.city}, {formData.state} - {formData.zip}</p>
                </div>

                {/* Items */}
                <div className="bg-secondary-white p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-secondary-text">Items</span>
                  </div>
                  <div className="space-y-2">
                    {cartItems.map((item) => {
                      const itemPrice = item.variant ? item.price + item.variant.priceOffset : item.price;
                      return (
                        <div key={`${item.id}-${item.variant?.id}`} className="flex justify-between text-sm">
                          <span className="text-primary-text">{item.name} ({item.variant?.name}) x {item.quantity}</span>
                          <span className="font-medium">Rs. {(itemPrice * item.quantity).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total */}
                <div className="border border-black/10 rounded-lg p-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-secondary-text">Subtotal</span>
                    <span>Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-secondary-text">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'Free' : `Rs. ${shipping}`}
                    </span>
                  </div>
                  <div className="border-t border-black/10 pt-2 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-xl font-bold text-luxury-gold">Rs. {finalTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-black/10 bg-secondary-white/50 flex gap-3">
                <button 
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-black/10 text-sm font-bold uppercase tracking-widest text-secondary-text hover:bg-white transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-luxury-gold text-white text-sm font-bold uppercase tracking-widest hover:bg-luxury-gold/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin" size={16} /> Processing...</>
                  ) : (
                    <>Pay Rs. {finalTotal.toLocaleString()}</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;