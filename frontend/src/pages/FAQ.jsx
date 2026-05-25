import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: "What is the difference between the Regular and Mini series?",
    answer: "The Regular series (45cm length) is designed for maximum stability during complex handstand transitions and deep pushups, ideal for home gyms. The Mini series (25cm length) offers the exact same grip diameter and wood quality but is optimized for extreme portability and travel."
  },
  {
    question: "What type of wood do you use?",
    answer: "We strictly use premium hardwoods (Mahogany, Maple) known for their density, durability, and moisture resistance. We do not use softwoods or plywood."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we focus on domestic shipping within India. Shipping within Tamil Nadu is free of charge and takes 2-3 working days. For other states, it takes 4-5 working days. Please note that each pair is handcrafted, which takes 4-5 working days before dispatch."
  },
  {
    question: "What is your shipping policy?",
    answer: "Orders are handmade after you place them. Crafting takes 4-5 working days. Delivery within Tamil Nadu takes 2-3 working days (Free shipping). Other states take 4-5 working days."
  },
  {
    question: "How do I maintain the wood finish?",
    answer: "Wipe down with a slightly damp cloth after sweaty sessions. We recommend lightly rubbing them with natural mineral oil every 6 months to keep the wood supple and prevent drying.Avoid over exposure to sunlight and rain"
  },
  {
    question: "What is the weight limit?",
    answer: "Both our Regular and Mini series are stress-tested to support up to 350kg (770 lbs) per pair."
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="bg-primary-white min-h-screen pt-32 pb-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-tighter text-primary-text mb-4" style={{ fontFamily: "'Unbounded', sans-serif" }}>
            Frequently Asked Questions
          </h1>
          <p className="text-secondary-text">Everything you need to know about our products and services.</p>
        </motion.div>

        <div className="space-y-2">
          {FAQS.map((faq, index) => (
            <div key={index} className="bg-white border border-black/10 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-secondary-white/50 transition-colors"
              >
                <span className="font-bold text-sm text-primary-text">{faq.question}</span>
                <motion.div animate={{ rotate: openIndex === index ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown size={18} className="text-secondary-text" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-sm text-secondary-text leading-relaxed font-light">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
