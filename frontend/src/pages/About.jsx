import { motion } from 'framer-motion';
import { ArrowRight, Check, Home as HomeIcon, Shield, Sparkles, Heart } from 'lucide-react';
import aboutPhoto from '../assets/about_photo.PNG';

const About = () => {
  return (
    <div className="bg-primary-white min-h-screen pt-24 pb-32">
      {/* HERO SECTION */}
      <section className="container mx-auto px-6 mb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-12 h-[2px] bg-luxury-gold"></span>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-secondary-text">The FITZ1 Philosophy</span>
            <span className="w-12 h-[2px] bg-luxury-gold"></span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter text-primary-text mb-8" style={{ fontFamily: 'var(--font-bebas)' }}>
            FITNESS BEGINS AT HOME.
          </h1>
          <p className="text-xl md:text-2xl font-serif text-primary-text max-w-3xl mx-auto leading-relaxed mb-6 font-medium">
            "At FITZ1, we believe fitness should be easy, affordable, and accessible to everyone. You do not need high-tech machines or expensive gym memberships to stay healthy."
          </p>
        </motion.div>
      </section>

      {/* CORE MESSAGE BANNER */}
      <section className="bg-black text-white py-24 mb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-luxury-gold/5 blur-3xl pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em] mb-4 block font-mono">// Our Niche</span>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter leading-none mb-6" style={{ fontFamily: 'var(--font-bebas)' }}>
                HOME WORKOUT EQUIPMENT.<br />NOT GYM CLUTTER.
              </h2>
              <p className="text-white/80 leading-relaxed font-light mb-6 text-base md:text-lg">
                With simple workouts and the right basic equipment, anyone can begin their fitness journey from the comfort of home. Our brand focuses on providing quality home workout equipment designed for everyday fitness needs.
              </p>
              <p className="text-white/80 leading-relaxed font-light text-base md:text-lg">
                Whether you are a beginner or someone looking to maintain an active lifestyle, FITZ1 helps you stay consistent with simple and effective workouts.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 p-10 rounded-3xl backdrop-blur-xl relative">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-luxury-gold/20 rounded-full flex items-center justify-center text-luxury-gold border border-luxury-gold/40">
                <HomeIcon size={28} />
              </div>
              <h3 className="text-2xl font-bold uppercase tracking-widest text-luxury-gold mb-4">Our Mission</h3>
              <p className="text-white/90 leading-relaxed text-sm md:text-base italic mb-6">
                "The FITZ1 page was created to inspire people to make fitness a part of daily life in an easy and practical way. Start small, stay active, and build a healthier lifestyle with FITZ1 — because fitness begins at home."
              </p>
              <div className="border-t border-white/10 pt-6 flex items-center justify-between text-xs font-mono text-white/60 uppercase tracking-widest">
                <span>Accessibility</span>
                <span>•</span>
                <span>Affordability</span>
                <span>•</span>
                <span>Simplicity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE FOUNDER SECTION */}
      <section className="container mx-auto px-6 mb-32 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[2px] bg-luxury-gold"></span>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-secondary-text">The Founder</h2>
            </div>
            <h3 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-primary-text mb-4" style={{ fontFamily: 'var(--font-bebas)' }}>
              Meet Kavinath
            </h3>
            <p className="text-sm uppercase tracking-[0.2em] font-mono text-luxury-gold mb-8">Founder & Visionary behind FITZ1</p>
            
            <div className="space-y-6 text-secondary-text leading-relaxed text-base md:text-lg font-light">
              <p>
                Kavinath realized early on that modern fitness had become overly complicated. Commercial gyms, expensive subscriptions, and bulky, complex machines often created barriers rather than encouraging healthy habits.
              </p>
              <p className="p-6 bg-secondary-white border-l-4 border-luxury-gold text-primary-text font-serif italic text-lg shadow-sm">
                "I wanted equipment that belonged in your living room. Equipment that feels natural, works flawlessly without complex setups, and makes staying consistent effortless."
              </p>
              <p>
                By focusing strictly on premium wooden home workout tools like our signature wooden parallettes, Kavinath built FITZ1 to prove that real fitness doesn't require a gym membership. It requires consistency, basic high-quality tools, and the dedication to start at home.
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative">
            <div className="relative aspect-[4/5] bg-secondary-white overflow-hidden rounded-3xl shadow-2xl border border-black/5 p-2 bg-gradient-to-br from-luxury-gold/10 to-transparent">
              <img 
                src={aboutPhoto} 
                alt="Kavinath - Founder of FITZ1" 
                className="w-full h-full object-cover rounded-2xl shadow-inner object-top"
              />
            </div>
            {/* Decorative Badge */}
            <div className="absolute -bottom-6 -left-6 bg-primary-text text-white p-6 rounded-2xl shadow-xl hidden sm:flex items-center gap-4 border border-luxury-gold/30">
              <div className="w-12 h-12 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-luxury-gold">Established</p>
                <p className="text-lg font-bold uppercase tracking-wider font-serif">Premium Quality</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY HOME EQUIPMENT MATTERS */}
      <section className="bg-secondary-white py-32 border-y border-black/5 mb-32">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-luxury-gold mb-3">The FITZ1 Advantage</h2>
            <h3 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter text-primary-text" style={{ fontFamily: 'var(--font-bebas)' }}>
              Why Home Equipment?
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: HomeIcon, title: 'Living Room Ready', desc: 'Designed with beautiful, natural hardwoods that complement your home decor rather than turning your room into an industrial warehouse.' },
              { icon: Heart, title: 'Everyday Consistency', desc: 'When your equipment is right at home and ready to use in seconds, building a daily workout habit becomes completely natural.' },
              { icon: Shield, title: 'Affordable Mastery', desc: 'No monthly dues, no commute, and no waiting in line. Premium, lifetime-quality tools at a fraction of the cost of commercial gym memberships.' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-10 rounded-2xl border border-black/5 hover:border-luxury-gold/40 hover:shadow-xl transition-all duration-500 group">
                <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={28} />
                </div>
                <h4 className="text-xl font-bold uppercase tracking-wider text-primary-text mb-4 font-serif">{feature.title}</h4>
                <p className="text-secondary-text leading-relaxed text-sm font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="container mx-auto px-6 text-center max-w-4xl">
        <div className="bg-primary-text text-white p-16 rounded-3xl relative overflow-hidden border border-luxury-gold/30 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-luxury-gold/20 via-transparent to-transparent"></div>
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-6" style={{ fontFamily: 'var(--font-bebas)' }}>
              Start Small. Stay Active.
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-10 text-base md:text-lg font-light leading-relaxed">
              Begin your home fitness journey today with our signature handcrafted wooden parallettes. Experience the perfect blend of woodworking and elite bodyweight training.
            </p>
            <a 
              href="/products" 
              className="inline-flex items-center gap-4 px-12 py-5 bg-luxury-gold text-black font-bold uppercase tracking-[0.2em] text-xs rounded-full hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-300"
            >
              Explore Products <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
