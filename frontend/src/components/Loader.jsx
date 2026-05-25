import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/fitz1.png';

const Loader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          <div className="relative flex flex-col items-center">
            {/* Dim ghost logo (background layer) */}
            <div className="relative">
              <img
                src={logo}
                alt=""
                aria-hidden="true"
                className="h-16 md:h-24 w-auto opacity-[0.12]"
                style={{ filter: 'brightness(0) invert(1)' }}
              />

              {/* Animated fill logo (clip-path reveal from bottom) */}
              <motion.div
                initial={{ clipPath: 'inset(100% 0 0 0)' }}
                animate={{ clipPath: 'inset(0% 0 0 0)' }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <img
                  src={logo}
                  alt="FITZ1"
                  className="h-16 md:h-24 w-auto"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </motion.div>

              {/* Gold underline */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
                className="absolute -bottom-4 left-0 w-full h-[2px] bg-luxury-gold origin-left"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
