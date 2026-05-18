import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Mail, Phone, Check, Smartphone } from 'lucide-react';

const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  return (
    <div className="bg-primary-white min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-6">
        
        {/* HEADER */}
        <header className="mb-20 text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-primary-text mb-6" style={{ fontFamily: 'var(--font-bebas)' }}>
              GET IN TOUCH
            </h1>
            <p className="text-secondary-text">
              Have questions about our equipment, custom orders, or shipping? 
              Our team is here to help you elevate your training.
            </p>
          </motion.div>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* CONTACT INFO */}
          <div className="lg:w-1/3 space-y-12">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary-text mb-6 pb-2 border-b border-black/10">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="text-luxury-gold mt-1" size={20} />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-secondary-text mb-1 font-bold">Email</p>
                    <a href="mailto:support@fitzone.com" className="text-primary-text hover:text-luxury-gold transition-colors text-sm">support@fitzone.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="text-luxury-gold mt-1" size={20} />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-secondary-text mb-1 font-bold">Phone</p>
                    <a href="tel:+916374270471" className="text-primary-text hover:text-luxury-gold transition-colors text-sm">+91 63742 70471</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="text-luxury-gold mt-1" size={20} />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-secondary-text mb-1 font-bold">Studio</p>
                    <p className="text-primary-text text-sm leading-relaxed">
                      123 Craftsman Lane<br/>
                      Design District<br/>
                      NY 10001
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary-text mb-6 pb-2 border-b border-black/10">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 border border-black/10 flex items-center justify-center text-primary-text hover:text-luxury-gold hover:border-luxury-gold transition-colors">
                  <Smartphone size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="lg:w-2/3">
            <div className="bg-white border border-black/10 p-8 md:p-12 relative overflow-hidden">
              <AnimatePresence>
                {isSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-16 h-16 bg-luxury-gold text-white rounded-full flex items-center justify-center mb-6">
                      <Check size={32} />
                    </div>
                    <h3 className="text-2xl font-bold uppercase tracking-widest text-primary-text mb-2">Message Sent</h3>
                    <p className="text-secondary-text text-sm max-w-sm">
                      Thank you for reaching out. We will get back to you within 24 hours.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">First Name</label>
                    <input type="text" required className="w-full bg-transparent border-b border-black/20 pb-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">Last Name</label>
                    <input type="text" required className="w-full bg-transparent border-b border-black/20 pb-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="Doe" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">Email Address</label>
                  <input type="email" required className="w-full bg-transparent border-b border-black/20 pb-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm" placeholder="john@example.com" />
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">Subject</label>
                  <select required className="w-full bg-transparent border-b border-black/20 pb-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm appearance-none cursor-pointer">
                    <option value="" disabled selected>Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Status</option>
                    <option value="custom">Custom Equipment</option>
                    <option value="wholesale">Wholesale</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-widest text-secondary-text mb-2 font-bold">Message</label>
                  <textarea required rows="4" className="w-full bg-transparent border-b border-black/20 pb-3 focus:outline-none focus:border-luxury-gold transition-colors text-sm resize-none" placeholder="How can we help you?"></textarea>
                </div>
                
                <button type="submit" className="bg-primary-text text-white px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-luxury-gold transition-colors w-full md:w-auto">
                  Send Message
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
