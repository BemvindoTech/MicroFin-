import React, { useState } from 'react';
import { OFFRES_DATA } from '../data';
import { Offre } from '../types';
import { Filter, Search, ShieldAlert, Sparkles, Smartphone, Check, HelpCircle, ArrowRight, X, PhoneCall, Wallet, Bot, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OffersPage() {
  const [selectedFilter, setSelectedFilter] = useState<'Tous' | 'Crédit' | 'Assurance' | 'Tontine'>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null);
  const [subscriptionPhone, setSubscriptionPhone] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // States for AI Agent Assistance
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10s timeout specification

    try {
      const response = await fetch('https://api.dify.ai/v1/workflows/run', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer app-Rlbtl3SCBMepG2VzHXOjBUXM',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: { query: aiQuery },
          response_mode: 'blocking',
          user: 'user-greensprint-' + Date.now()
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Network error');
      }

      const responseData = await response.json();
      
      // Spec: "Succès : afficher response.data.outputs dans la zone résultat"
      if (responseData && responseData.data && responseData.data.outputs) {
        setAiResponse(responseData.data.outputs);
      } else if (responseData && responseData.outputs) {
        setAiResponse(responseData.outputs);
      } else {
        setAiResponse(responseData || "Aucune information trouvée");
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        setAiError("La réponse prend trop de temps — réessayez");
      } else {
        setAiError("Service temporairement indisponible");
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Filters logic
  const filteredOffres = OFFRES_DATA.filter((offre) => {
    const matchesFilter = selectedFilter === 'Tous' || offre.categorie === selectedFilter;
    const matchesSearch =
      offre.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offre.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offre.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriptionPhone) return;
    
    setSubscriptionLoading(true);
    setTimeout(() => {
      setSubscriptionLoading(false);
      setSubscriptionSuccess(true);
    }, 1500);
  };

  const handleCloseModal = () => {
    setSelectedOffre(null);
    setSubscriptionPhone('');
    setSubscriptionSuccess(false);
  };

  const mockQuickSubscription = (offre: Offre) => {
    setSelectedOffre(offre);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fadeIn">
      
      {/* HEADER SECTION OF OFFERS */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
          Catalogue & Solutions
        </span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-slate-950">
          Nos Solutions MicroFinancières
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Découvrez notre gamme complète d’offres adaptées aux conditions réelles de l’agriculture sénégalaise. Pas de caution bancaire requise, pas de titre foncier réclamé.
        </p>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-6 shadow-sm space-y-4 md:space-y-0 md:flex items-center justify-between gap-6">
        
        {/* Filter categories */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Tous', 'Crédit', 'Assurance', 'Tontine'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-slate-50 text-slate-600 hover:text-primary hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            placeholder="Rechercher par culture, zone (ex: Kaolack)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all text-slate-800"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* OFFERS GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout animate-duration-300">
          {filteredOffres.map((offre) => (
            <motion.div
              layout
              key={offre.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group"
            >
              {/* Category indicator background */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 to-transparent opacity-60 rounded-tr-2xl pointer-events-none -z-10"></div>
              
              <div className="space-y-4">
                {/* Header of card */}
                <div className="flex justify-between items-start gap-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    offre.categorie === 'Crédit' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : offre.categorie === 'Assurance'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}>
                    {offre.categorie}
                  </span>

                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    offre.statut === 'Disponible'
                      ? 'text-emerald-700 bg-emerald-500/10'
                      : 'text-red-700 bg-red-500/10'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      offre.statut === 'Disponible' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}></span>
                    {offre.statut}
                  </span>
                </div>

                {/* Title and zone */}
                <div>
                  <h3 className="font-display font-extrabold text-slate-900 text-lg group-hover:text-primary transition-colors leading-snug">
                    {offre.titre}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                    📍 {offre.zone}
                  </p>
                </div>

                {/* Short Description */}
                <p className="text-slate-600 text-xs leading-relaxed">
                  {offre.description}
                </p>
              </div>

              {/* Price and Action button */}
              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Prix d'accès</span>
                  <span className="font-display font-extrabold text-lg text-slate-950">
                    {offre.prixText}
                  </span>
                </div>

                <button
                  onClick={() => mockQuickSubscription(offre)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    offre.statut === 'Disponible'
                      ? 'bg-primary hover:bg-primary-hover text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                  disabled={offre.statut !== 'Disponible'}
                >
                  <span>Détails & Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* EMPTY STATE */}
      {filteredOffres.length === 0 && (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl text-slate-400 mx-auto">
            🔍
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-950">Aucun résultat trouvé</h4>
            <p className="text-slate-500 text-xs">
              Nous n'avons aucune offre correspondant à vos critères de filtres ou de recherche actuels. Essayez d'élargir vos termes.
            </p>
          </div>
          <button
            onClick={() => { setSelectedFilter('Tous'); setSearchQuery(''); }}
            className="text-primary text-xs font-semibold underline hover:text-primary-hover"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* SECTION AGENT IA */}
      <section className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 space-y-6 max-w-4xl mx-auto shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              🌿
            </div>
            <div>
              <h3 className="font-display font-extrabold text-slate-900 text-xl flex items-center gap-2">
                Conseiller Virtuel MicroFin
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Une question sur nos 6 offres de crédit, d'assurance ou de tontine ? L'IA vous répond instantanément.
              </p>
            </div>
          </div>
          <span className="self-start sm:self-center bg-accent/10 border border-accent/25 text-accent text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Agent intelligent
          </span>
        </div>

        {/* Form to ask */}
        <form onSubmit={handleAiSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                required
                disabled={aiLoading}
                placeholder="Posez votre question sur les prix et disponibilités..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary disabled:opacity-65 rounded-xl py-3 px-4 pl-11 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all text-slate-800"
              />
              <Bot className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={aiLoading}
              style={{ backgroundColor: '#059669' }}
              className="px-5 py-3 hover:bg-[#047857] text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-950/10 cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-65"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <span>Demander à l'agent 🌿</span>
                  <Send className="w-3.5 h-3.5 text-accent" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* RESULTS REGION */}
        {(aiLoading || aiResponse || aiError) && (
          <div className="bg-slate-100/70 border border-slate-200/60 rounded-2xl p-4 md:p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200/40 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Résultat de la consultation
              </span>
              {aiLoading && (
                <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 rounded-full animate-pulse">
                  Génération en cours...
                </span>
              )}
            </div>

            {/* Error view */}
            {aiError && (
              <p className="text-red-600 font-semibold text-xs md:text-sm animate-fadeIn">
                ⚠️ {aiError}
              </p>
            )}

            {/* Loading spinner */}
            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-[11px] text-slate-500 font-medium">Recherche d'informations en cours...</span>
              </div>
            )}

            {/* Response view */}
            {aiResponse && !aiLoading && (
              <div className="animate-fadeIn prose prose-sm max-w-none">
                {(() => {
                  if (!aiResponse) return null;
                  if (typeof aiResponse === 'string') {
                    return <p className="text-slate-700 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{aiResponse}</p>;
                  }
                  
                  const textValue = aiResponse.text || aiResponse.result || aiResponse.output || aiResponse.response;
                  if (typeof textValue === 'string') {
                    return <p className="text-slate-700 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{textValue}</p>;
                  }

                  return (
                    <div className="space-y-3 font-sans text-xs sm:text-sm">
                      {Object.entries(aiResponse).map(([key, val]) => {
                        if (typeof val === 'string' || typeof val === 'number') {
                          return (
                            <div key={key} className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-150">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{key} :</span>
                              <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{val}</p>
                            </div>
                          );
                        }
                        return (
                          <div key={key} className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-150">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{key} :</span>
                            <pre className="text-[11px] font-mono bg-slate-900 text-white p-3 rounded-lg overflow-x-auto">
                              {JSON.stringify(val, null, 2)}
                            </pre>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 pt-2 items-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Questions suggérées :</span>
          {[
            "Quels sont les prix des assurances à Kaolack ?",
            "Est-ce que le crédit semences Niayes est disponible ?",
            "Quel est le prix pour le mini prêt intrants à Fatick ?"
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setAiQuery(suggestion)}
              className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 text-[10px] md:text-xs py-1.5 px-3 rounded-full transition cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      {/* DETAIL MODAL / SUBSCRIPTION CONTEXT */}
      <AnimatePresence>
        {selectedOffre && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden relative border border-slate-100"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition text-slate-600 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 md:p-8 space-y-6">
                
                {/* Header details */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {selectedOffre.categorie}
                    </span>
                    <span className="text-[11px] text-slate-400 font-bold">•</span>
                    <span className="text-xs text-slate-500 font-semibold">{selectedOffre.zone}</span>
                  </div>
                  <h3 className="font-display font-extrabold text-slate-900 text-2xl leading-tight">
                    {selectedOffre.titre}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl space-y-1.5 border border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Description générale :</p>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {selectedOffre.description}
                    </p>
                  </div>

                  {/* Fiche Technique Bullet Points */}
                  <div className="space-y-3">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                      Fiche technique :
                    </span>
                    <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                      {selectedOffre.ficheTechnique.map((tech, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subscribing / USSD simulation guide */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Souscription rapide</span>
                      <p className="text-xs text-slate-300">Code USSD direct à utiliser sur votre mobile :</p>
                    </div>
                    <code className="text-accent text-sm md:text-base font-extrabold bg-slate-950 px-3 py-1.5 rounded-lg tracking-wider border border-slate-800">
                      {selectedOffre.codeUSSD}
                    </code>
                  </div>

                  <hr className="border-slate-800" />

                  {/* Simulated Subscription form inside Modal */}
                  {!subscriptionSuccess ? (
                    <form onSubmit={handleSubscribeSubmit} className="space-y-3">
                      <label className="text-xs text-slate-300 font-medium block">
                        Entrez votre numéro de téléphone (Wave ou Orange Money) :
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            placeholder="77 123 45 67"
                            required
                            pattern="^(77|78|76|75|70)[0-9]{7}$"
                            value={subscriptionPhone}
                            onChange={(e) => setSubscriptionPhone(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 pl-11 text-xs focus:outline-none focus:border-primary text-white"
                          />
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">🇸🇳</span>
                        </div>
                        <button
                          type="submit"
                          disabled={subscriptionLoading}
                          className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          {subscriptionLoading ? 'Envoi...' : 'Souscrire'}
                        </button>
                      </div>
                      <span className="block text-[10px] text-slate-500 italic">
                        Format : Sénégalais (ex : 771234567, 78..., 76...)
                      </span>
                    </form>
                  ) : (
                    <div className="bg-emerald-950/40 border border-emerald-900 rounded-xl p-4 text-center space-y-2">
                      <p className="text-emerald-400 font-bold text-xs">⭐ SIMULATION COMPLÈTÉE ⭐</p>
                      <p className="text-[11px] text-slate-300">
                        Votre demande a été initiée. Allez à l'accueil pour tester le <strong>Simulateur USSD interactif</strong> et valider la transaction directement sur le panneau du téléphone !
                      </p>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="text-accent font-bold text-xs hover:underline mt-1"
                      >
                        Fermer cet écran
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
