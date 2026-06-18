import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Send, Brain, CloudRain, Satellite, Compass, HelpCircle, 
  ArrowRight, Loader2, Volume2, Bookmark, RefreshCw, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

interface AiSowingCompanionProps {
  currentUser?: User | null;
}

// Full geographical matching data with the actual MeteoPage DEPARTEMENTS_METEO indicators
interface DepMeteoSummary {
  id: string;
  nom: string;
  regionParent: string;
  statutDrought: string;
  ndvi: number;
  pluviometrieCumulee: number;
  pluviometrieMoyenne: number;
  temperature: number;
  humidite: number;
}

const DEPARTEMENTS_DUMP: Record<string, DepMeteoSummary> = {
  podor: {
    id: 'podor', nom: 'Podor', regionParent: 'Saint-Louis',
    statutDrought: 'CRITIQUE', ndvi: 0.24, pluviometrieCumulee: 110, pluviometrieMoyenne: 240, temperature: 41, humidite: 22
  },
  linguere: {
    id: 'linguere', nom: 'Linguère', regionParent: 'Louga (Zone Ferlo)',
    statutDrought: 'ALERTE', ndvi: 0.32, pluviometrieCumulee: 180, pluviometrieMoyenne: 290, temperature: 39, humidite: 31
  },
  kaolack: {
    id: 'kaolack', nom: 'Kaolack', regionParent: 'Bassin Arachidier',
    statutDrought: 'NORMALE', ndvi: 0.48, pluviometrieCumulee: 420, pluviometrieMoyenne: 440, temperature: 34, humidite: 55
  },
  matam: {
    id: 'matam', nom: 'Matam', regionParent: 'Sénégal Oriental',
    statutDrought: 'CRITIQUE', ndvi: 0.21, pluviometrieCumulee: 140, pluviometrieMoyenne: 310, temperature: 42, humidite: 18
  },
  dakar: {
    id: 'dakar', nom: 'Dakar', regionParent: 'Presqu\'île / Côtier',
    statutDrought: 'NORMALE', ndvi: 0.58, pluviometrieCumulee: 310, pluviometrieMoyenne: 310, temperature: 28, humidite: 78
  },
  thies: {
    id: 'thies', nom: 'Thiès', regionParent: 'Zone Niayes Horticole',
    statutDrought: 'NORMALE', ndvi: 0.46, pluviometrieCumulee: 360, pluviometrieMoyenne: 390, temperature: 31, humidite: 64
  },
  diourbel: {
    id: 'diourbel', nom: 'Diourbel', regionParent: 'Bassin Arachidier',
    statutDrought: 'ALERTE', ndvi: 0.34, pluviometrieCumulee: 210, pluviometrieMoyenne: 330, temperature: 36, humidite: 41
  },
  fatick: {
    id: 'fatick', nom: 'Fatick', regionParent: 'Sine-Saloum Côtier',
    statutDrought: 'NORMALE', ndvi: 0.42, pluviometrieCumulee: 390, pluviometrieMoyenne: 430, temperature: 33, humidite: 58
  },
  kaffrine: {
    id: 'kaffrine', nom: 'Kaffrine', regionParent: 'Bassin Arachidier Sud',
    statutDrought: 'NORMALE', ndvi: 0.51, pluviometrieCumulee: 510, pluviometrieMoyenne: 490, temperature: 34, humidite: 52
  },
  louga: {
    id: 'louga', nom: 'Louga', regionParent: 'Nord Sylvo-Pastoral',
    statutDrought: 'ALERTE', ndvi: 0.31, pluviometrieCumulee: 160, pluviometrieMoyenne: 270, temperature: 38, humidite: 28
  },
  saintlouis: {
    id: 'saintlouis', nom: 'Saint-Louis', regionParent: 'Delta du Fleuve Sénégal',
    statutDrought: 'ALERTE', ndvi: 0.33, pluviometrieCumulee: 150, pluviometrieMoyenne: 250, temperature: 31, humidite: 69
  },
  tambacounda: {
    id: 'tambacounda', nom: 'Tambacounda', regionParent: 'Sénégal Oriental',
    statutDrought: 'NORMALE', ndvi: 0.55, pluviometrieCumulee: 610, pluviometrieMoyenne: 580, temperature: 37, humidite: 48
  },
  kedougou: {
    id: 'kedougou', nom: 'Kédougou', regionParent: 'Sud-Est Collines',
    statutDrought: 'OPTIMAL', ndvi: 0.76, pluviometrieCumulee: 980, pluviometrieMoyenne: 920, temperature: 29, humidite: 81
  },
  sedhiou: {
    id: 'sedhiou', nom: 'Sédhiou', regionParent: 'Casamance Moyenne',
    statutDrought: 'OPTIMAL', ndvi: 0.65, pluviometrieCumulee: 880, pluviometrieMoyenne: 850, temperature: 31, humidite: 75
  },
  ziguinchor: {
    id: 'ziguinchor', nom: 'Ziguinchor', regionParent: 'Basse Casamance',
    statutDrought: 'OPTIMAL', ndvi: 0.72, pluviometrieCumulee: 1040, pluviometrieMoyenne: 990, temperature: 30, humidite: 79
  },
  kolda: {
    id: 'kolda', nom: 'Kolda', regionParent: 'Haute Casamance',
    statutDrought: 'OPTIMAL', ndvi: 0.68, pluviometrieCumulee: 810, pluviometrieMoyenne: 780, temperature: 32, humidite: 70
  }
};

