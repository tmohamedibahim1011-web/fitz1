import { motion } from 'framer-motion';

const Privacy = () => {
  return (
    <div className="bg-primary-white min-h-screen pt-32 pb-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-primary-text mb-12" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Privacy Policy
          </h1>
          
          <div className="space-y-8 text-secondary-text leading-relaxed font-light">
            <section>
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text mb-4">1. Data Collection</h2>
              <p>We collect information you provide directly to us when you make a purchase, create an account, or contact us. This includes your name, email address, phone number, shipping address, and payment details.</p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text mb-4">2. How We Use Your Information</h2>
              <p>Your information is used exclusively to fulfill your orders, provide customer support, and, with your explicit consent, send you marketing communications regarding new product launches.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text mb-4">3. Data Security</h2>
              <p>We implement strict security measures, including SSL encryption and secure payment gateways, to maintain the safety of your personal information. We do not store your credit card details on our servers.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary-text mb-4">4. Third-Party Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties, except to trusted partners who assist us in operating our website or fulfilling your orders (e.g., shipping carriers).</p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
