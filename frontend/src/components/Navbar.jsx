import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const smoothJump = (id) => (event) => {
    if (location.pathname !== '/') {
      return;
    }
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className={`sticky top-0 z-40 border-b transition-all ${scrolled ? 'border-cyan-500/25 bg-black/60 backdrop-blur-xl' : 'border-transparent bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 heading-display text-cyan-200 tracking-[0.2em] text-sm md:text-base">
          <ShieldCheck size={16} />
          <span>[ DSP ] DevSecOps</span>
        </Link>

        <div className="flex items-center gap-4 text-xs md:text-sm">
          <a href="#features" onClick={smoothJump('features')} className="text-slate-300 hover:text-cyan-200">Features</a>
          <a href="#how-it-works" onClick={smoothJump('how-it-works')} className="text-slate-300 hover:text-cyan-200">How It Works</a>
          <a href="#docs" onClick={smoothJump('docs')} className="text-slate-300 hover:text-cyan-200">Docs</a>

          {isAuthenticated ? (
            <Link to="/dashboard" className="px-4 py-2 rounded-lg border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25">
              Dashboard -&gt;
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 rounded-lg border border-slate-500/50 text-slate-200 hover:border-cyan-400">Login</Link>
              <motion.div whileHover={{ scale: 1.04 }}>
                <Link to="/register" className="px-4 py-2 rounded-lg border border-cyan-300 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25">
                  Get Started
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
