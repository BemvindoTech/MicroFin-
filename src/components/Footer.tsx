import React from 'react';
import { Mail, Phone, MapPin, Compass, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  setCurrentPage: (page: 'accueil' | 'offres' | 'contact' | 'terrain') => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-350 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand & Purpose */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">
              🌿
            </div>
            <span className="font-display font-extrabold text-xl text-white tracking-tight">
              MicroFin
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
            Plateforme sénégalaise d’inclusion financière dédiée à l’autonomisation des petits exploitants maraîchers, arboriculteurs et producteurs ruraux par la technologie USSD & Tontine.
          </p>
          <div className="text-[11px] text-slate-500 font-medium">
            Projet pilier d’innovation rurale pour le Sénégal, de Saint-Louis à Kaolack.
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Navigation
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <button 
                onClick={() => { setCurrentPage('accueil'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-primary transition"
              >
                Accueil / Concept
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setCurrentPage('offres'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-primary transition"
              >
                Nos Offres de Microfinance
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setCurrentPage('terrain'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-primary transition"
              >
                🌾 Saisie Données Terrain
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setCurrentPage('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="hover:text-primary transition"
              >
                Nous Contacter / GIE
              </button>
            </li>
          </ul>
        </div>

        {/* Local Support Contacts */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Contact local
          </h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex gap-2.5 items-start">
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>Avenue Cheikh Anta Diop, Dakar, Sénégal</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>+221 33 800 00 00</span>
            </li>
            <li className="flex gap-2.5 items-center">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>contact@microfin.sn</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Legal Disclaimers & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            &copy; {currentYear} <strong>MicroFin Sénégal</strong>. Tous droits réservés.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Mentions Légales & agrément BCEAO</span>
            <span className="text-slate-800">|</span>
            <span className="hover:text-slate-400 cursor-pointer">Politique de Confidentialité</span>
            <span className="text-slate-800">|</span>
            <span className="hover:text-slate-400 cursor-pointer">CNAAS Particuliers</span>
          </div>
        </div>
        
        {/* Made with love info */}
        <div className="text-center text-[10px] text-slate-600 mt-6 flex items-center justify-center gap-1.5">
          <span>Développé pour l'écosystème maraîcher du Sénégal</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
        </div>
      </div>
    </footer>
  );
}
