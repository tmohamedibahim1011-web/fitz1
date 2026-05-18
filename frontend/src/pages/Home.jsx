import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Star, Users, Check, Maximize2, Loader2 } from 'lucide-react';
import axios from 'axios';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import product3d from "../assets/3dproduct.png";
import ProductCard from '../components/ProductCard';
import natural from "../assets/products/regularnatural.jpeg"
import black from "../assets/products/regularblack.jpeg"
import mininatural from "../assets/products/mininatural.jpeg"
// import miniblack from "../assets/products/miniblack.jpeg"

// Assets
import bannerImg from '../assets/banner.png';
import processVideo from '../assets/how-its-made.mp4';

// Video Reviews
import video1 from '../assets/reviews/video-1.mp4';
import video2 from '../assets/reviews/video-2.mp4';
import video3 from '../assets/reviews/video-3.mp4';
import video4 from '../assets/reviews/video-4.mp4';
import video5 from '../assets/reviews/video-5.mp4';
import video6 from '../assets/reviews/video-6.mp4';

const VIDEO_REVIEWS = [
  { src: video1, username: '@fitness_pro', text: "Best parallettes I've ever used!" },
  { src: video2, username: '@calisthenics_king', text: "Game changer for my training" },
  { src: video3, username: '@gymnast_life', text: "The grip is unbelievable" },
  { src: video4, username: '@athlete_mike', text: "Worth every penny" },
  { src: video5, username: '@coach_jones', text: "Highly recommended" },
  { src: video6, username: '@workout_junkie', text: "Premium quality" },
];

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const scrollRef = useRef(null);
  const videoRef = useRef(null);
  const [products, setProducts] = useState([]);
  const finishes = [{
    id: 1,
    name: "Regular Natural",
    image: natural
  }, {
    id: 2,
    name: "Regular Black",
    image: black
  }, {
    id: 3,
    name: "Mini Natural",
    image: mininatural
  } //, {
  //   id: 4,
  //   name: "Mini Black",
  //   image: miniblack
  // }
  ]
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

  const handleWheel = (e) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="bg-primary-white overflow-hidden">
      {/* REDESIGNED ASYMMETRIC HERO SECTION */}
      <section className="relative min-h-[100svh] pt-0 flex flex-col lg:flex-row overflow-hidden bg-primary-white">
        {/* Left Typography Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:pl-20 py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-[2px] bg-luxury-gold"></div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary-text">Engineered for the Elite</span>
            </div>

            <h1 className="text-7xl md:text-[120px] xl:text-[150px] font-bold text-primary-text leading-[0.8] tracking-tighter mb-8 relative">
              DEFILE<br />
              GRAVITY.
              {/* Decorative accent */}
              <span className="absolute -bottom-4 left-0 text-luxury-gold text-8xl opacity-20 font-serif">*</span>
            </h1>

            <p className="text-secondary-text max-w-md text-sm md:text-base leading-relaxed mb-12 font-light">
              We stripped away the noise to build the ultimate foundation for bodyweight mastery. Handcrafted from premium hardwood with relentless attention to detail.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link
                to="/products"
                className="group relative px-10 py-5 bg-primary-text text-white text-xs font-bold uppercase tracking-[0.2em] overflow-hidden w-full sm:w-auto text-center border border-primary-text"
              >
                <span className="relative z-10 flex items-center justify-center gap-4">
                  Shop Collection <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-luxury-gold transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-[0.16,1,0.3,1]"></div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Image/Visual Side */}
        <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-screen">
          <motion.div
            className="absolute inset-0 bg-black"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], transformOrigin: "right" }}
          >
            <motion.img
              src={bannerImg}
              alt="Premium Wooden Parallettes Banner"
              className="w-full h-full object-cover opacity-90"
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary-white lg:to-primary-white/20"></div>
          </motion.div>

          {/* Floating Element over Image */}
          {/* <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-6 hidden md:block max-w-xs"
          >
            <p className="text-white text-xs uppercase tracking-widest font-bold mb-2">The Standard</p>
            <p className="text-white/70 text-sm font-light">40mm ergonomic grip. 350kg weight capacity. Perfect balance.</p>
          </motion.div> */}
        </div>
      </section>

      {/* PRODUCTS SECTION (Standard Cards) */}
      <section className="py-32 bg-secondary-white relative z-20 border-y border-black/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter" style={{ fontFamily: 'var(--font-bebas)' }}>The Pro Collection</h2>
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

      {/* COLOR VARIATIONS SECTION - Shows all product colors from backend */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-primary-text" style={{ fontFamily: 'var(--font-bebas)' }}>
              Available Finishes
            </h2>
            <p className="text-secondary-text mt-4 text-sm md:text-base">Two premium finishes. Your choice.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {finishes.map((finish, index) => (
              <motion.div
                key={finish.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-secondary-white p-4 border border-black/5 hover:border-luxury-gold/30 transition-colors"
              >
                <img
                  src={finish.image}
                  alt={`${finish.name}`}
                  className="w-full aspect-square object-cover rounded-lg mb-3"
                />
                <p className="font-bold text-primary-text text-sm">{finish.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW SECTION: ANATOMY OF PERFECTION */}
      <section className="relative bg-[#0A0A0A] text-white py-24 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-luxury-gold/10 blur-[160px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">

          {/* Heading */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <span className="uppercase tracking-[0.35em] text-luxury-gold text-xs font-semibold">
              Crafted For Athletes
            </span>

            <h2
              className="mt-5 text-5xl md:text-7xl font-bold uppercase leading-none"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              Engineered <br /> To Perform
            </h2>

            <p className="mt-6 text-white/60 text-base md:text-lg leading-relaxed">
              Every curve, grip, and joint is designed for maximum performance,
              stability, and premium aesthetics.
            </p>
          </div>

          {/* Main Layout */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Product Image */}
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-luxury-gold/10 blur-[100px] rounded-full"></div>

              <motion.img
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                src={product3d}
                alt="Luxury Parallettes"
                className="relative z-10 w-full max-w-[650px] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)]"
              />
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6">

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-luxury-gold/40 transition-all duration-500">
                <div className="w-12 h-12 rounded-full bg-luxury-gold/10 flex items-center justify-center mb-6">
                  <span className="text-luxury-gold text-xl">✦</span>
                </div>

                <h3 className="text-2xl font-bold mb-3">
                  Ergonomic Grip
                </h3>

                <p className="text-white/60 leading-relaxed text-sm">
                  Optimized 40mm handle diameter for reduced wrist strain,
                  better control, and improved comfort during static holds.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-luxury-gold/40 transition-all duration-500">
                <div className="w-12 h-12 rounded-full bg-luxury-gold/10 flex items-center justify-center mb-6">
                  <span className="text-luxury-gold text-xl">✦</span>
                </div>

                <h3 className="text-2xl font-bold mb-3">
                  Zero Slip Base
                </h3>

                <p className="text-white/60 leading-relaxed text-sm">
                  Industrial rubber feet provide unmatched floor grip and
                  total stability under explosive movement.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-luxury-gold/40 transition-all duration-500">
                <div className="w-12 h-12 rounded-full bg-luxury-gold/10 flex items-center justify-center mb-6">
                  <span className="text-luxury-gold text-xl">✦</span>
                </div>

                <h3 className="text-2xl font-bold mb-3">
                  Premium Hardwood
                </h3>

                <p className="text-white/60 leading-relaxed text-sm">
                  Crafted from solid walnut and oak for elite durability,
                  luxury feel, and timeless aesthetics.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-luxury-gold/40 transition-all duration-500">
                <div className="w-12 h-12 rounded-full bg-luxury-gold/10 flex items-center justify-center mb-6">
                  <span className="text-luxury-gold text-xl">✦</span>
                </div>

                <h3 className="text-2xl font-bold mb-3">
                  Precision Built
                </h3>

                <p className="text-white/60 leading-relaxed text-sm">
                  CNC-machined joints distribute force evenly for maximum
                  structural integrity and zero wobble.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>



      {/* WHO IT IS FOR SECTION */}
      <section className="py-32 bg-white relative">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-gold mb-6 flex items-center gap-2"><Users size={16} /> Who It's For</h2>
              <h3 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter mb-8" style={{ fontFamily: 'var(--font-bebas)' }}>
                Built for athletes who refuse to compromise.
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
              className="relative aspect-square overflow-hidden"
            >
              <img src="https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1000&auto=format&fit=crop" alt="Athlete using parallettes" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT IS MADE - CRAFTSMANSHIP DEEP DIVE */}
      <section className="py-32 bg-primary-text text-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-gold mb-4">The Process</h2>
            <h3 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter" style={{ fontFamily: 'var(--font-bebas)' }}>
              How It's Made
            </h3>
            <p className="text-white/60 mt-4 max-w-xl mx-auto font-light text-sm">Every pair is a labor of love. Experience the journey from raw timber to professional equipment.</p>
          </div>

          <div className="relative aspect-video max-w-5xl mx-auto border border-white/10 group bg-black shadow-2xl">
            <video
              ref={videoRef}
              src={processVideo}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
              autoPlay
              muted
              loop
              playsInline
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
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
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-luxury-gold hover:border-luxury-gold transition-all duration-300"
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
              <p className="text-white/70 text-sm leading-relaxed font-light">Sanded by hand through five grits and sealed with natural mineral oil. The result is a grip that feels alive, not plastic.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HORIZONTAL VIDEO REVIEWS */}
      <section className="py-32 bg-secondary-white relative overflow-hidden">
        <div className="container mx-auto px-6 mb-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-luxury-gold mb-4">Real Athletes</h2>
          <h3 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-primary-text" style={{ fontFamily: 'var(--font-bebas)' }}>
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
          className="w-full h-full object-cover"
          playsInline
          loop
          muted={!isPlaying}
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
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex text-luxury-gold mb-2">
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </div>
          <p className="text-white font-bold text-sm">"{video.text}"</p>
          <p className="text-white/70 text-xs mt-1">{video.username}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
