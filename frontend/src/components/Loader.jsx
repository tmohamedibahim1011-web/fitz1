import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading sequence
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] bg-primary-text flex items-center justify-center overflow-hidden"
        >
          <div className="relative">
            {/* Outline Text */}
            <h1 
              className="text-7xl md:text-9xl font-bold uppercase tracking-tighter text-transparent" 
              style={{ 
                fontFamily: 'var(--font-bebas)',
                WebkitTextStroke: '1px rgba(255,255,255,0.2)'
              }}
            >
              FITZONE
            </h1>
            
            {/* Fill Text Animation */}
            <motion.h1
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              animate={{ clipPath: 'inset(0% 0 0 0)' }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="text-7xl md:text-9xl font-bold uppercase tracking-tighter text-white absolute top-0 left-0"
              style={{ fontFamily: 'var(--font-bebas)' }}
            >
              FITZONE
            </motion.h1>

            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute -bottom-4 left-0 w-full h-[2px] bg-luxury-gold origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
