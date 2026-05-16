import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ajLogo from '../../assets/aj-logo.webp';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-luxury-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="brand-logo">
                <img src={ajLogo} alt="Akshar Jewellers logo" />
              </div>
              <div>
                <div className="font-display tracking-[0.3em] text-white text-sm uppercase">Akshar</div>
                <div className="font-sans text-[9px] tracking-[0.5em] text-gold-500 uppercase">Jewellers</div>
              </div>
            </Link>
            <p className="font-sans text-xs text-luxury-muted leading-relaxed mb-5">
              Crafting timeless beauty since 2012. Every piece tells a story of heritage, artistry, and enduring elegance.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/viditjoshi07"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 border border-luxury-border flex items-center justify-center text-luxury-muted hover:border-gold-500 hover:text-gold-500 transition-all duration-300 focus-visible:ring-1 focus-visible:ring-gold-500 focus:outline-none rounded-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a
                href="https://wa.me/919586607262"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 border border-luxury-border flex items-center justify-center text-luxury-muted hover:border-gold-500 hover:text-gold-500 transition-all duration-300 focus-visible:ring-1 focus-visible:ring-gold-500 focus:outline-none rounded-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                  <path d="M12 3.5a8.5 8.5 0 0 0-7.35 12.8L3.5 21l4.9-1.3A8.5 8.5 0 1 0 12 3.5Z" />
                  <path d="M9.2 8.8c.3-.5.6-.5.9-.5h.7c.2 0 .5 0 .7.5.2.5.7 1.7.8 1.9.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.2.8.2.4 1 1.6 2.1 2.6 1.4 1.2 2.5 1.6 2.9 1.8.4.2.6.1.8-.1.2-.2.9-1 .1-1.8" />
                </svg>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-gold-500 mb-5">Collections</h4>
            <ul className="space-y-3">
              {['Rings', 'Necklaces', 'Chains', 'Bangles', 'Earrings', 'Bridal Sets'].map(c => (
                <li key={c}>
                  <Link to={`/category/${c.toLowerCase().replace(' ', '-')}`}
                    className="font-sans text-xs text-luxury-muted hover:text-white transition-colors tracking-wider">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-gold-500 mb-5">Company</h4>
            <ul className="space-y-3">
              {[['About Us', '/about'], ['Collections', '/shop'], ['FAQ', '/faq']].map(([l, h]) => (
                <li key={l}>
                  <Link to={h} className="font-sans text-xs text-luxury-muted hover:text-white transition-colors tracking-wider">{l}</Link>
                </li>
              ))}
            </ul>
            <h4 className="font-sans text-xs tracking-widest uppercase text-gold-500 mt-6 mb-4">Legal</h4>
            <ul className="space-y-3">
              {[['Privacy Policy', '/privacy-policy'], ['Terms of Service', '/terms-of-service']].map(([l, h]) => (
                <li key={l}>
                  <Link to={h} className="font-sans text-xs text-luxury-muted hover:text-white transition-colors tracking-wider">{l}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-sans text-xs tracking-widest uppercase text-gold-500 mb-5">Contact</h4>
            <ul className="space-y-4 font-sans text-xs text-luxury-muted">
              <li className="flex gap-2">
                <span className="text-gold-500">📍</span>
                <span>Akshar Jewellers, Sardarchowk, Krishnanagar, Ahmedabad 382345</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500">📞</span>
                <span>+91 9586607262</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500">✉️</span>
                <span>aksharjewellers98@gmail.com</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-500">🕐</span>
                <span>Mon–Sat: 10AM – 8PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-5 pb-6 border-t border-luxury-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[11px] text-luxury-muted tracking-wider">
            © {new Date().getFullYear()} Akshar Jewellers. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[['Privacy Policy', '/privacy-policy'], ['Terms of Service', '/terms-of-service']].map(([l, h]) => (
              <Link key={l} to={h} className="font-sans text-[11px] text-luxury-muted hover:text-gold-500 transition-colors tracking-wider">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
