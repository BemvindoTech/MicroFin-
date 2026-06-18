import React, { useRef } from 'react';
import { STATS, FAQS } from '../data';
import UssdSimulator from './UssdSimulator';
import { Play, ShieldCheck, Milestone, CheckCircle, ArrowRight, Sparkles, Smartphone, Landmark, HeartHandshake } from 'lucide-react';

import { User } from '../types';

interface HomePageProps {
  setCurrentPage: (page: 'accueil' | 'offres' | 'contact' | 'terrain' | 'dashboard') => void;
  currentUser?: User | null;
  onTriggerLogin?: () => void;
}

export default function HomePage({ setCurrentPage, currentUser, onTriggerLogin }: HomePageProps) {
  const simulatorRef = useRef<HTMLDivElement>(null);

  const scrollToSimulator = () => {
    simulatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-transparent to-transparent pt-12 md:pt-16">
        
        {/* Background graphic elements */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-20 left-10 w-[200px] h-[200px] bg-accent/5 rounded-full blur-2xl -z-10 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-accent" />
            <span>Inclusion Financière par USSD & Tontine Mobile</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight">
            Cultivez votre autonomie avec <span className="text-primary relative inline-block">
              MicroFin
              <span className="absolute left-0 bottom-1 w-full h-1 bg-accent rounded"></span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            La première plateforme sénégalaise qui permet aux maraîchers et arboriculteurs d'épargner par tontine numérique et de débloquer des micro-crédits agricoles par simple code SMS/USSD, sans titre foncier.
          </p>

          {/* Dynamic CTAs based on login status */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            {currentUser ? (
              <button
                onClick={() => {
                  if (currentUser.role === 'AGENT') {
                    setCurrentPage('terrain');
                  } else {
                    setCurrentPage('dashboard');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-emerald-705 text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Accéder à Mon Espace ({currentUser.role === 'PRODUCTEUR' ? '🌾' : currentUser.role === 'AGENT' ? '📋' : '🏛️'})</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={onTriggerLogin}
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-emerald-705 text-white font-semibold rounded-2xl shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Commencer / S'inscrire 🎉</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            <button
              onClick={scrollToSimulator}
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-200 text-slate-800 hover:text-primary hover:border-primary font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Smartphone className="w-5 h-5 text-accent" />
              <span>Simulateur USSD</span>
            </button>
          </div>

          {/* Phone metadata tags */}
          <div className="flex justify-center items-center gap-6 text-xs text-slate-500 pt-3">
            <span className="flex items-center gap-1">✅ Sans smartphone requis</span>
            <span>•</span>
            <span className="flex items-center gap-1">🌾 Agrément CNAAS</span>
            <span>•</span>
            <span className="flex items-center gap-1">🇸🇳 Partout au Sénégal</span>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {STATS.map((stat, i) => (
            <div key={i} className="p-8 space-y-2 text-center md:text-left transition-colors hover:bg-slate-50/50">
              <div className="text-3xl md:text-4xl font-display font-extrabold text-primary">
                {stat.valeur}
              </div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                {stat.label}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS / VALUES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-accent font-bold text-xs uppercase tracking-widest">
            Simplicité & Confiance
          </span>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Pourquoi choisir MicroFin Sénégal ?
          </h2>
          <p className="text-slate-500 text-sm">
            Notre technologie remplace le besoin de paperasse administrative par la confiance communautaire locale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all shadow-sm space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl font-bold">
              📶
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Fonctionne hors-ligne (USSD)</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Pas besoin de connexion internet coûteuse ou de smartphone dernière génération. Composez des codes sécurisés sur votre mobile traditionnel pour initier vos requêtes n'importe où.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all shadow-sm space-y-4">
            <div className="w-12 h-12 bg-accent/110 bg-amber-50 rounded-xl flex items-center justify-center text-accent text-xl font-bold">
              👥
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Solidarité des Tontines</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Vos cotisations régulières dans la tontine locale constituent votre historique de solvabilité numérique. Plus vous êtes assidu dans votre groupe de producteurs (GIE), plus votre accès au financement est simple.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all shadow-sm space-y-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-primary text-xl font-bold">
              🛰️
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Assurance par Satellite</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              En partenariat exclusif avec la CNAAS, nous indexons vos polices d'assurance sur des données météorologiques satellitaires réelles. Le paiement du sinistre se déclenche automatiquement en cas de sécheresse.
            </p>
          </div>
        </div>
      </section>

      {/* SIMULATOR CONTAINER SECTION (TARGET OF SCROLL) */}
      <section ref={simulatorRef} className="bg-slate-100/50 py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-primary font-bold text-xs uppercase tracking-widest">
              Laboratoire Alternatif
            </span>
            <h2 className="text-3xl font-display font-bold text-slate-900">
              Testez notre module USSD interactif
            </h2>
            <p className="text-slate-500 text-sm">
              Découvrez exactement comment un agriculteur de Kaffrine ou des Niayes gère sa campagne maraîchère de A à Z.
            </p>
          </div>

          <UssdSimulator />
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-accent font-bold text-xs uppercase tracking-widest">
            Foire Aux Questions
          </span>
          <h2 className="text-3xl font-display font-bold text-slate-900">
            Pour tout comprendre en quelques minutes
          </h2>
          <p className="text-slate-500 text-sm">
            Toutes les réponses pour démarrer sereinement l’accompagnement de votre exploitation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 flex items-start gap-2 text-sm leading-snug">
                <span className="text-accent mt-0.5">🌾</span>
                {faq.q}
              </h4>
              <p className="text-slate-600 text-xs leading-relaxed pl-6">
                {faq.r}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-primary-hover rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Subtle design element */}
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
              Prêt à numériser votre GIE local ?
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Inscrivez votre groupement d'intérêt économique ou votre tontine communautaire dès aujourd’hui pour offrir des solutions simples de crédit et d’assurance à tous vos membres.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0 z-10">
            <button
              onClick={() => {
                setCurrentPage('contact');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-accent hover:bg-accent-hover text-slate-950 font-bold rounded-xl shadow-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>S'enregistrer</span>
            </button>
            <button
              onClick={() => {
                setCurrentPage('offres');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Consulter la liste</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
