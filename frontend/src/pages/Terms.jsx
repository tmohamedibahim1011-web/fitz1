import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="bg-primary-white min-h-screen pt-32 pb-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-primary-text mb-12" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Terms & Conditions
          </h1>
          
          <div className="space-y-8 text-secondary-text leading-relaxed font-light">
            <section>
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text mb-4">1. General Overview</h2>
              <p>Welcome to FITZONE. By accessing our website and purchasing our products, you agree to be bound by these Terms and Conditions. Our products are designed for professional and advanced athletic use.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text mb-4">2. Product Information & Usage</h2>
              <p>Our parallettes are crafted from premium hardwood. While they are engineered to support up to 350kg per pair, they must be used on flat, stable, non-slip surfaces. FITZONE is not liable for injuries resulting from improper use.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text mb-4">3. Orders & Payment</h2>
              <p>All prices are subject to change without notice. We reserve the right to refuse or cancel any order for any reason, including limitations on quantities available for purchase, inaccuracies, or errors in product or pricing information.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text mb-4">4. Shipping & Replacement Policy</h2>
              <p>We do not offer standard returns or refunds. However, if your parcel arrives damaged during transit, we provide a full replacement. Please inspect your parcel upon delivery and notify us immediately with proof of damage (unboxing video or photos) within 24 hours of receipt.</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
