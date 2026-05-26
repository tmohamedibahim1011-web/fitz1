import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Users, Check, Maximize2, Loader2, ArrowLeft, X } from 'lucide-react';
import axios from 'axios';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import vary from "../assets/photoshoot/vary-product.webp"
import product3d from "../assets/3dproduct.webp";
import ProductCard from '../components/ProductCard';
import natural from "../assets/products/regularnatural.webp"
import black from "../assets/products/regularblack.webp"
import mininatural from "../assets/products/mininatural.webp"
import miniblack from "../assets/products/miniblack.webp"

// Assets
import bannerImg from '../assets/banner.webp';
import processVideo from '../assets/how-its-made.mp4';

// Video Reviews — Cloudinary CDN (no local MP4 bandwidth)

// Photoshoot Images
import photo1 from '../assets/photoshoot/165547.webp';
import photo2 from '../assets/photoshoot/165549.webp';
import photo3 from '../assets/photoshoot/165554.webp';
import photo4 from '../assets/photoshoot/165557.webp';
import photo5 from '../assets/photoshoot/165560.webp';
import photo6 from '../assets/photoshoot/165564.webp';
import photo7 from '../assets/photoshoot/165566.webp';
import photo8 from '../assets/photoshoot/165568.webp';

// Review Images
import rev1 from '../assets/reviews/165581.webp';
import rev2 from '../assets/reviews/165585.webp';
import rev3 from '../assets/reviews/165587.webp';
import rev4 from '../assets/reviews/165588.webp';
import rev5 from '../assets/reviews/165591.webp';
import rev6 from '../assets/reviews/165600.webp';
import rev7 from '../assets/reviews/165601.webp';
import rev8 from '../assets/reviews/165602.webp';
import rev9 from '../assets/reviews/165606.webp';
import rev10 from '../assets/reviews/165607.webp';
import rev11 from '../assets/reviews/165611.webp';
import rev12 from '../assets/reviews/165612.webp';
import rev13 from '../assets/reviews/165614.webp';
import rev14 from '../assets/reviews/165616.webp';
import rev15 from '../assets/reviews/165617.webp';
import rev16 from '../assets/reviews/165618.webp';
import rev17 from '../assets/reviews/165619.webp';
import rev18 from '../assets/reviews/165620.webp';
import rev19 from '../assets/reviews/165621.webp';
import rev20 from '../assets/reviews/165622.webp';
import rev21 from '../assets/reviews/165623.webp';
import rev22 from '../assets/reviews/165625.webp';