const CULTURES_OPTIONS = [
  { code: 'oignon', label: '🧅 Oignons', name: 'Oignons' },
  { code: 'arachide', label: '🥜 Arachide', name: 'Arachide' },
  { code: 'mil_sorgho', label: '🌾 Mil / Sorgho', name: 'Mil ou Sorgho' },
  { code: 'riz', label: '🍚 Riz fluvial sédentaire', name: 'Riz' },
  { code: 'niebe', label: '🌱 Niébé (Haricot souna)', name: 'Niébé' },
  { code: 'manioc', label: '🍠 Manioc local', name: 'Manioc' },
  { code: 'tomate_gombo', label: '🍅 Tomate et Gombo de case', name: 'Tomate ou Gombo' }
];

export default function AiSowingCompanion({ currentUser }: AiSowingCompanionProps) {
  // Try to match current user region with presets, defaulting to Louga
  const matchedPreset = Object.values(DEPARTEMENTS_DUMP).find(
    p => p.nom.toLowerCase() === (currentUser?.region || '').toLowerCase()
  ) || DEPARTEMENTS_DUMP.louga;

  const [selectedDept, setSelectedDept] = useState<DepMeteoSummary>(matchedPreset);
  const [selectedCulture, setSelectedCulture] = useState(CULTURES_OPTIONS[0]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (currentUser?.region) {
      const match = Object.values(DEPARTEMENTS_DUMP).find(p => p.nom.toLowerCase() === currentUser.region.toLowerCase());
      if (match) setSelectedDept(match);
    }
  }, [currentUser]);

  // Handle clean voice synthesis cancellation on component removal
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const triggerAnalysis = async (overridePrompt?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAiAdvice('');

    // Cancel dynamic speaking
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    const payloadPrompt = overridePrompt || customPrompt || 
      `Est-ce le bon moment pour planter des ${selectedCulture.name} à ${selectedDept.nom} d'après l'imagerie satellite NDVI actuelle de ${selectedDept.ndvi} ?`;

    try {
      const response = await fetch('/api/gemini/advice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          culture: selectedCulture.name,
          departement: selectedDept.nom,
          ndvi: selectedDept.ndvi,
          pluviometrie: selectedDept.pluviometrieCumulee,
          pluviometrieMoyenne: selectedDept.pluviometrieMoyenne,
          temperature: selectedDept.temperature,
          droughtStatut: selectedDept.statutDrought,
          regionParent: selectedDept.regionParent,
          userMessage: overridePrompt || customPrompt ? payloadPrompt : undefined
        }),
      });

      let responseData: any = null;
      try {
        responseData = await response.json();
      } catch (e) {
        // Suppress json parsing error
      }

      if (!response.ok) {
        const serverError = responseData?.error || `Erreur HTTP : ${response.status}`;
        throw new Error(serverError);
      }

      setAiAdvice(responseData?.advice || "Désolé, aucune préconisation n'a pu être formulée.");
    } catch (err: any) {
      console.error(err);
      
      // Fallback offline recommendation computed locally
      const fallbackMsg = `⚠️ **[CONNEXION EN PANNE]** L'appareil n'a pas pu joindre le conseiller de semis intelligent Gemini (Détails : ${err.message || err}). Voici l'analyse de secours locale :

### 🌾 ÉVALUATION DE L'INDICE NDVI À ${selectedDept.nom.toUpperCase()} :
Le capteur satellite indique un NDVI de **${selectedDept.ndvi}** (seuil requis de 0,35). La sécheresse est estimée comme : **${selectedDept.statutDrought}**.

### 🎯 VERDICT DE SEMIS POUR ${selectedCulture.name.toUpperCase()} :
• **Statut de semis :** ${selectedDept.ndvi < 0.35 ? "À DÉCALER ABSOLUMENT." : "AUTORISÉ AVEC TRÈS BONNE CONFIANCE."}
• **Analyse hydrique :** Les pluies cumulées (${selectedDept.pluviometrieCumulee} mm) sont ${selectedDept.pluviometrieCumulee < selectedDept.pluviometrieMoyenne ? 'inférieures' : 'supérieures'} à la normale décennale istorique de l'ANACIM (${selectedDept.pluviometrieMoyenne} mm).

### 🛠️ CONSEILS TECHNIQUES COMPLÉMENTAIRES :
- En cette période d'alerte, collaborez avec votre **GIE local** pour sécuriser des semences certifiées résistantes à bout de saison.
- Vous êtes couvert par la **CNAAS Connect**. Si besoin, demandez un versement automatique de mutuelle sécheresse indicielle.`;
      
      setAiAdvice(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoicePlay = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Prepare speaking without markdown clutter
    const textToSpeak = aiAdvice
      .replace(/[#*`_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Rendering of parsed Markdown headers
  const renderAdviceHtml = (text: string) => {
    const parseBoldTags = (lineText: string) => {
      const parts = lineText.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-extrabold text-slate-900 bg-amber-50 rounded px-1">{part}</strong>;
        }
        return part;
      });
    };

    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-black text-[#1A7A3E] mt-4 mb-2 uppercase tracking-wide flex items-center gap-1.5 pl-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />
            <span>{trimmed.replace('### ', '')}</span>
          </h4>
        );
      }
      if (trimmed.startsWith('## ') || trimmed.startsWith('**') && trimmed.endsWith('**')) {
        return (
          <h3 key={idx} className="text-xs font-extrabold text-[#1A7A3E] mt-4 mb-2 pb-1 border-b border-emerald-100 flex items-center gap-1.5 uppercase pl-1 bg-emerald-50/40 p-1 rounded-md">
            <span>{trimmed.replace(/## |\*\*/g, '')}</span>
          </h3>
        );
      }
      if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-3.5 mb-1.5 text-slate-700 text-xs">
            <span className="text-[#1A7A3E] text-sm shrink-0 leading-none">•</span>
            <p className="flex-1 leading-relaxed">{parseBoldTags(trimmed.substring(2))}</p>
          </div>
        );
      }
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed mb-1.5 pl-1.5">
          {parseBoldTags(trimmed)}
        </p>
      );
    });
  };

  const handleTemplateClick = (text: string) => {
    setCustomPrompt(text);
    triggerAnalysis(text);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-xs flex flex-col">
      {/* HEADER BAR FOR COMPAGNON */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 px-6 py-5 text-white flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-radial-gradient from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-3.5 z-10">
          <div className="w-11 h-11 bg-emerald-500/15 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <Brain className="w-5.5 h-5.5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-black text-sm uppercase tracking-wider flex items-center gap-2">
              <span>Compagnon SeneSemis IA</span>
              <span className="bg-[#1A7A3E]/35 border border-emerald-500/40 text-emerald-250 text-[8px] px-2 py-0.5 rounded-full font-black tracking-widest font-mono uppercase">Gemini 3.5</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Télédétection spatiale NDVI et préconisations de semis intelligentes raccordées à l'ANACIM.
            </p>
          </div>
        </div>

        <span className="text-[9px] text-emerald-400 tracking-wider bg-emerald-950/40 border border-emerald-800/80 px-2.5 py-1 rounded-full font-black animate-pulse shrink-0 hidden md:block select-none">
          ● RADAR OPTIQUE ACTIF
        </span>
      </div>

      <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PARAMS CONTROL SELECTORS (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-150/80 rounded-2xl p-4 space-y-4 shadow-2xs">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Compass className="w-3.5 h-3.5 text-slate-400" />
              <span>Paramétres d'Analyse Locaux</span>
            </h4>

            {/* Department field selection */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">1. Département ciblé :</label>
              <select
                value={selectedDept.id}
                onChange={(e) => {
                  const match = DEPARTEMENTS_DUMP[e.target.value];
                  if (match) {
                    setSelectedDept(match);
                    setErrorMessage(null);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl text-slate-800 font-extrabold text-xs p-3 focus:outline-none focus:border-primary cursor-pointer"
              >
                {Object.values(DEPARTEMENTS_DUMP).map((d) => (
                  <option key={d.id} value={d.id}>{d.nom} ({d.regionParent.split(' ')[0]})</option>
                ))}
              </select>
            </div>

            {/* Crop selection */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">2. Type de Culture :</label>
              <select
                value={selectedCulture.code}
                onChange={(e) => {
                  const match = CULTURES_OPTIONS.find(c => c.code === e.target.value);
                  if (match) {
                    setSelectedCulture(match);
                    setErrorMessage(null);
                  }
                }}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl text-slate-800 font-extrabold text-xs p-3 focus:outline-none focus:border-primary cursor-pointer"
              >
                {CULTURES_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Live metrics readouts */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <span className="text-[8px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                  <Satellite className="w-2.5 h-2.5 text-[#1A7A3E]" />
                  <span>Index NDVI</span>
                </span>
                <p className={`text-xs font-black ${selectedDept.ndvi < 0.35 ? 'text-red-600' : 'text-emerald-600'}`}>{selectedDept.ndvi}</p>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${selectedDept.ndvi < 0.35 ? 'bg-red-400' : 'bg-emerald-500'}`} style={{ width: `${selectedDept.ndvi * 100}%` }} />
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[8px] font-extrabold uppercase text-slate-400 flex items-center gap-1">
                  <CloudRain className="w-2.5 h-2.5 text-blue-500" />
                  <span>Pluviométrie</span>
                </span>
                <p className="text-xs font-black text-slate-800">{selectedDept.pluviometrieCumulee} mm</p>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${Math.min((selectedDept.pluviometrieCumulee/selectedDept.pluviometrieMoyenne)*100, 100)}%` }} />
                </div>
              </div>

              <div className="col-span-2 pt-1 border-t border-slate-200 text-[10px] text-slate-500 font-bold flex justify-between items-center">
                <span>Sécheresse : </span>
                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black tracking-widest uppercase ${
                  selectedDept.statutDrought === 'CRITIQUE' 
                    ? 'bg-red-50 text-red-600 animate-pulse' 
                    : selectedDept.statutDrought === 'ALERTE' 
                    ? 'bg-amber-50 text-amber-600' 
                    : 'bg-emerald-50 text-emerald-600'
                }`}>{selectedDept.statutDrought}</span>
              </div>
            </div>
          </div>

          {/* Quick Questions Template choices */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Questions fréquentes des maraîchers :</span>
            </span>
            <div className="space-y-1.5 font-sans">
              {[
                { text: `Est-ce le bon moment pour planter des oignons à ${selectedDept.nom} actuellement ?`, desc: 'Optionnel : Conseil de semis oignon' },
                { text: `Quelles sont les préconisations d'arrosage à ${selectedDept.nom} vu les indices NDVI ?`, desc: 'Optionnel : Rapport d\'irrigation' },
                { text: `Quel est le risque d'invasion saline ou de sécheresse persitante à ${selectedDept.nom} ?`, desc: 'Optionnel : Rapport de vulnérabilité' }
              ].map((q, qId) => (
                <button
                  key={qId}
                  type="button"
                  onClick={() => handleTemplateClick(q.text)}
                  className="w-full text-left py-2.5 px-3 bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 transition flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-1">{q.desc}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-[#1A7A3E] transition ml-1 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* WORKSPACE & ANSWER STREAM (Col 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full min-h-[420px]">
          
          {/* OUTPUT CONTAINER RESPONSE */}
          <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-4 md:p-5 flex-1 overflow-y-auto mb-4 relative min-h-[300px] max-h-[360px] flex flex-col">
            
            {/* Advice panel title stats toolbar */}
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-150 mb-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">
              <span className="flex items-center gap-1.5 text-[#1A7A3E]">
                <Brain className="w-3.5 h-3.5 shrink-0" />
                <span>Rapport SeneSemis IA</span>
              </span>

              {aiAdvice && (
                <button
                  type="button"
                  onClick={handleVoicePlay}
                  className={`flex items-center gap-1.5 py-1 px-3.5 rounded-full font-black text-[8px] uppercase transition-all tracking-wider cursor-pointer shadow-xs ${
                    isSpeaking 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-slate-900 text-white hover:bg-[#1A7A3E]'
                  }`}
                >
                  <Volume2 className="w-3 h-3" />
                  <span>{isSpeaking ? 'Arrêt dictée' : 'Écouter'}</span>
                </button>
              )}
            </div>

            {/* Answer Display */}
            <div className="flex-1 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                  <Loader2 className="w-7 h-7 text-[#1A7A3E] animate-spin" />
                  <p className="text-slate-700 text-xs font-bold animate-pulse">
                    Analyse des données satellite et du NDVI de la station {selectedDept.nom}...
                  </p>
                  <p className="text-slate-450 text-[10px] max-w-sm">
                    Recherche des normales ANACIM et formulation de préconisations agronomiques spécifiques.
                  </p>
                </div>
              ) : errorMessage ? (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-2 text-center my-6">
                  <div className="text-xl">⚠️</div>
                  <h4 className="text-[10px] font-black text-red-700 uppercase">Problème d'analyse IA</h4>
                  <p className="text-[11px] text-red-600 leading-relaxed font-semibold">
                    {errorMessage}
                  </p>
                </div>
              ) : aiAdvice ? (
                <div className="space-y-2 select-text">
                  {renderAdviceHtml(aiAdvice)}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-2 flex-1">
                  <span className="text-3xl">🌾</span>
                  <p className="text-slate-800 text-xs font-black">
                    Aucun conseil agronomique formulé pour cette zone.
                  </p>
                  <p className="text-slate-400 text-[10px] max-w-sm">
                    Sélectionnez vos critères à gauche puis cliquez sur générer ci-dessous. Posez également vos propres questions sur le cycle d'eau.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* DYNAMIC ACTION INPUT SUBMIT ROW */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              triggerAnalysis();
            }}
            className="flex gap-2 p-2 bg-white rounded-2xl border border-slate-150 shadow-2xs shrink-0"
          >
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={`Saisissez une question... ex: "Quelle variété d'arachides à ${selectedDept.nom} ?"`}
              className="flex-1 outline-none text-xs text-slate-800 border-none px-3 py-2 bg-slate-50 rounded-xl placeholder-slate-400 font-bold"
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#1A7A3E] hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl transition text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shrink-0 cursor-pointer shadow-lg shadow-emerald-700/5 select-none"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Analyser</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
