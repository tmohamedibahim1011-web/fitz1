import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, MessageCircle } from 'lucide-react';

const FloatingUI = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = `${totalScroll / windowHeight}`;

      setScrollProgress(Number(scroll) * 100);
      setIsVisible(totalScroll > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[2px] bg-transparent z-[100] pointer-events-none">
        <div
          className="h-full bg-luxury-gold transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
          >
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/918072210156"
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative group"
            >
              <MessageCircle size={24} />
              {/* Tooltip */}
              <div className="absolute right-full mr-4 bg-primary-text text-white text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                Chat with us
                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-primary-text rotate-45"></div>
              </div>
            </a>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="w-12 h-12 bg-white border border-black/10 text-primary-text rounded-full flex items-center justify-center shadow-lg hover:border-luxury-gold hover:text-luxury-gold transition-colors relative group"
            >
              <ArrowUp size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingUI;