const VIDEO_REVIEWS = [
  { src: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/v1779716333/video-1_qwydqo.mp4', poster: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/so_0/v1779716333/video-1_qwydqo.jpg', username: '@fitness_pro', text: "Best parallettes I've ever used!" },
  { src: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/v1779716343/video-2_gd3at4.mp4', poster: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/so_0/v1779716343/video-2_gd3at4.jpg', username: '@calisthenics_king', text: "Game changer for my training" },
  { src: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/v1779716340/video-3_fccfny.mp4', poster: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/so_0/v1779716340/video-3_fccfny.jpg', username: '@gymnast_life', text: "The grip is unbelievable" },
  { src: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/v1779716338/video-4_fboorm.mp4', poster: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/so_0/v1779716338/video-4_fboorm.jpg', username: '@athlete_mike', text: "Worth every penny" },
  { src: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/v1779716337/video-5_tzwvdr.mp4', poster: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/so_0/v1779716337/video-5_tzwvdr.jpg', username: '@coach_jones', text: "Highly recommended" },
  { src: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/v1779716340/video-6_utoffd.mp4', poster: 'https://res.cloudinary.com/dp2yxb1xu/video/upload/so_0/v1779716340/video-6_utoffd.jpg', username: '@workout_junkie', text: "Premium quality" },
];

const IMAGE_REVIEWS = [
  { id: 1, src: rev1, name: "Customer Review 1" },
  { id: 2, src: rev2, name: "Customer Review 2" },
  { id: 3, src: rev3, name: "Customer Review 3" },
  { id: 4, src: rev4, name: "Customer Review 4" },
  { id: 5, src: rev5, name: "Customer Review 5" },
  { id: 6, src: rev6, name: "Customer Review 6" },
  { id: 7, src: rev7, name: "Customer Review 7" },
  { id: 8, src: rev8, name: "Customer Review 8" },
  { id: 9, src: rev9, name: "Customer Review 9" },
  { id: 10, src: rev10, name: "Customer Review 10" },
  { id: 11, src: rev11, name: "Customer Review 11" },
  { id: 12, src: rev12, name: "Customer Review 12" },
  { id: 13, src: rev13, name: "Customer Review 13" },
  { id: 14, src: rev14, name: "Customer Review 14" },
  { id: 15, src: rev15, name: "Customer Review 15" },
  { id: 16, src: rev16, name: "Customer Review 16" },
  { id: 17, src: rev17, name: "Customer Review 17" },
  { id: 18, src: rev18, name: "Customer Review 18" },
  { id: 19, src: rev19, name: "Customer Review 19" },
  { id: 20, src: rev20, name: "Customer Review 20" },
  { id: 21, src: rev21, name: "Customer Review 21" },
  { id: 22, src: rev22, name: "Customer Review 22" },
];

const PHOTOSHOOT_GALLERY = [
  { src: photo3, title: "Premium Mahogany Body", desc: "45mm hand-sanded ergonomic handles with custom Mahogany body for absolute control." },
  { src: photo7, title: "Mahogany Finish Aesthetics", desc: "Premium Mahogany wood grain finish that elevates any room's decor." },
  { src: vary, title: "Portable Elite Training", desc: "Take your gymnastics and calisthenics training anywhere." },

  { src: photo5, title: "Rock-Solid Base Joint", desc: "CNC-milled interlocking joints for zero wobble under load." }
];


const HERO_IMAGES = [photo1, photo2, photo3];

const MASTERY_FEATURES = [
  {
    id: 0,
    title: "Wrist-Friendly Grip",
    subtitle: "Premium Ergonomic Feel",
    desc: "Tactile hand-sanded wooden handles absorb sweat and reduce joint pressure (45mm thickness for Regular parallettes; 45mm thickness for Mini parallettes) for absolute planches and static holds control.",
    label: "Grip Diameter",

  },
  {
    id: 1,
    title: "Living Room Friendly",
    subtitle: "Pure Organic Style",
    desc: "FITZ1 parallettes feature premium Mahogany wood body grains (Regular: 450mm L x 140mm W x 130mm H; Mini: 250mm L x 120mm W x 100mm H) styled to complement your home interior decor perfectly.",
    label: "Mahogany Body",

  },
  {
    id: 2,
    title: "Zero Slip Security",
    subtitle: "Floor Safe Traction",
    desc: "Outfitted with heavy-duty rubber grip pads. Enjoy absolute stability during explosive movements, L-sits, or basic fitness routines with zero sliding and zero floor scratches.",
    label: "Rubber Footing",

  },
  {
    id: 3,
    title: "CNC-Precision Solid",
    subtitle: "Wobble-Free Connection",
    desc: "Hand-finished solid Mahogany wood blocks fitted together with interlocking joints machined to 0.1mm accuracy. Supports up to 350kg with zero creaks, zero flex, and absolute safety for a lifetime.",
    label: "Interlocking Joint",

  }
];

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const scrollRef = useRef(null);
  const videoRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [isProcessVideoFading, setIsProcessVideoFading] = useState(false);

  const handleProcessVideoTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      // Fade out to black in the last 1.2 seconds of the video
      if (duration - currentTime < 1.2) {
        setIsProcessVideoFading(true);
      } else {
        setIsProcessVideoFading(false);
      }
    }
  };

  const finishes = [
    {
      id: "natural",
      name: "Regular Natural",
      image: natural,
      scale: 1.1,
      objectPosition: 'center 48%'
    },
    {
      id: "black",
      name: "Regular Shadow Black",
      image: black,
      scale: 1.1,
      objectPosition: 'center 48%'
    },
    {
      id: "mini-natural",
      name: "Mini Natural",
      image: mininatural,
      scale: 1.1,
      objectPosition: 'center 48%'
    },
    {
      id: "mini-black",
      name: "Mini Shadow Black",
      image: miniblack,
      scale: 1.1,
      objectPosition: 'center 48%'
    }
  ];

  const [isLoading, setIsLoading] = useState(true);

  // Hero slideshow interval
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Fetch products
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

  const handleWheel = (e) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  const nextReview = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === IMAGE_REVIEWS.length - 1 ? 0 : prev + 1));
  };

  const prevReview = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? IMAGE_REVIEWS.length - 1 : prev - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev === IMAGE_REVIEWS.length - 1 ? 0 : prev + 1));
      if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev === 0 ? IMAGE_REVIEWS.length - 1 : prev - 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="bg-primary-white overflow-hidden">
      {/* REDESIGNED ASYMMETRIC & IMMERSIVE HERO SECTION */}
      <section className="relative min-h-[100svh] flex flex-col lg:flex-row overflow-hidden bg-primary-white">

        {/* Background Slideshow (Fills full screen on mobile, right side on desktop) */}
        <div className="absolute inset-0 lg:left-1/2 lg:w-1/2 h-full z-0 bg-black">
          <div className="absolute inset-0 overflow-hidden">
            <AnimatePresence>
              <motion.img
                key={heroIndex}
                src={HERO_IMAGES[heroIndex]}
                alt="Premium Wooden Parallettes"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 0.9, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              />
            </AnimatePresence>

            {/* Mobile dark gradient overlay mask for high legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/95 pointer-events-none block lg:hidden z-10"></div>

            {/* Desktop split white/transparent gradient mask */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary-white pointer-events-none hidden lg:block z-10"></div>

            {/* Micro Slideshow Navigation Indicators */}
            <div className="absolute bottom-10 left-6 sm:left-12 lg:left-10 flex items-center gap-3 z-30">
              {HERO_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`h-[2px] transition-all duration-500 rounded-full cursor-pointer ${idx === heroIndex ? 'w-8 bg-luxury-gold' : 'w-3 bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Typography Content Panel (Overlays on mobile, left column on desktop) */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:pl-20 lg:pr-8 py-16 lg:py-0 relative z-20 min-h-[100svh]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="flex items-center gap-4 mb-6 sm:mb-8">
              <div className="w-12 h-[2px] bg-luxury-gold"></div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-white/70 lg:text-secondary-text text-outfit">
                Engineered for the Elite
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-white lg:text-primary-text leading-[0.9] tracking-tighter mb-8 relative text-outfit uppercase">
              DEFY<br />
              GRAVITY.
              {/* Decorative accent */}

            </h1>

            <p className="text-white/70 lg:text-secondary-text max-w-md text-xs sm:text-sm md:text-base leading-relaxed mb-12 font-light">
              We stripped away the noise to build the ultimate foundation for bodyweight mastery. Handcrafted from premium hardwood with relentless attention to detail.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link
                to="/products"
                className="group relative px-8 py-4 sm:px-10 sm:py-5 bg-primary-text text-white text-xs font-bold uppercase tracking-[0.2em] overflow-hidden w-fit text-center border border-primary-text text-outfit rounded-none"
              >
                <span className="relative z-10 flex items-center justify-center gap-4">
                  Shop Collection <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-luxury-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-[0.16,1,0.3,1]"></div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PRODUCTS SECTION (Standard Cards) */}
      <section className="py-32 bg-secondary-white relative z-20 border-y border-black/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-outfit font-extrabold text-3xl md:text-5xl uppercase tracking-tighter text-primary-text">The Pro Collection</h2>
            <p className="text-secondary-text mt-4 text-sm md:text-base">We don't make a hundred mediocre products. We make two perfect ones.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 max-w-5xl mx-auto">
            {isLoading ? (
              <div className="col-span-2 flex justify-center py-12">
                <Loader2 className="animate-spin text-luxury-gold" size={40} />
              </div>
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))
            ) : (
              <div className="col-span-2 text-center text-secondary-text py-12">No products available</div>
            )}
          </div>
        </div>
      </section>

      {/* COLOR VARIATIONS SECTION - HIGH FASHION EDITORIAL LAYOUT (Simple & Perfect 2-Column Grid) */}
      <section className="py-32 bg-[#FAFAF8] relative overflow-hidden border-b border-black/5">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-luxury-gold/5 blur-[140px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="container mx-auto px-6 max-w-5xl relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-20"
          >
            <span className="uppercase tracking-[0.35em] text-luxury-gold text-xs font-semibold block mb-4">
              Premium Selections
            </span>
            <h2
              className="text-outfit font-extrabold text-3xl md:text-5xl uppercase tracking-tighter text-primary-text leading-tight"
            >
              Available Finishes
            </h2>
            <div className="w-12 h-[2px] bg-luxury-gold mx-auto mt-6"></div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {finishes.map((finish, index) => {
              const isMini = finish.id.includes('mini');
              return (
                <motion.div
                  key={finish.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group flex flex-col h-full cursor-pointer"
                >
                  {/* Large visual wrapper */}
                  <div className="w-full aspect-[4/5] overflow-hidden rounded-[28px] bg-secondary-white relative border border-black/5 group-hover:border-luxury-gold/30 group-hover:shadow-2xl transition-all duration-500">
                    <motion.img
                      src={finish.image}
                      alt={finish.name}
                      style={{ objectPosition: finish.objectPosition }}
                      initial={{ scale: finish.scale }}
                      whileHover={{ scale: finish.scale + 0.05 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover origin-center"
                      loading="lazy"
                    />

                    {/* Floating Series Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-primary-text border border-black/5 text-[8px] sm:text-[9px] uppercase font-bold tracking-widest py-1.5 px-3 rounded-full shadow-sm flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${isMini ? 'bg-orange-500 animate-pulse' : 'bg-luxury-gold animate-pulse'}`}></span>
                      <span>{isMini ? 'Mini Series' : 'Pro Series'}</span>
                    </div>

                    {/* Floating index badge */}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white border border-white/10 text-[9px] uppercase font-mono py-1 px-3 rounded-full">
                      0{index + 1}
                    </div>
                  </div>

                  {/* Clean Minimalist Text underneath card */}
                  <div className="pt-6 pb-2 text-center flex flex-col items-center flex-grow">
                    <h3 className="text-outfit font-black uppercase text-base sm:text-lg tracking-tight text-primary-text group-hover:text-luxury-gold transition-colors duration-300">
                      {finish.name}
                    </h3>
                    {/* <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-luxury-gold mt-1.5 font-bold">
                      {isMini ? '250mm Travel Size • 45mm Grip' : '450mm Regular Size • 45mm Grip'}
                    </p> */}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 350 KG Capacity Animated Weight Icon — Below Finishes */}

        </div>
      </section>

      {/* UPGRADED SECTION: ANATOMY OF PERFECTION - MASTERING HOME FIT & CALISTHENICS */}
      <section className="relative bg-[#0A0A0A] text-white py-32 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-luxury-gold/5 blur-[180px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Heading */}
          <div className="max-w-3xl mx-auto text-center mb-24">
            <span className="inline-block uppercase tracking-[0.12em] sm:tracking-[0.35em] text-luxury-gold text-[8px] xs:text-[10px] sm:text-xs font-semibold bg-white/5 py-2 px-4 rounded-full border border-white/10 text-outfit max-w-full text-center">
              Calisthenics • Home Workouts • Everyday Strength
            </span>

            <h2
              className="mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase leading-tight tracking-tighter text-outfit"
            >
              Designed For Strength.<br />Crafted For The Home.
            </h2>

            <p className="mt-6 text-white/60 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-light">
              FITZ1 parallettes bridge the gap between commercial-grade calisthenics engineering and organic, furniture-grade home styling. Zero clutter, wrist-friendly grips, and absolute stability.
            </p>
          </div>

          {/* Main Interactive Layout (Best UX & Fully Responsive) */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Product Image Panel with Pulsing Hotspots */}
            <div className="relative flex justify-center order-2 lg:order-1">
              <div className="absolute inset-0 bg-luxury-gold/10 blur-[120px] rounded-full text-center"></div>

              <div className="relative w-full max-w-[580px] aspect-square flex items-center justify-center">
                <motion.img
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                  src={natural}
                  alt="FITZ1 Parallettes Interactive Features"
                  className="relative z-10 w-full h-full object-cover rounded-3xl drop-shadow-[0_45px_90px_rgba(0,0,0,0.8)]"
                />

                {/* 350 KG Capacity — SVG Weight Icon */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-25 flex flex-col items-center drop-shadow-2xl"
                >
                  {/* Animated glow ring */}
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-luxury-gold/20 blur-xl pointer-events-none"
                  />

                  {/* SVG Weight Icon with text inside */}
                  <svg
                    viewBox="0 0 120 130"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-24 h-28 sm:w-32 sm:h-36 drop-shadow-[0_8px_24px_rgba(212,175,55,0.4)]"
                  >
                    {/* Ring handle */}
                    <circle cx="60" cy="18" r="13" fill="none" stroke="#ffff" strokeWidth="6" />

                    {/* Weight body — trapezoid shape */}
                    <path
                      d="M22 36 L98 36 L110 118 Q110 124 104 124 L16 124 Q10 124 10 118 Z"
                      fill="#000000"
                      stroke="#ffff"
                      strokeWidth="3"
                      strokeLinejoin="round"
                    />

                    {/* 350 KG text inside body */}
                    <text
                      x="60"
                      y="85"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="#D4AF37"
                      fontSize="22"
                      fontWeight="900"
                      fontFamily="Outfit, sans-serif"
                      letterSpacing="-0.5"
                    >
                      350
                    </text>
                    <text
                      x="60"
                      y="108"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="rgba(255,255,255,0.55)"
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="monospace"
                      letterSpacing="2"
                    >
                      KG CAPACITY
                    </text>
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* Interactive Features Stack (Right side) */}
            <div className="flex flex-col gap-5 order-1 lg:order-2">
              {MASTERY_FEATURES.map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full text-left rounded-3xl p-6 border transition-all duration-500 cursor-pointer relative group ${activeFeature === feature.id
                    ? 'bg-white/[0.06] border-luxury-gold/50 shadow-xl shadow-luxury-gold/5'
                    : 'bg-white/[0.01] border-white/[0.05] opacity-50 hover:opacity-80 hover:bg-white/[0.03]'
                    }`}
                >
                  <div className="flex gap-5 items-start">
                    {/* Index / Selector circle */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-sm transition-all duration-300 flex-shrink-0 ${activeFeature === feature.id
                      ? 'bg-luxury-gold border-luxury-gold text-black'
                      : 'bg-white/5 border-white/10 text-white/70 group-hover:text-white'
                      }`}>
                      {feature.id + 1}
                    </div>

                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-white font-serif">{feature.title}</h3>
                      <span className="block text-[9px] uppercase tracking-widest text-luxury-gold font-mono mt-0.5 mb-3">
                        {feature.subtitle}
                      </span>

                      {/* Smooth description expand */}
                      <div className={`transition-all duration-500 overflow-hidden ${activeFeature === feature.id ? 'max-h-[160px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                        }`}>
                        <p className="text-white/60 leading-relaxed text-xs sm:text-sm font-light">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW INTERACTIVE GALLERY: AESTHETIC IN ACTION */}
      <section className="py-32 bg-secondary-white relative border-b border-black/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <span className="uppercase tracking-[0.35em] text-luxury-gold text-xs font-semibold text-outfit block mb-3">
              FITZ1 Photoshoot
            </span>
            <h2
              className="mt-4 text-3xl md:text-5xl font-extrabold uppercase tracking-tighter text-primary-text text-outfit"
            >
              Aesthetic In Action
            </h2>
            <p className="text-secondary-text mt-4 max-w-xl mx-auto font-light text-sm md:text-base">
              Pure minimalist design combined with extreme structural build quality. Hover on details below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {PHOTOSHOOT_GALLERY.map((photo, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden group aspect-[4/5] rounded-3xl border border-black/5 shadow-md bg-white"
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-[0.16,1,0.3,1]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <span className="text-luxury-gold text-xs uppercase tracking-widest font-mono font-bold mb-2">✦ FITZ1 Spec</span>
                  <h4 className="text-white text-2xl font-bold uppercase tracking-wider mb-2 font-serif">{photo.title}</h4>
                  <p className="text-white/70 text-sm font-light leading-relaxed">{photo.desc}</p>
                </div>
                {/* Small floating badge in corner */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white border border-white/20 text-[10px] uppercase font-mono py-1 px-3 rounded-full">
                  FITZ1 Pro
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO IT IS FOR SECTION (Updated to use local photoshoot photo) */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-gold mb-6 flex items-center gap-2 text-outfit"><Users size={16} /> Who It's For</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tighter mb-8 text-outfit text-primary-text" style={{ lineHeight: "1.1" }}>
                Built for those who refuse to compromise.
              </h3>

              <ul className="space-y-6">
                {[
                  { title: 'Calisthenics Practitioners', desc: 'Master the planche, front lever, and handstand pushups with ultimate stability and zero wrist pain.' },
                  { title: 'Gymnasts', desc: 'Transition smoothly from the gym to home workouts without losing the tactile feel of competition bars.' },
                  { title: 'Hybrid Athletes', desc: 'Integrate deep range-of-motion pushups and L-sits into your strength routine with equipment that won\'t fail.' }
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-4">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <div>
                      <h4 className="font-bold text-primary-text">{item.title}</h4>
                      <p className="text-sm text-secondary-text mt-1">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }}
              className="relative aspect-square overflow-hidden rounded-3xl shadow-xl border border-black/5 bg-secondary-white"
            >
              <img
                src={photo8}
                alt="FITZ1 premium wooden parallettes"
                loading="lazy"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT IS MADE - CRAFTSMANSHIP DEEP DIVE */}
      <section className="py-32 bg-primary-text text-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-gold mb-4 text-outfit">The Process</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tighter text-outfit text-white">
              How It's Made
            </h3>
            <p className="text-white/60 mt-4 max-w-xl mx-auto font-light text-sm">Every pair is a labor of love. Experience the journey from raw timber to professional equipment.</p>
          </div>

          <div className="relative aspect-video max-w-5xl mx-auto border border-white/10 group bg-black shadow-2xl overflow-hidden">
            <video
              ref={videoRef}
              src={processVideo}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              onTimeUpdate={handleProcessVideoTimeUpdate}
            />

            {/* Fade-out overlay at the end of the video loop */}
            <div
              className={`absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000 ease-in-out ${isProcessVideoFading ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Dark gradient for bottom text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Bottom text overlay */}
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
              <div className="max-w-md">
                <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <span className="w-8 h-[1px] bg-luxury-gold"></span>
                  Crafted by Hand
                </h4>
                <p className="text-white/70 text-xs leading-relaxed uppercase tracking-widest font-medium">
                  Sustainable Hardwood • Precision Milling • Hand Finished
                </p>
              </div>
              <button
                onClick={() => videoRef.current?.requestFullscreen()}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-luxury-gold hover:border-luxury-gold transition-all duration-300 pointer-events-auto"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-16">
            <div className="bg-white/5 border border-white/10 p-8">
              <span className="text-luxury-gold font-mono text-xl mb-4 block">01</span>
              <h4 className="font-bold uppercase tracking-widest mb-4">Material Selection</h4>
              <p className="text-white/70 text-sm leading-relaxed font-light">We reject 30% of the wood we inspect. Only knot-free, straight-grained hardwoods make the cut for ultimate structural integrity.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8">
              <span className="text-luxury-gold font-mono text-xl mb-4 block">02</span>
              <h4 className="font-bold uppercase tracking-widest mb-4">Precision Milling</h4>
              <p className="text-white/70 text-sm leading-relaxed font-light">CNC routers carve the interlocking joints with 0.1mm tolerance, ensuring the grip never twists or wobbles under extreme load.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8">
              <span className="text-luxury-gold font-mono text-xl mb-4 block">03</span>
              <h4 className="font-bold uppercase tracking-widest mb-4">The Final Finish</h4>
              <p className="text-white/70 text-sm leading-relaxed font-light">Sanded by hand through five grits and sealed with natural mineral oil. The result is a grip that feels alive, <span className="text-luxury-gold font-semibold">Not Plastic</span>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL VIDEO REVIEWS */}
      <section className="py-32 bg-secondary-white relative overflow-hidden border-b border-black/5">
        <div className="container mx-auto px-6 mb-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-gold mb-4 text-outfit">Customer Reviews</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tighter text-outfit text-primary-text">
            Video Reviews
          </h3>
        </div>

        <div
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex overflow-x-scroll gap-6 px-6 pb-8 snap-x snap-mandatory w-full scrollbar-hide"
          style={{ scrollbarWidth: 'thin', scrollBehavior: 'smooth' }}
        >
          {VIDEO_REVIEWS.map((video, idx) => (
            <VideoReviewCard key={idx} video={video} />
          ))}
        </div>
      </section>

      {/* NEW SECTION: CUSTOMER IMAGE REVIEWS slider */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="uppercase tracking-[0.35em] text-luxury-gold text-xs font-semibold text-outfit block mb-3">
                Customer Proof
              </span>
              <h2
                className="text-3xl md:text-5xl font-extrabold uppercase tracking-tighter text-outfit text-primary-text"
              >
                Customer Feedback
              </h2>
              <p className="text-secondary-text mt-4 max-w-2xl font-light text-sm md:text-base">
                Real customer feedback screenshots from users using FITZ1 parallettes. Click any screenshot to open in full size.
              </p>
            </div>

            {/* Interactive hint */}
            <div className="flex items-center gap-2 self-start md:self-end text-xs font-mono text-secondary-text uppercase tracking-widest bg-secondary-white py-2 px-4 rounded-full border border-black/5">
              <span>← Swipe / Scroll horizontally to explore →</span>
            </div>
          </div>
        </div>

        {/* Scrollable image track */}
        <div className="relative w-full overflow-hidden">
          <div
            className="flex gap-6 overflow-x-auto scrollbar-hide px-6 pb-8 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {IMAGE_REVIEWS.map((review, idx) => (
              <motion.div
                key={review.id}
                whileHover={{ y: -8 }}
                onClick={() => openLightbox(idx)}
                className="relative flex-none w-[220px] md:w-[280px] aspect-[9/16] bg-secondary-white border border-black/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-luxury-gold/30 transition-all duration-300 cursor-zoom-in snap-center"
              >
                <img
                  src={review.src}
                  alt={review.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {/* Privacy overlay — blurs phone numbers in top portion of WhatsApp screenshots */}
                <div
                  className="absolute top-0 left-0 right-0 h-[18%] backdrop-blur-md bg-black/20"
                  style={{ backdropFilter: 'blur(12px)' }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all duration-300 z-50 cursor-pointer"
            >
              <X size={24} />
            </button>

            {/* Prev Button */}
            <button
              onClick={prevReview}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all duration-300 z-50 cursor-pointer"
            >
              <ArrowLeft size={24} />
            </button>

            {/* Next Button */}
            <button
              onClick={nextReview}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all duration-300 z-50 cursor-pointer"
            >
              <ArrowRight size={24} />
            </button>

            {/* Main Image Container */}
            <div
              className="relative max-w-full max-h-[85vh] flex flex-col items-center justify-center p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex justify-center items-center">
                <motion.img
                  key={lightboxIndex}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={IMAGE_REVIEWS[lightboxIndex].src}
                  alt={`FITZ1 Customer Review ${lightboxIndex + 1}`}
                  className="max-w-[90vw] md:max-w-[600px] max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                />
                {/* Privacy overlay — blurs phone numbers in top portion of WhatsApp screenshots in Lightbox */}
                <div
                  className="absolute top-0 left-0 right-0 h-[12%] rounded-t-2xl backdrop-blur-md bg-black/20"
                  style={{ backdropFilter: 'blur(12px)' }}
                />
              </div>

              {/* Caption */}
              <div className="mt-6 flex items-center justify-between w-full max-w-[600px] px-2 text-white/60 text-xs font-mono uppercase tracking-widest">
                <span>Customer Review Screenshot</span>
                <span>{lightboxIndex + 1} of {IMAGE_REVIEWS.length}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const VideoReviewCard = ({ video }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex-none w-[280px] md:w-[350px] snap-center">
      <div
        className="relative aspect-[9/16] bg-black group cursor-pointer overflow-hidden border border-black/10 rounded-2xl"
        onClick={togglePlay}
      >
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster}
          className="w-full h-full object-cover"
          playsInline
          loop
          muted={!isPlaying}
          preload="none"
        />
        {!isPlaying && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white pl-1 group-hover:bg-luxury-gold transition-colors duration-300">
                <Play size={24} fill="currentColor" />
              </div>
            </div>
          </>
        )}
        {/* <div className="absolute bottom-6 left-6 right-6">
          <div className="flex text-luxury-gold mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <p className="text-white font-bold text-sm">"{video.text}"</p>
          <p className="text-white/70 text-xs mt-1">{video.username}</p>
        </div> */}
      </div>
    </div>
  );
};

export default Home;
