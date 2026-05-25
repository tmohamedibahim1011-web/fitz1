import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import axios from 'axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="bg-primary-white min-h-screen pt-32 pb-24">
      {/* Header */}
      <header className="container mx-auto px-6 mb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-primary-text uppercase tracking-tighter mb-6" style={{ fontFamily: "'Outfit', sans-serif" }}>
            THE PRO COLLECTION
          </h1>
          <p className="text-secondary-text max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            We don't make a hundred mediocre products. We make two perfect ones. 
            Engineered for stability, handcrafted for elegance.
          </p>
        </motion.div>
      </header>

      <div className="container mx-auto px-6 max-w-5xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-luxury-gold" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            {products.map((product, index) => (
              <ProductCard key={product._id} product={product} index={index} />
            ))}
          </div>
        )}
        
        {!isLoading && products.length > 0 && (
          <div className="mt-24 text-center border-t border-black/10 pt-16">
            <p className="text-sm font-bold uppercase tracking-widest text-primary-text mb-4">Why only two models?</p>
            <p className="text-secondary-text max-w-2xl mx-auto italic font-light">
              "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away." 
              We focused all our engineering on creating the ultimate standard parallette and its travel-friendly counterpart.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
