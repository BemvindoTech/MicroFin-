import React, { useState } from 'react';
import { Menu, X, Landmark, ShieldCheck, Milestone, Compass, PhoneIcon, FileText, UserCheck, LogOut, User as UserIcon, Key, CloudSun } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentPage: 'accueil' | 'offres' | 'meteo' | 'contact' | 'terrain' | 'dashboard';
  setCurrentPage: (page: 'accueil' | 'offres' | 'meteo' | 'contact' | 'terrain' | 'dashboard') => void;
  currentUser: User | null;
  onTriggerLogin: () => void;
  onLogout: () => void;
}

export default function Header({ currentPage, setCurrentPage, currentUser, onTriggerLogin, onLogout }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic items based on authentication status
  const navItems = [
    { id: 'accueil', label: 'Accueil', icon: Compass },
    { id: 'offres', label: 'Nos Offres', icon: ShieldCheck },
    { id: 'meteo', label: 'CNAAS Météo 📡', icon: CloudSun },
    ...(currentUser ? [{ id: 'dashboard', label: 'Mon Espace', icon: UserCheck }] : []),
    { id: 'terrain', label: 'Saisie Terrain', icon: FileText },
    { id: 'contact', label: 'Contact', icon: PhoneIcon },
  ] as const;

  const handleNavClick = (pageId: 'accueil' | 'offres' | 'meteo' | 'contact' | 'terrain' | 'dashboard') => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
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
              🌱
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
                  onClick={() => handleNavClick(item.id as any)}
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

          {/* User Account / Connexion Controller Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 p-1.5 pr-3.5 rounded-2xl">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {currentUser.role === 'PRODUCTEUR' ? '🌾' : currentUser.role === 'AGENT' ? '📋' : '🏛️'}
                </div>
                <div className="text-left leading-normal">
                  <p className="text-[11px] font-black text-slate-800 leading-tight truncate max-w-[120px]" title={currentUser.nom}>
                    {currentUser.nom}
                  </p>
                  <span className="text-[9px] text-[#1A7A3E] font-extrabold block tracking-wider uppercase leading-none">
                    {currentUser.role.toLowerCase()}
                  </span>
                </div>
                <button 
                  onClick={onLogout}
                  className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-red-650 hover:bg-red-50 transition-all cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onTriggerLogin}
                className="px-5 py-2.5 bg-gradient-to-r from-[#1A7A3E] to-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-md hover:shadow-primary/10 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Key className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span>Espace Membres</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {currentUser && (
              <div 
                onClick={() => handleNavClick('dashboard')}
                className="w-8 h-8 rounded-lg bg-[#1A7A3E]/10 text-primary flex items-center justify-center text-sm cursor-pointer"
                title="Mon Espace"
              >
                {currentUser.role === 'PRODUCTEUR' ? '🌾' : currentUser.role === 'AGENT' ? '📋' : '🏛️'}
              </div>
            )}
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
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl py-4 px-4 space-y-3 animate-fadeIn">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as any)}
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

          {/* Mobile Auth controller */}
          <div className="border-t border-slate-100 pt-3">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                    {currentUser.role === 'PRODUCTEUR' ? '🌾' : currentUser.role === 'AGENT' ? '📋' : '🏛️'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {currentUser.nom}
                    </p>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                      {currentUser.role} • {currentUser.region}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-red-50 hover:bg-red-100/80 text-red-700 text-xs font-bold uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 font-extrabold" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onTriggerLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#1A7A3E] to-primary text-white text-xs font-black uppercase tracking-widest rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4 text-accent animate-pulse" />
                <span>Espace Membres (Connexion)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

