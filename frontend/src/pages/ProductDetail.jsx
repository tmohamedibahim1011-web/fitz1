import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ChevronDown, Check, Shield, Truck, RotateCcw, Loader2, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import regularDim from '../assets/dimension/regualr.jpeg';
import miniDim from '../assets/dimension/min.jpeg';

const DEFAULT_COLORS = [
  { id: 'natural', name: 'Natural Finish', hex: '#D7CCC8', priceOffset: 0 },
  { id: 'black', name: 'Shadow Black', hex: '#1C1C1C', priceOffset: 100 },
];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);
        if (res.data.success) {
          setProduct(res.data.product);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const colors = product?.colors || DEFAULT_COLORS;
  const showLowStock = product?.stock !== undefined && product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product?.stock !== undefined && product.stock < 1;

  const handleAddToCart = () => {
    if (!selectedColor) {
      toast.error('Please select a finish before adding to cart.');
      return;
    }

    if (isOutOfStock) {
      toast.error('This product is out of stock.');
      return;
    }

    setIsAdding(true);
    addToCart(
      {
        id: product._id,
        name: product.name,
        price: product.basePrice,
        image: currentImage
      },
      quantity,
      { id: selectedColor.id, name: selectedColor.name, priceOffset: selectedColor.priceOffset }
    );
    setTimeout(() => {
      setIsAdding(false);
      toast.success('Added to your cart');
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="bg-primary-white min-h-screen pt-24 pb-32 flex items-center justify-center">
        <Loader2 className="animate-spin text-luxury-gold" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-primary-white min-h-screen pt-24 pb-32 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-text mb-4">Product Not Found</h2>
          <p className="text-secondary-text">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const currentImage = selectedColor?.image || product.colors?.[0]?.image || product.image || '';
  const currentHoverImage = selectedColor?.hoverImage || product.colors?.[0]?.hoverImage || product.hoverImage || '';
  const dimensionImg = product.size === 'mini' ? miniDim : regularDim;
  const images = [currentImage, currentHoverImage, dimensionImg].filter(Boolean);
  const isDimensionImgActive = images[activeImage] === dimensionImg;
  const currentPrice = (product.basePrice || 0) + (selectedColor?.priceOffset || 0);
  const isNatural = selectedColor?.id === 'natural';
  const isBlack = selectedColor?.id === 'black';
  const yOffset = isDimensionImgActive 
    ? 0 
    : isNatural 
      ? '4.5%' 
      : isBlack 
        ? '-4.5%' 
        : 0;

  return (
    <div className="bg-primary-white min-h-screen pt-24 pb-32">
      <div className="container mx-auto px-6">
        {showLowStock && !isOutOfStock && (
          <div className="mb-6 bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2 text-red-700 text-sm font-medium">
            <AlertTriangle size={16} />
            Only {product.stock} items left in stock!
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* IMAGE GALLERY */}
          <div className="w-full lg:w-3/5 lg:sticky lg:top-24">
            <div className="flex flex-col-reverse md:flex-row gap-4">
              <div className="flex md:flex-col gap-4 md:w-24 overflow-x-auto md:overflow-visible no-scrollbar">
                {images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square flex-shrink-0 w-20 md:w-full overflow-hidden transition-all duration-300 ${activeImage === idx ? 'ring-2 ring-luxury-gold ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="relative aspect-square md:aspect-[4/5] flex-grow bg-secondary-white overflow-hidden cursor-zoom-in group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0, scale: 1.15, y: yOffset }}
                    animate={{ opacity: 1, scale: 1.1, y: yOffset }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    src={images[activeImage] || currentImage}
                    alt={product.name}
                    className={`w-full h-full group-hover:scale-115 transition-transform duration-700 ease-out origin-center ${isDimensionImgActive ? 'object-contain bg-white p-6 md:p-8' : 'object-cover'}`}
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="w-full lg:w-2/5">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {(product.badge || showLowStock || isOutOfStock) && (
                  <div className="flex gap-2 mb-4">
                    {product.badge && !isOutOfStock && (
                      <span className="bg-primary-text text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                        {product.badge}
                      </span>
                    )}
                    {showLowStock && !isOutOfStock && (
                      <span className="bg-luxury-gold text-white px-3 py-1 text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                        <AlertTriangle size={12} /> Only {product.stock} left
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="bg-red-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
                        OUT OF STOCK
                      </span>
                    )}
                  </div>
                )}
                <div className="mb-8 border-b border-black/10 pb-8">
                 <h1 className="text-3xl md:text-5xl font-bold text-primary-text uppercase tracking-tighter mb-4" style={{ fontFamily: "'Unbounded', sans-serif" }}>
                   {product.name}
                 </h1>
                <div className="text-2xl font-medium text-primary-text flex items-center gap-4">
                  <span>Rs. {currentPrice.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-secondary-text mb-10 leading-relaxed font-light">
                {product.description}
              </p>

              {/* COLORS */}
              <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary-text">
                    Select Finish <span className="text-red-500">*</span>
                  </h3>
                  <span className="text-xs font-medium text-secondary-text">{selectedColor ? selectedColor.name : 'None selected'}</span>
                </div>
                <div className="flex gap-4">
                  {colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      disabled={isOutOfStock}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                        ${selectedColor?.id === color.id ? 'border-luxury-gold scale-110' : 'border-transparent hover:scale-105'}
                        ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      style={{ padding: '2px' }}
                    >
                      <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: color.hex }}></div>
                      {selectedColor?.id === color.id && (
                        <motion.div layoutId="color-check" className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference">
                          <Check size={16} />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <div className="flex items-center justify-between border border-black/10 sm:w-1/3 py-4 px-4 bg-white">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-secondary-text hover:text-primary-text transition-colors"><Minus size={18} /></button>
                  <span className="font-bold text-primary-text">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="text-secondary-text hover:text-primary-text transition-colors"><Plus size={18} /></button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className={`flex-grow text-white py-4 font-bold uppercase tracking-widest text-sm transition-colors relative overflow-hidden
                    ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-text hover:bg-luxury-gold'}`}
                >
                  <AnimatePresence mode="wait">
                    {isAdding ? (
                      <motion.div key="adding" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center justify-center gap-2">
                        <Check size={18} /> Added
                      </motion.div>
                    ) : isOutOfStock ? (
                      <motion.div key="outofstock" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                        Out of Stock
                      </motion.div>
                    ) : (
                      <motion.div key="add" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}>
                        Add to Cart - Rs. {(currentPrice * quantity).toLocaleString()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* FEATURES ICONS */}
              <div className="grid grid-cols-2 gap-4 mb-12 py-6 border-y border-black/10">
                <div className="flex flex-col items-center text-center gap-2">
                  <Truck size={24} className="text-luxury-gold" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Tamil Nadu<br/>Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                  <Shield size={24} className="text-luxury-gold" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-widest text-secondary-text font-bold">Damaged Parcel<br/>Full Replacement</span>
                </div>
              </div>

              {/* ACCORDION */}
              <div className="space-y-1">
                {[
                  { 
                    title: 'Dimensions & Specs', 
                    content: (
                      <div className="space-y-4">
                        {product.features && product.features.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-2 mb-4">
                            {product.features.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        ) : (
                          <p className="mb-4 text-xs font-light text-secondary-text">Standard specifications apply. Precise blueprint dimensions shown below:</p>
                        )}
                        <div className="mt-4 border border-black/5 rounded-2xl overflow-hidden bg-secondary-white max-w-sm mx-auto shadow-sm">
                          <div className="bg-white px-4 py-2 border-b border-black/5 flex justify-between items-center">
                            <span className="text-[9px] uppercase tracking-widest text-secondary-text font-bold">Dimension Guide</span>
                            <span className="text-[9px] uppercase tracking-widest text-luxury-gold font-bold">{product.size === 'mini' ? 'Mini Parallettes' : 'Pro Series'}</span>
                          </div>
                          <img 
                            src={product.size === 'mini' ? miniDim : regularDim} 
                            alt={`${product.name} Dimensions`} 
                            className="w-full h-auto object-contain bg-white hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </div>
                    )
                  },
                  { 
                    title: 'Shipping Policy', 
                    content: (
                      <div className="space-y-4">
                        <p><strong>Processing / Crafting Time:</strong> Orders are handmade after you place them. It takes about 4-5 working days to make and pack. It may take a little longer during festivals or holidays.</p>
                        <p><strong>Delivery Time (After Dispatch):</strong></p>
                        <ul className="list-disc pl-5">
                          <li>Tamil Nadu: 2-3 working days (may take longer in remote areas).</li>
                          <li>Other States: 4-5 working days (may take longer in remote areas).</li>
                        </ul>
                        <p><strong>Shipping Charges:</strong> No shipping charge within Tamil Nadu.</p>
                      </div>
                    )
                  },
                  { title: 'Wood Care', content: 'Wipe with a slightly damp cloth after use. Store in a dry place. We recommend oiling every 6 months to maintain the premium finish.' }
                ].map((item, idx) => (
                  <div key={idx} className="border-b border-black/10 overflow-hidden">
                    <button 
                      onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                      className="w-full py-5 flex justify-between items-center text-left"
                    >
                      <span className="text-sm font-bold uppercase tracking-widest text-primary-text">{item.title}</span>
                      <motion.div animate={{ rotate: activeAccordion === idx ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown size={18} />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {activeAccordion === idx && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                          <div className="pb-5 text-sm text-secondary-text font-light leading-relaxed">
                            {item.content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
