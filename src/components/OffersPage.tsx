import React, { useState, useEffect } from 'react';
import { OFFRES_DATA } from '../data';
import { Offre, User } from '../types';
import { 
  Filter, Search, ShieldAlert, Sparkles, Smartphone, Check, HelpCircle, 
  ArrowRight, X, PhoneCall, Wallet, Bot, Send, Loader2, Play, Pause, 
  Volume2, VolumeX, Activity, Languages, Mic, MicOff, Globe, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OffersPageProps {
  currentUser?: User | null;
  onUpdateUser?: (updatedUser: User) => void;
  onTriggerLogin?: () => void;
}

export default function OffersPage({ currentUser, onUpdateUser, onTriggerLogin }: OffersPageProps) {
  const [selectedFilter, setSelectedFilter] = useState<'Tous' | 'Crédit' | 'Assurance' | 'Tontine'>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null);
  const [subscriptionPhone, setSubscriptionPhone] = useState('');
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // New states for Platform direct subscription
  const [activeSubTab, setActiveSubTab] = useState<'plateforme' | 'ussd'>('plateforme');
  const [paymentMode, setPaymentMode] = useState<'wave' | 'orange_money' | 'solde'>('wave');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [directSubSuccess, setDirectSubSuccess] = useState(false);
  const [directSubLoading, setDirectSubLoading] = useState(false);

  // States for AI Agent Assistance
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<any>(null);

  // Dictation states for AI Agent
  const [isRecordingAgent, setIsRecordingAgent] = useState(false);
  const [isSimulatingAgent, setIsSimulatingAgent] = useState(false);
  const [simulationCountdownAgent, setSimulationCountdownAgent] = useState(3);

  // Countdown timer for vocal simulation fallback in OffersPage
  useEffect(() => {
    let intervalId: any;
    if (isRecordingAgent && isSimulatingAgent) {
      setSimulationCountdownAgent(3);
      intervalId = setInterval(() => {
        setSimulationCountdownAgent((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            completeAgentVocalSimulation();
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecordingAgent, isSimulatingAgent]);

  const completeAgentVocalSimulation = () => {
    setIsRecordingAgent(false);
    setIsSimulatingAgent(false);
    const agentQuestions = [
      "Quels sont les détails du micro-crédit Semences Niayes et est-il disponible ?",
      "Combien coûte la souscription pour la Tontine Féminine Teranga de Kaolack ?",
      "Quelle est la zone couverte par l'Assurance Climat CNAAS et que garantit-elle ?",
      "Quelles sont les conditions d'accès pour le Crédit Intrants Maraîchers ?"
    ];
    // Pick a random question
    const randomIdx = Math.floor(Math.random() * agentQuestions.length);
    setAiQuery(agentQuestions[randomIdx]);
  };

  const startAgentVoiceDictation = () => {
    stopOfferAudioSpeech();
    
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsRecordingAgent(true);
      setIsSimulatingAgent(false);
      
      try {
        const rec = new SpeechRecognition();
        rec.lang = 'fr-FR';
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onresult = (event: any) => {
          const dictationText = event.results[0][0].transcript;
          if (dictationText) {
            setAiQuery(dictationText);
          }
        };

        rec.onerror = (e: any) => {
          console.warn("L'API Audio a échoué (souvent bloqué par l'iframe/sandbox), lancement du simulateur local :", e?.error);
          triggerSimulatedAgentDictation();
        };

        rec.onend = () => {
          setIsRecordingAgent(false);
        };

        rec.start();
      } catch (error) {
        triggerSimulatedAgentDictation();
      }
    } else {
      triggerSimulatedAgentDictation();
    }
  };

  const triggerSimulatedAgentDictation = () => {
    setIsRecordingAgent(true);
    setIsSimulatingAgent(true);
    setSimulationCountdownAgent(3);
  };

  // Multilingual audio player states for Offer Details
  const [isPlayingOfferAudio, setIsPlayingOfferAudio] = useState(false);
  const [activeOfferLang, setActiveOfferLang] = useState<'fr' | 'wo' | 'sr' | 'pu' | null>(null);
  const [displayedOfferPhonetic, setDisplayedOfferPhonetic] = useState<string | null>(null);

  // Clean speech synthesis on unmount or on close modal
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const translateAndPlayOfferSpeech = (offre: Offre, lang: 'fr' | 'wo' | 'sr' | 'pu') => {
    if (!('speechSynthesis' in window)) {
      alert("La synthèse vocale n'est pas supportée dans votre navigateur.");
      return;
    }

    window.speechSynthesis.cancel();
    setActiveOfferLang(lang);
    setIsPlayingOfferAudio(true);

    if (lang === 'fr') {
      const description = `Offre de ${offre.categorie} : ${offre.titre} pour la zone de ${offre.zone}. ${offre.description}. Statut : ${offre.statut}. Prix de souscription : ${offre.prixText}.`;
      setDisplayedOfferPhonetic("Lecture audio en Français...");
      
      const utterance = new SpeechSynthesisUtterance(description);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.onend = () => {
        setIsPlayingOfferAudio(false);
        setActiveOfferLang(null);
        setDisplayedOfferPhonetic(null);
      };
      utterance.onerror = () => {
        setIsPlayingOfferAudio(false);
        setActiveOfferLang(null);
        setDisplayedOfferPhonetic(null);
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    let phoneticText = "";
    let label = "";

    if (lang === 'wo') {
      label = "Traduction en Wolof 🇸🇳";
      phoneticText = `Solution ${offre.categorie} : facké "${offre.titre}" ci dadi Kaw-lack ak Fatick. Bi-né, dadi nay bakh ci yone, prix bi mo-gui doon ${offre.prixText}. Sou-kré-bel direct ci sa téléphone bi bo déffé, code bi dadi nay dakh.`;
    } else if (lang === 'sr') {
      label = "Traduction en Sereer 🇸🇳";
      phoneticText = `Mboléne "${offre.titre}" co ko-par we, mbaris o yor ci mboléne faté-diougor o lorr co assurance. Prix o yor co ${offre.prixText}.`;
    } else if (lang === 'pu') {
      label = "Traduction en Pulaar 🇸🇳";
      phoneticText = `Gollé ma faye ou-juneré, kisal tontine e jam! "${offre.titre}" iné woodi kisal handé e mbuudu ${offre.prixText}.`;
    }

    setDisplayedOfferPhonetic(`${label} : "${phoneticText}"`);

    const utterance = new SpeechSynthesisUtterance(phoneticText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.78;
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setIsPlayingOfferAudio(false);
      setActiveOfferLang(null);
      setDisplayedOfferPhonetic(null);
    };
    utterance.onerror = () => {
      setIsPlayingOfferAudio(false);
      setActiveOfferLang(null);
      setDisplayedOfferPhonetic(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopOfferAudioSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingOfferAudio(false);
    setActiveOfferLang(null);
    setDisplayedOfferPhonetic(null);
  };

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
    setDirectSubSuccess(false);
    setDirectSubLoading(false);
    setGuestName('');
    setGuestPhone('');
    setActiveSubTab('plateforme');
    setPaymentMode('wave');
    stopOfferAudioSpeech();
  };

  const handleDirectSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffre) return;

    setDirectSubLoading(true);

    setTimeout(() => {
      let subNom = currentUser?.nom || guestName || 'Anonyme';
      let subPhone = currentUser?.telephone || guestPhone || 'Inconnu';
      
      // If paying by balance, perform check & deduct if user is logged in
      if (paymentMode === 'solde' && currentUser) {
        const cost = selectedOffre.prixNombre || 0;
        const currentSolde = currentUser.soldeEpargne || 0;
        if (currentSolde < cost) {
          alert(`Votre solde d'épargne (${currentSolde.toLocaleString()} FCFA) est insuffisant pour payer cette offre (${cost.toLocaleString()} FCFA). Veuillez cotiser davantage ou choisir un autre moyen de paiement.`);
          setDirectSubLoading(false);
          return;
        }
        
        if (onUpdateUser) {
          onUpdateUser({
            ...currentUser,
            soldeEpargne: currentSolde - cost
          });
        }
      }

      // Add to microfin_platform_subscriptions in localStorage
      const activeSubs = JSON.parse(localStorage.getItem('microfin_platform_subscriptions') || '[]');
      const newSub = {
        id: 'SUB_' + Math.floor(Math.random() * 1000000),
        userId: currentUser?.id || 'GUEST',
        userNom: subNom,
        userPhone: subPhone,
        offreId: selectedOffre.id,
        offreTitre: selectedOffre.titre,
        offreCategorie: selectedOffre.categorie,
        offrePrix: selectedOffre.prixNombre || 0,
        dateSouscription: new Date().toLocaleDateString('fr-FR'),
        statut: 'Actif',
        modePaiement: paymentMode === 'solde' ? 'Épargne' : paymentMode === 'wave' ? 'Wave' : 'Orange Money'
      };
      
      activeSubs.unshift(newSub);
      localStorage.setItem('microfin_platform_subscriptions', JSON.stringify(activeSubs));

      // Log in microfin_activity_logs
      const logList = JSON.parse(localStorage.getItem('microfin_activity_logs') || '[]');
      logList.unshift({
        id: 'LOG_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString('fr-FR'),
        text: `Souscription DIRECTE PLATEFORME de l'offre [${selectedOffre.titre}] par ${subNom}`
      });
      localStorage.setItem('microfin_activity_logs', JSON.stringify(logList));

      setDirectSubLoading(false);
      setDirectSubSuccess(true);
    }, 1200);
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

        {/* Form to ask with Voice Dictation Option */}
        <form onSubmit={handleAiSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="aiQueryInput" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block font-sans">
              Votre message à l'Agent IA
            </label>

            {/* Voice Dictation Button for Agent */}
            <button
              type="button"
              onClick={startAgentVoiceDictation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                isRecordingAgent
                  ? 'bg-red-500 border-red-250 text-white animate-pulse'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-150 text-[#1A7A3E]'
              }`}
              title="Formuler ma question de vive voix"
            >
              {isRecordingAgent ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-white" />
                  <span>{isSimulatingAgent ? `Écoute (${simulationCountdownAgent}s)` : 'Enregistrement...'}</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#1A7A3E]" />
                  <span>Poser ma question de vive voix 🎙️</span>
                </>
              )}
            </button>
          </div>

          {/* Recording / Simulating Indicator Panel */}
          {isRecordingAgent && (
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex gap-2.5 items-start">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping mt-1"></span>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-[#1A7A3E] uppercase tracking-wider block">
                    Mode Dictée Microphone Actif
                  </span>
                  <p className="text-xs text-slate-600 font-medium font-sans">
                    {isSimulatingAgent 
                      ? `L'accès direct au micro est restreint par l'iFrame de prévisualisation sécurisée. Simulation active : entrée détectée d'ici ${simulationCountdownAgent}s.` 
                      : "Microphone activé avec succès. Parlez maintenant pour dicter votre question."
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5 items-center shrink-0">
                <span className="w-1 h-3 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                <span className="w-1 h-4.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                id="aiQueryInput"
                type="text"
                required
                disabled={aiLoading}
                placeholder="Posez votre question sur les prix, garanties, conditions..."
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

                {/* Multilingual Local Speech TTS Audio Deck inside Modal */}
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-150 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎙️</span>
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#1A7A3E] font-extrabold uppercase tracking-widest block">Lecteur Vocal Traducteur</span>
                        <p className="text-[11px] text-slate-600 font-medium">Écouter les détails en langue locale :</p>
                      </div>
                    </div>
                    {isPlayingOfferAudio && (
                      <button
                        type="button"
                        onClick={stopOfferAudioSpeech}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-700 text-[10px] uppercase tracking-wider font-bold py-1 px-2.5 rounded-full border border-red-200 transition cursor-pointer"
                      >
                        Arrêter
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'fr', label: 'Français 🇫🇷' },
                      { id: 'wo', label: 'Wolof 🇸🇳' },
                      { id: 'sr', label: 'Sereer 🇸🇳' },
                      { id: 'pu', label: 'Pulaar 🇸🇳' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => translateAndPlayOfferSpeech(selectedOffre, btn.id as any)}
                        className={`py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          activeOfferLang === btn.id
                            ? 'bg-primary text-white shadow'
                            : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-705'
                        }`}
                      >
                        <Play className="w-2.5 h-2.5 shrink-0" />
                        <span>{btn.label}</span>
                      </button>
                    ))}
                  </div>

                  {isPlayingOfferAudio && (
                    <div className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between gap-2.5 animate-fadeIn">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Activity className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" />
                        <span className="text-[10px] text-slate-500 font-medium italic truncate">
                          {displayedOfferPhonetic}
                        </span>
                      </div>
                      <div className="flex gap-0.5 items-end h-3 shrink-0">
                        <span className="w-0.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-0.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-0.5 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dual Subscriptions Methods Box (Platform & USSD) */}
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-4">
                  
                  {/* Tab Headers */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('plateforme')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeSubTab === 'plateforme'
                          ? 'bg-primary text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Plateforme Directe</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('ussd')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        activeSubTab === 'ussd'
                          ? 'bg-primary text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5 text-accent" />
                      <span>Code USSD (Manuel)</span>
                    </button>
                  </div>

                  {activeSubTab === 'plateforme' ? (
                    /* PLATFORM ACTIVE METHOD */
                    !directSubSuccess ? (
                      <form onSubmit={handleDirectSubscriptionSubmit} className="space-y-4 pt-1">
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          Réglez votre pack de manière digitale et autonome directement sur la plateforme avec activation automatique :
                        </p>

                        {/* Customer Information Form */}
                        {currentUser ? (
                          <div className="bg-slate-950/45 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1">
                            <p className="text-slate-400 font-medium">✨ Client connecté identifié :</p>
                            <p className="font-bold text-slate-200">
                              {currentUser.nom} • {currentUser.telephone} ({currentUser.role})
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-3 bg-amber-500/10 border border-amber-900/30 rounded-xl">
                              <p className="text-[10px] text-slate-300 leading-relaxed">
                                <strong className="text-accent">💡 ASTUCE :</strong> Connectez-vous d'abord à votre espace membre pour accumuler vos bonus sur votre livret d'épargne agricole et accéder à d'autres outils !
                              </p>
                              <button
                                type="button"
                                onClick={onTriggerLogin}
                                className="mt-1.5 text-[10px] text-accent font-bold hover:underline"
                              >
                                Se connecter / S'ouvrir un compte 🔑
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Votre Nom complet :</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Demba Coulibaly"
                                  required
                                  value={guestName}
                                  onChange={(e) => setGuestName(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-primary rounded-xl py-2 px-3 text-xs text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Téléphone :</label>
                                <input
                                  type="tel"
                                  placeholder="77 123 45 67"
                                  required
                                  pattern="^(77|78|76|75|70)[0-9]{7}$"
                                  value={guestPhone}
                                  onChange={(e) => setGuestPhone(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 focus:border-primary rounded-xl py-2 px-3 text-xs text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* payment method selection */}
                        <div className="space-y-2">
                          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Moyen de paiement :</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMode('wave')}
                              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                paymentMode === 'wave'
                                  ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold text-xs'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white text-xs font-medium'
                              }`}
                            >
                              <span>🌊 Wave</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMode('orange_money')}
                              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                paymentMode === 'orange_money'
                                  ? 'bg-orange-600/10 border-orange-500 text-orange-400 font-bold text-xs'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white text-xs font-medium'
                              }`}
                            >
                              <span>🍊 Orange</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPaymentMode('solde')}
                              disabled={!currentUser}
                              className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                !currentUser ? 'opacity-35 cursor-not-allowed' : ''
                              } ${
                                paymentMode === 'solde'
                                  ? 'bg-emerald-600/10 border-emerald-550 text-emerald-400 font-bold text-xs'
                                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white text-xs font-medium'
                              }`}
                              title={!currentUser ? "Connectez-vous pour utiliser votre épargne" : `Votre Solde : ${currentUser.soldeEpargne || 0} FCFA`}
                            >
                              <span>🌾 Solde</span>
                              <span className="text-[9px] scale-90 truncate leading-none">
                                {currentUser ? `${(currentUser.soldeEpargne || 0).toLocaleString()} F` : 'Non-connecté'}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex justify-between items-center gap-4">
                          <div className="text-left leading-normal">
                            <span className="text-[10px] text-slate-400 block font-semibold">Montant à régler :</span>
                            <span className="text-base font-black text-white font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {selectedOffre.prixNombre > 0 ? `${selectedOffre.prixNombre.toLocaleString()} FCFA` : 'Gratuit'}
                            </span>
                          </div>
                          <button
                            type="submit"
                            disabled={directSubLoading}
                            className="bg-primary hover:bg-[#1A7A3E] text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/20"
                          >
                            {directSubLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Traitement...</span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 text-accent" />
                                <span>Activer Souscription</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-emerald-950/40 border border-emerald-900 rounded-xl p-5 text-center space-y-3 animate-fadeIn">
                        <span className="text-2xl block">🎉</span>
                        <p className="text-emerald-400 font-black text-xs uppercase tracking-wide">Souscription Directe Validée !</p>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                          Félicitations, votre offre est désormais active sur votre profil ! Les privilèges et garanties correspondantes ont été activées avec succès.
                        </p>
                        {currentUser && (
                          <p className="text-[10px] text-emerald-300 font-bold">
                            Vous pouvez dès maintenant visualiser et gérer cette souscription directe dans votre <strong>Espace Membres</strong> !
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleCloseModal}
                          className="px-6 py-2 bg-primary hover:bg-[#1A7A3E] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer mt-2"
                        >
                          Fermer cet écran
                        </button>
                      </div>
                    )
                  ) : (
                    /* USSD HISTORICAL METHOD ACTIVE */
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Souscription rapide</span>
                          <p className="text-xs text-slate-300 font-medium">Faites-la sur votre application à l'aide de ce code :</p>
                        </div>
                        <code className="text-accent text-sm md:text-base font-extrabold bg-slate-950 px-3 py-1.5 rounded-lg tracking-wider border border-slate-800">
                          {selectedOffre.codeUSSD}
                        </code>
                      </div>

                      <hr className="border-slate-800" />

                      {/* Simulated Subscription form inside Modal */}
                      {!subscriptionSuccess ? (
                        <form onSubmit={handleSubscribeSubmit} className="space-y-3">
                          <label className="text-xs text-slate-300 font-semibold block">
                            Entrez votre numéro de téléphone (Wave ou Orange Money) pour simuler par USSD :
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
                              className="bg-primary hover:bg-[#1A7A3E] text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              {subscriptionLoading ? 'Envoi...' : 'Souscrire'}
                            </button>
                          </div>
                          <span className="block text-[10px] text-slate-500 italic">
                            Format : Sénégalais (ex : 771234567, 78..., 76...)
                          </span>
                        </form>
                      ) : (
                        <div className="bg-emerald-950/40 border border-emerald-900 rounded-xl p-4 text-center space-y-2 animate-fadeIn">
                          <p className="text-emerald-400 font-bold text-xs">⭐ SIMULATION COMPLÈTÉE ⭐</p>
                          <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                            Votre demande a été initiée. Allez à l'accueil pour tester le <strong>Simulateur USSD interactif</strong> et valider la transaction directement sur le panneau du téléphone !
                          </p>
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="text-accent font-bold text-xs hover:underline mt-1 cursor-pointer"
                          >
                            Fermer cet écran
                          </button>
                        </div>
                      )}
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
