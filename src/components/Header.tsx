import React, { useState } from 'react';
import { Menu, X, Landmark, ShieldCheck, Milestone, Compass, PhoneIcon, FileText } from 'lucide-react';

interface HeaderProps {
  currentPage: 'accueil' | 'offres' | 'contact' | 'terrain';
  setCurrentPage: (page: 'accueil' | 'offres' | 'contact' | 'terrain') => void;
}

export default function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'accueil', label: 'Accueil', icon: Compass },
    { id: 'offres', label: 'Nos Offres', icon: ShieldCheck },
    { id: 'terrain', label: 'Saisie Terrain', icon: FileText },
    { id: 'contact', label: 'Contact', icon: PhoneIcon },
  ] as const;

  const handleNavClick = (pageId: 'accueil' | 'offres' | 'contact' | 'terrain') => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    // Smooth scroll back to top of the window
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-rose-50/10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Emoji */}
          <div 
            onClick={() => handleNavClick('accueil')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl transition-transform group-hover:scale-110">
              🌿
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl text-primary tracking-tight">
                MicroFin
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Sénégal Agricole
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-slate-600 hover:text-primary hover:bg-slate-50/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-primary hover:bg-slate-50 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl py-3 px-4 space-y-1 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                  isActive 
                    ? 'bg-primary text-white font-semibold' 
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
