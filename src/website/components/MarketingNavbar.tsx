/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Marketing Navbar
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Menu, 
  X, 
  ArrowRight, 
  Radio, 
  Layers, 
  Mic2, 
  Tag, 
  HelpCircle,
  Play
} from 'lucide-react';

export const MarketingNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Voices', path: '/voices' },
    { name: 'Use Cases', path: '/use-cases' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'FAQ', path: '/faq' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#090D14]/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 group-hover:scale-105 transition-transform duration-200">
              {/* Animated Waveform Icon */}
              <div className="flex items-center gap-0.5 h-4">
                <span className="w-0.5 h-2 bg-black rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-0.5 h-4 bg-black rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-3 bg-black rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <span className="w-0.5 h-4 bg-black rounded-full animate-pulse" style={{ animationDelay: '75ms' }} />
                <span className="w-0.5 h-1.5 bg-black rounded-full animate-pulse" style={{ animationDelay: '220ms' }} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center">
                Audio<span className="text-amber-400 font-black">FACTORY</span>
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 -mt-1 font-semibold">
                AI Sound Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-150 ${
                    isActive 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' 
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* CTA Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/app"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded-lg transition-colors border border-transparent hover:border-zinc-700"
            >
              Sign In
            </Link>
            <Link
              to="/app"
              className="group relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:brightness-105 active:scale-[0.98] transition-all duration-200 border border-amber-300/60"
            >
              <Sparkles className="w-4 h-4 text-black group-hover:rotate-12 transition-transform duration-300" />
              <span>Launch Studio</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#090D14]/98 border-b border-white/10 px-4 pt-4 pb-6 mt-3 space-y-3 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`p-3 text-sm font-semibold rounded-lg flex items-center justify-between border ${
                    isActive 
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' 
                      : 'bg-zinc-900/50 text-zinc-300 border-white/5 hover:bg-zinc-800/80'
                  }`}
                >
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <Link
              to="/app"
              className="w-full py-3 text-center text-sm font-bold text-black bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>Start Creating Free</span>
            </Link>
            <Link
              to="/app"
              className="w-full py-2.5 text-center text-sm font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 border border-white/10 rounded-lg"
            >
              Open Audio Studio
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
