import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <div className="bg-primary-white min-h-screen pt-24 pb-32">
      {/* HERO */}
      <section className="container mx-auto px-6 mb-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-tighter text-primary-text mb-6" style={{ fontFamily: 'var(--font-bebas)' }}>
            OUR STORY
          </h1>
          <p className="text-lg md:text-xl text-secondary-text max-w-2xl mx-auto font-light leading-relaxed">
            Born from a desire for uncompromising quality. We build equipment that inspires movement and honors the craft of woodworking.
          </p>
        </motion.div>
      </section>

      {/* IMAGE BREAK */}
      <section className="w-full h-[60vh] relative mb-32">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000&auto=format&fit=crop" 
          alt="Workshop" 
          className="w-full h-full object-cover object-center fixed-bg"
        />
      </section>

      {/* THE FOUNDER */}
      <section className="container mx-auto px-6 mb-32">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-luxury-gold mb-4 flex items-center gap-2">
              <span className="w-8 h-[1px] bg-luxury-gold"></span> The Founder
            </h2>
            <h3 className="text-4xl font-bold uppercase tracking-tighter text-primary-text mb-6" style={{ fontFamily: 'var(--font-bebas)' }}>
              Driven by Perfection
            </h3>
            <p className="text-secondary-text mb-6 leading-relaxed">
              It started in a small garage in 2020. Dissatisfied with mass-produced, unstable metal parallettes, our founder, an avid calisthenics athlete and woodworker, set out to create the perfect pair.
            </p>
            <p className="text-secondary-text leading-relaxed">
              "I wanted equipment that felt alive. Wood provides a natural grip that absorbs sweat and offers slight flex under heavy load, protecting the wrists. It had to perform flawlessly and look beautiful enough to leave in the living room."
            </p>
          </div>
          <div className="w-full md:w-1/2 relative">
            <div className="aspect-[3/4] bg-secondary-white overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
                alt="Founder" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-white p-4 border border-black/5 hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=1000&auto=format&fit=crop" 
                alt="Detail" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CRAFTSMANSHIP */}
      <section className="bg-secondary-white py-32 mb-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-luxury-gold mb-4">Our Process</h2>
            <h3 className="text-5xl font-bold uppercase tracking-tighter text-primary-text" style={{ fontFamily: 'var(--font-bebas)' }}>
              The Craftsmanship
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Material Selection', desc: 'We source only premium hardwoods—Walnut, Oak, and Baltic Birch—known for their density and grain structure.' },
              { title: 'Precision Milling', desc: 'Each piece is CNC milled to exact specifications ensuring perfect balance and structural integrity before hand-finishing.' },
              { title: 'Hand Finished', desc: 'Sanded through 5 grits and sealed with natural oils to preserve the wood\'s tactile feel while protecting against moisture.' }
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-10 border border-black/5 hover:border-luxury-gold/30 transition-colors">
                <span className="text-4xl font-bold text-luxury-gold/20 mb-6 block font-mono">0{idx + 1}</span>
                <h4 className="text-lg font-bold uppercase tracking-widest text-primary-text mb-4">{step.title}</h4>
                <p className="text-secondary-text leading-relaxed text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="container mx-auto px-6 text-center">
        <h2 className="text-sm font-bold uppercase tracking-widest text-luxury-gold mb-16">The Journey</h2>
        <div className="space-y-24 relative before:absolute before:inset-0 before:ml-auto before:mr-auto before:w-[1px] before:bg-black/10">
          {[
            { year: '2020', title: 'The First Prototype', align: 'left' },
            { year: '2022', title: 'Global Expansion', align: 'right' },
            { year: '2024', title: 'The Pro Series Launch', align: 'left' }
          ].map((item, idx) => (
            <div key={idx} className={`relative flex items-center justify-between w-full ${item.align === 'left' ? 'flex-row-reverse' : ''}`}>
              <div className="w-5/12 hidden md:block"></div>
              <div className="z-20">
                <div className="w-8 h-8 rounded-full bg-primary-white border-2 border-luxury-gold flex items-center justify-center">
                  <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>
                </div>
              </div>
              <div className={`w-full md:w-5/12 ${item.align === 'left' ? 'md:text-right' : 'md:text-left'} text-center md:text-current px-4`}>
                <h4 className="text-2xl font-bold uppercase tracking-widest text-primary-text mb-2">{item.year}</h4>
                <p className="text-secondary-text">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default About;
