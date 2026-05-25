import { Link } from 'react-router-dom';
import logo from '../assets/fitz1.png';

const Footer = () => {
  return (
    <footer className="bg-primary-white border-t border-black/5 pt-20 pb-10 mt-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
            <Link
              to="/"
              className="block hover:opacity-80 transition-opacity"
            >
              <img src={logo} alt="FITZONE" className="h-10 md:h-12 w-auto mb-2" />
            </Link>
            <p className="text-secondary-text text-sm leading-relaxed max-w-sm">
              Handcrafted fitness equipment built for elite performance. Designed with precision, engineered for strength.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-6" style={{ fontFamily: 'var(--font-barlow)' }}>Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-secondary-text hover:text-luxury-gold transition-colors text-sm">Home</Link></li>
              <li><Link to="/products" className="text-secondary-text hover:text-luxury-gold transition-colors text-sm">Shop</Link></li>
              <li><Link to="/about" className="text-secondary-text hover:text-luxury-gold transition-colors text-sm">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-widest text-sm mb-6" style={{ fontFamily: 'var(--font-barlow)' }}>Support</h4>
            <ul className="space-y-4">
              <li><Link to="/track" className="text-secondary-text hover:text-luxury-gold transition-colors text-sm">Track Order</Link></li>
              <li><Link to="/faq" className="text-secondary-text hover:text-luxury-gold transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/faq" className="text-secondary-text hover:text-luxury-gold transition-colors text-sm">Help Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary-text text-xs">
            &copy; {new Date().getFullYear()} FITZONE. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-secondary-text">
            <Link to="/privacy" className="hover:text-luxury-gold transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-luxury-gold transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
