import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShoppingBag, X, Check, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

import regularnatural from '../assets/products/regularnatural.webp';
import regularblack from '../assets/products/regularblack.webp';
import mininatural from '../assets/products/mininatural.webp';
import miniblack from '../assets/products/miniblack.webp';

const DEFAULT_COLORS = [
  { id: 'natural', name: 'Natural Finish', hex: '#D7CCC8', priceOffset: 0, image: '', hoverImage: '' },
  { id: 'black', name: 'Shadow Black', hex: '#1C1C1C', priceOffset: 100, image: '', hoverImage: '' },
];

const ProductCard = ({ product, index }) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const { addToCart } = useCart();

  const productId = product._id || product.id;
  const isOutOfStock = product.stock !== undefined && product.stock < 1;
  const showLowStock = product.stock !== undefined && product.stock > 0 && product.stock <= 10;
  const colors = product.colors && product.colors.length > 0 ? product.colors : DEFAULT_COLORS;
  const basePrice = product.basePrice || 0;

  // Get image based on selected color
  const getProductImage = () => {
    const isMini = product?.name?.toLowerCase().includes('mini');
    const isBlack = (selectedColor && selectedColor.id === 'black') || 
                    (!selectedColor && colors[0]?.id === 'black');
    
    if (isMini && isBlack) return miniblack;
    if (isMini && !isBlack) return mininatural;
    if (!isMini && isBlack) return regularblack;
    if (!isMini && !isBlack) return regularnatural;

    if (selectedColor && selectedColor.image) {
      return selectedColor.image;
    }
    return product.colors?.[0]?.image || product.image || '';
  };

  const getHoverImage = () => {
    if (selectedColor && selectedColor.hoverImage) {
      return selectedColor.hoverImage;
    }
    return product.colors?.[0]?.hoverImage || product.hoverImage || '';
  };

  const handleColorSelect = (color, idx) => {
    setSelectedColor(color);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!selectedColor) {
      toast.error('Please select a finish first.');
      return;
    }

    if (product.stock !== undefined && product.stock < 1) {
      toast.error('This product is out of stock.');
      return;
    }

    const finalPrice = basePrice + (selectedColor.priceOffset || 0);
    const imageToUse = getProductImage();

    addToCart(
      {
        id: productId,
        name: product.name,
        price: basePrice,
        image: imageToUse
      },
      1,
      { id: selectedColor.id, name: selectedColor.name, priceOffset: selectedColor.priceOffset }
    );
    
    toast.success(`${product.name} (${selectedColor.name}) added to cart!`);
    setShowQuickAdd(false);
    setSelectedColor(null);
  };

  const openQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickAdd(true);
    // Set first color as default
    if (!selectedColor && colors.length > 0) {
      setSelectedColor(colors[0]);
    }
  };

  const closeQuickAdd = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowQuickAdd(false);
    setSelectedColor(null);
  };

  const currentPrice = basePrice + (selectedColor?.priceOffset || 0);
  const currentImage = getProductImage();
  const hoverImage = getHoverImage(); // we can leave hoverImage as is, though the user might not even use it
  const objectPos = product?.name?.toLowerCase().includes('mini') ? 'center' : 'center 48%';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group flex flex-col h-full bg-white border border-black/5 hover:border-luxury-gold/30 transition-colors duration-300 relative"
    >
      {(product.badge || showLowStock || isOutOfStock) && (
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {product.badge && !isOutOfStock && (
            <span className="bg-primary-text text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              {product.badge}
            </span>
          )}
          {showLowStock && !isOutOfStock && (
            <span className="bg-luxury-gold text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1">
              <AlertTriangle size={10} />
              Only {product.stock} left
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
              OUT OF STOCK
            </span>
          )}
        </div>
      )}
      
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary-white block">
        <Link to={`/product/${productId}`} className="absolute inset-0 z-10 block">
          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
          
          <img
            src={currentImage}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 ease-out scale-110 group-hover:scale-115"
            style={{ objectPosition: objectPos }}
          />
          
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${product.name} alternate`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transform transition-all duration-700 ease-out scale-110 group-hover:scale-115"
              style={{ objectPosition: objectPos }}
            />
          )}
        </Link>

        {/* Quick Add Overlay */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-primary-text">Select Finish</span>
                <button onClick={closeQuickAdd} className="text-secondary-text hover:text-luxury-gold">
                  <X size={20} />
                </button>
              </div>

              {/* Color Preview Image */}
              <div className="relative aspect-[4/5] mb-4 rounded-lg overflow-hidden bg-secondary-white">
                <img
                  src={currentImage}
                  alt={product.name}
                  loading="lazy"
                  className="w-full h-full object-cover transform scale-110"
                  style={{ objectPosition: objectPos }}
                />
                {selectedColor && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 text-xs font-bold z-10">
                    {selectedColor.name}
                  </div>
                )}
              </div>

              {/* Color Selection */}
              <div className="mb-4">
                <div className="flex gap-3 justify-center">
                  {colors.map((color, idx) => (
                    <button
                      key={color.id || idx}
                      onClick={() => handleColorSelect(color, idx)}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor?.id === color.id ? 'border-luxury-gold scale-110' : 'border-gray-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor?.id === color.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check size={16} className="text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mt-auto">
                <div className="flex justify-between items-center mb-3 text-xs">
                  <span className="text-secondary-text">Base: Rs. {basePrice}</span>
                  {selectedColor?.priceOffset > 0 && (
                    <span className="text-luxury-gold">+Rs. {selectedColor.priceOffset}</span>
                  )}
                </div>
                <button 
                  onClick={handleQuickAdd}
                  disabled={!selectedColor || isOutOfStock}
                  className="w-full bg-primary-text text-white py-3 text-sm font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingBag size={16} />
                  {isOutOfStock ? 'Sold Out' : `Add - Rs. ${currentPrice.toLocaleString()}`}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Add Button (when not showing overlay) */}
        {!showQuickAdd && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button 
              onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); toast.error('Out of stock'); } : openQuickAdd}
              disabled={isOutOfStock}
              className="w-full bg-primary-text text-white py-2 text-xs font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={14} /> {isOutOfStock ? 'Sold Out' : 'Quick Add'}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-4">
          <Link to={`/product/${productId}`} className="block flex-grow">
            <h3 className="font-bold text-lg text-primary-text group-hover:text-luxury-gold line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <span className="font-medium text-primary-text flex-shrink-0 text-right">Rs. {basePrice.toLocaleString()}</span>
        </div>
        
        <p className="text-secondary-text text-sm mb-3">{product.material}</p>
        
        <div className="mt-auto flex items-center justify-between mb-3">
          <div className="flex gap-1">
            {colors.map((color, idx) => (
              <button
                key={color.id || idx}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); openQuickAdd(e); handleColorSelect(color, idx); }}
                className={`w-5 h-5 rounded-full border ${selectedColor?.id === color.id ? 'border-luxury-gold ring-1 ring-luxury-gold' : 'border-gray-300'}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-1 text-luxury-gold">
            {[...Array(5)].map((_, i) => (
              <Star key={i} fill="currentColor" size={12} className={i >= (product.rating || 5) ? 'text-gray-300' : ''} />
            ))}
            <span className="text-secondary-text text-xs ml-1">({product.reviewCount || 0})</span>
          </div>
        </div>

        <button 
          onClick={isOutOfStock ? (e) => { e.preventDefault(); e.stopPropagation(); toast.error('Out of stock'); } : openQuickAdd}
          disabled={isOutOfStock}
          className="w-full bg-primary-text text-white py-2 text-xs font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;