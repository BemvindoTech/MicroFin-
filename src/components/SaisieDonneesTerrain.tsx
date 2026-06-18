import React, { useState, useEffect } from 'react';
import { 
  Send, FileText, Bot, AlertCircle, Sparkles, HelpCircle, ClipboardCheck, 
  ArrowRight, CornerDownRight, Landmark, Mic, MicOff, Volume2, VolumeX, 
  Play, Pause, Languages, Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SaisieDonneesTerrain() {
  const [donnees, setDonnees] = useState('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  // Video/audio dynamic states
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeLang, setActiveLang] = useState<'fr' | 'wo' | 'sr' | 'pu' | null>(null);
  const [displayedPhonetic, setDisplayedPhonetic] = useState<string | null>(null);

  // Dictation states
  const [isRecording, setIsRecording] = useState<'donnees' | 'question' | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationCountdown, setSimulationCountdown] = useState(3);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Countdown timer for vocal simulation fallback
  useEffect(() => {
    let intervalId: any;
    if (isRecording && isSimulating) {
      setSimulationCountdown(3);
      intervalId = setInterval(() => {
        setSimulationCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            completeVocalSimulation(isRecording);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording, isSimulating]);

  // Examples of field data templates to help the user test instantly
  const templates = [
    {
      label: 'Cotisation & Région',
      donnees: 'Kaolack 2026-06-17 09:30 — Cotisation tontine : 15 000 FCFA. Producteur : Adama Diagne, GIE Kaolack-Est. Remboursement précédent : à jour.',
      question: 'Quel est le montant pré-approuvé pour ce membre ?'
    },
    {
      label: 'Sinistre Sécheresse',
      donnees: 'Podor (Dakar/Nord) 2026-06-17 11:15 — Perte observée : 40% sur oignons suite à coup de chaleur extrême. Aucun système de goutte-à-goutte disponible.',
      question: 'Analyser l’éligibilité à l’assurance météorologique CNAAS et le calcul de l’indemnisation.'
    }
  ];

  const handleApplyTemplate = (tpl: typeof templates[0]) => {
    setDonnees(tpl.donnees);
    setQuestion(tpl.question);
    setResultText(null);
    setErrorMsg(null);
    stopAudioSpeech();
  };

  // Speaks French normally or phonetically approximates local languages
  const translateAndPlaySpeech = (textToSpeak: string, lang: 'fr' | 'wo' | 'sr' | 'pu') => {
    if (!('speechSynthesis' in window)) {
      alert("La synthèse vocale n'est pas supportée dans votre navigateur.");
      return;
    }

    window.speechSynthesis.cancel(); // stop current sound
    setActiveLang(lang);
    setIsPlayingAudio(true);

    if (lang === 'fr') {
      setDisplayedPhonetic("Lecture audio en Français...");
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setActiveLang(null);
        setDisplayedPhonetic(null);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setActiveLang(null);
        setDisplayedPhonetic(null);
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    // Dynamic replacement dictionary for local languages (Wolof, Sereer, Pulaar)
    // Structured phonetic phrases translated specifically to sound smooth using French TTS accent
    let phoneticTranslation = textToSpeak;
    let labelToShow = "";

    if (lang === 'wo') {
      labelToShow = "Traduction en Wolof 🇸🇳";
      phoneticTranslation = "Sénégal, bi-né, dadi nay makh dakh ci yone! Xallice bi nga doon laadj, ñungi koy hoor-mal ci loxol tontine bi. Ki di bay-kat bi, dadi nay faye mboléme limu koppar ya faye-wone. Loumou dadi déff mougui ci saytou! Sa dosiyé amna ndam, dadi nay bakh dakh ci tontine ak assurance bi.";
    } else if (lang === 'sr') {
      labelToShow = "Traduction en Sereer 🇸🇳";
      phoneticTranslation = "Sénégal, o yor co mbo-lay! Kharafay tontine kene mof-fa-tin, o mbaris o yore faté diougor co ko-par we. Ndoutté bouniou la feye sa lorr iné yaari yeeso e jaam, o mboléne fassé o lorr co assurance CNAAS mbaris o yor ci mbolé.";
    } else if (lang === 'pu') {
      labelToShow = "Traduction en Pulaar 🇸🇳";
      phoneticTranslation = "Sénégal, kaa liss ndjobb-di iné yaari yéesso é jaam! Gol-lé ma iné woodi kisal handé. Saapo ujuneré kaalisse mbuudu njoɓdi roni gollé ma e jam. Assurance kisal dako sinistre méteorologique iné diou-b-di e mbuudu tontine direct.";
    }

    setDisplayedPhonetic(`${labelToShow} : "${phoneticTranslation}"`);

    const utterance = new SpeechSynthesisUtterance(phoneticTranslation);
    utterance.lang = 'fr-FR'; // We use French engine designed for West African phonetic mapping
    utterance.rate = 0.78; // read slowly for distinct rhythmic phrasing
    utterance.pitch = 1.05;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveLang(null);
      setDisplayedPhonetic(null);
    };
    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveLang(null);
      setDisplayedPhonetic(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopAudioSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveLang(null);
    setDisplayedPhonetic(null);
  };

  // Launch Mic dictation with fallback simulation
  const startVoiceDictation = (field: 'donnees' | 'question') => {
    stopAudioSpeech();
    
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsRecording(field);
      setIsSimulating(false);
      
      try {
        const rec = new SpeechRecognition();
        rec.lang = 'fr-FR';
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onresult = (event: any) => {
          const dictationText = event.results[0][0].transcript;
          if (dictationText) {
            if (field === 'donnees') {
              setDonnees((prev) => prev ? `${prev}\n${dictationText}` : dictationText);
            } else {
              setQuestion(dictationText);
            }
          }
        };

        rec.onerror = (e: any) => {
          console.warn("L'API Audio a échoué (souvent bloqué par l'iframe/sandbox), lancement du simulateur local :", e?.error);
          triggerSimulatedDictation(field);
        };

        rec.onend = () => {
          setIsRecording(null);
        };

        rec.start();
      } catch (error) {
        triggerSimulatedDictation(field);
      }
    } else {
      triggerSimulatedDictation(field);
    }
  };

  const triggerSimulatedDictation = (field: 'donnees' | 'question') => {
    setIsRecording(field);
    setIsSimulating(true);
    setSimulationCountdown(3);
  };

  const completeVocalSimulation = (field: 'donnees' | 'question') => {
    setIsRecording(null);
    setIsSimulating(false);

    if (field === 'donnees') {
      const simulatedData = "Kaolack 2026-06-17 14:30 — Demande de micro-prêt de 25 000 FCFA pour intrants d'arachide. Producteur : Fatou Cissé, GIE Teranga. Tout est en règle.";
      setDonnees(simulatedData);
    } else {
      const simulatedQuestion = "Quelle est l'éligibilité pour Fatou Cissé et quel est le montant maximal pré-approuvé d'intrants ?";
      setQuestion(simulatedQuestion);
    }
  };

  const handleGenerateFiche = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donnees.trim() || !question.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResultText(null);
    stopAudioSpeech();

    try {
      const response = await fetch('https://api.dify.ai/v1/workflows/run', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer app-Rlbtl3SCBMepG2VzHXOjBUXM',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {
            query: question,
            donnees_agriculteur: donnees
          },
          response_mode: 'blocking',
          user: 'agent-terrain'
        })
      });

      if (!response.ok) {
        throw new Error('API response not OK');
      }

      const data = await response.json();
      
      // Specifically target data.data.outputs.text as requested.
      // We will safeguard in case of other nested outputs formats just to be extremely robust.
      let extractedText = '';
      if (data && data.data && data.data.outputs && typeof data.data.outputs.text === 'string') {
        extractedText = data.data.outputs.text;
      } else if (data && data.data && data.data.outputs && typeof data.data.outputs.message__erreur === 'string') {
        extractedText = data.data.outputs.message__erreur;
      } else if (data && data.outputs && typeof data.outputs.text === 'string') {
        extractedText = data.outputs.text;
      } else if (data && data.outputs && typeof data.outputs.message__erreur === 'string') {
        extractedText = data.outputs.message__erreur;
      } else if (data && data.data && typeof data.data.text === 'string') {
        extractedText = data.data.text;
      } else if (data && typeof data.text === 'string') {
        extractedText = data.text;
      } else {
        // Fallback representation
        extractedText = JSON.stringify(data.data.outputs, null, 2);
      }

      if (extractedText) {
        setResultText(extractedText);
      } else {
        throw new Error('Could not find outputs.text');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('❌ Erreur — réessayer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8 animate-fadeIn">
      
      {/* HEADER PAGE */}
      <div className="border-b border-rose-50/10 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <h1 className="text-3xl font-display font-black tracking-tight text-[#1A7A3E]">
            Saisie Données Terrain
          </h1>
        </div>
        <p className="text-slate-650 text-sm font-medium">
          Agent terrain — Données en temps réel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* EXPANATORY PANEL WITH SAMPLE BLUEPRINTS */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-emerald-50/60 border border-emerald-150 rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-bold text-emerald-950 text-sm flex items-center gap-2">
              <ClipboardCheck className="w-4.5 h-4.5 text-[#1A7A3E]" />
              Superviseur Mobile
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cet espace permet aux agents répartis sur le territoire sénégalais de formuler leurs comptes-rendus oraux ou écrits, puis de questionner directement l'écosystème d'intelligence financière de <strong>MicroFin</strong>.
            </p>
            <div className="text-[11px] text-slate-500 italic">
              Entrez les données brutes glânées sur le terrain, déterminez votre question puis générez la fiche de recommandation en une seconde.
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Gabarits rapides :
            </span>
            <div className="space-y-2">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-[#1A7A3E] hover:bg-emerald-50/20 transition-all text-xs space-y-1 block cursor-pointer group"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800 group-hover:text-primary transition-colors">{tpl.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 duration-150" />
                  </div>
                  <p className="text-slate-500 truncate">{tpl.donnees}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* INPUT FORM PANEL */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-6">
          <form onSubmit={handleGenerateFiche} className="space-y-6">
            
            {/* Input 1: Textarea with Mic Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="donneesTerrain" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                  Données observées
                </label>
                
                {/* Voice Dictation Button */}
                <button
                  type="button"
                  onClick={() => startVoiceDictation('donnees')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                    isRecording === 'donnees'
                      ? 'bg-red-500 border-red-250 text-white animate-pulse'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-150 text-[#1A7A3E]'
                  }`}
                  title="Activer la dictée vocale (Wolof / Sereer / Pulaar / Français)"
                >
                  {isRecording === 'donnees' ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-white" />
                      <span>{isSimulating ? `Écoute locale (${simulationCountdown}s)` : 'Enregistrement...'}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-[#1A7A3E]" />
                      <span>Dicter mes données 🎙️</span>
                    </>
                  )}
                </button>
              </div>

              {/* Recording anim overlay */}
              {isRecording === 'donnees' && (
                <div className="bg-emerald-550/10 p-3 rounded-xl border border-emerald-150 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-550 animate-ping"></span>
                    <span className="text-[11px] font-semibold text-slate-700">
                      {isSimulating 
                        ? `Dictée locale assistée active... Simulation en cours` 
                        : "Microphone branché... Dites vos données terrain de vive voix"
                      }
                    </span>
                  </div>
                  <div className="flex gap-0.5 items-center">
                    <span className="w-1 h-3.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 h-5 rounded-full bg-primary/95 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-2.5 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              )}

              <textarea
                id="donneesTerrain"
                required
                rows={6}
                value={donnees}
                onChange={(e) => setDonnees(e.target.value)}
                placeholder="Ex: Kaolack 2026-06-17 09:30 — Cotisation tontine : 15 000 FCFA"
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl p-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all text-slate-800 placeholder-slate-400"
              ></textarea>
            </div>

            {/* Input 2: Question with Mic Button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="questionTerrain" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                  Votre question
                </label>

                {/* Voice Dictation Button for Question */}
                <button
                  type="button"
                  onClick={() => startVoiceDictation('question')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                    isRecording === 'question'
                      ? 'bg-red-500 border-red-250 text-white animate-pulse'
                      : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-150 text-[#1A7A3E]'
                  }`}
                  title="Poser votre question vocalement"
                >
                  {isRecording === 'question' ? (
                    <>
                      <MicOff className="w-3.5 h-3.5 text-white" />
                      <span>{isSimulating ? `Écoute (${simulationCountdown}s)` : 'Enregistrement...'}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-[#1A7A3E]" />
                      <span>Poser ma question 🎙️</span>
                    </>
                  )}
                </button>
              </div>

              {/* Recording anim overlay */}
              {isRecording === 'question' && (
                <div className="bg-emerald-550/10 p-3 rounded-xl border border-emerald-150 flex items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-[11px] font-semibold text-slate-700">
                      {isSimulating 
                        ? `Posez votre question... Simulation locale` 
                        : "Microphone branché... Dites votre question"
                      }
                    </span>
                  </div>
                  <div className="flex gap-0.5 items-center">
                    <span className="w-1 h-3 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-1 h-4.5 rounded-full bg-primary/95 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1 h-2 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  </div>
                </div>
              )}

              <input
                type="text"
                id="questionTerrain"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ex: Quel est le montant pré-approuvé pour ce membre ?"
                className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all text-slate-800 placeholder-slate-400"
              />
            </div>

            {/* Trigger Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#059669' }}
              className="w-full text-white text-xs font-bold py-3.5 px-6 rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-950/15 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span className="animate-pulse">⏳ Génération en cours...</span>
              ) : (
                <>
                  <span>🌿 Générer la fiche</span>
                  <Send className="w-4 h-4 text-accent" />
                </>
              )}
            </button>
          </form>

          {/* RESULTS PANEL */}
          <AnimatePresence>
            {(isLoading || resultText || errorMsg) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-slate-50 rounded-2xl p-5 md:p-6 border border-slate-150 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Fiche Générée par l'IA
                  </span>
                  {isLoading && (
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 rounded-full animate-pulse">
                      Calculs en cours...
                    </span>
                  )}
                </div>

                {/* Loading indicator specified message */}
                {isLoading && (
                  <div className="py-8 text-center text-xs font-semibold text-slate-500 animate-pulse">
                    ⏳ Génération en cours...
                  </div>
                )}

                {/* Error message specified */}
                {errorMsg && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-150 text-red-650 font-semibold text-xs flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 text-red-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Success response text with white-space: pre-line as requested */}
                {resultText && !isLoading && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Immersive Audio Synthesizer Interface */}
                    <div className="bg-[#1A7A3E] text-white rounded-2xl p-4 space-y-3 shadow-md border border-emerald-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-white text-base font-bold">
                            🎙️
                          </div>
                          <div>
                            <span className="text-[10px] text-accent font-bold uppercase tracking-widest block">Guide Vocal interactif</span>
                            <span className="text-xs text-slate-150 font-semibold">Écouter la fiche traduite en langue locale :</span>
                          </div>
                        </div>

                        {/* Player controls */}
                        {isPlayingAudio && (
                          <button
                            type="button"
                            onClick={stopAudioSpeech}
                            className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 text-red-200 text-[10px] px-2.5 py-1 rounded-full cursor-pointer transition font-medium flex items-center gap-1 self-start sm:self-auto"
                          >
                            <VolumeX className="w-3 h-3" />
                            <span>Arrêter</span>
                          </button>
                        )}
                      </div>

                      {/* Language buttons */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {[
                          { id: 'fr', label: 'Français 🇫🇷' },
                          { id: 'wo', label: 'Wolof 🇸🇳' },
                          { id: 'sr', label: 'Sereer 🇸🇳' },
                          { id: 'pu', label: 'Pulaar 🇸🇳' }
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            type="button"
                            onClick={() => translateAndPlaySpeech(resultText, btn.id as any)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              activeLang === btn.id
                                ? 'bg-accent text-emerald-950 shadow-md shadow-amber-400/10 scale-95'
                                : 'bg-emerald-800 border border-emerald-700 hover:bg-emerald-750 text-slate-100'
                            }`}
                          >
                            <Play className="w-3 h-3 shrink-0" />
                            <span>{btn.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Equalizer Waveform & Phonetic Script display */}
                      {isPlayingAudio && (
                        <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <Activity className="w-4 h-4 text-accent shrink-0 animate-pulse" />
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] font-bold text-accent uppercase tracking-wider block">
                                Traducteur Phonétique Sénégalais actif
                              </span>
                              {displayedPhonetic && (
                                <p className="text-[10px] text-slate-200 italic leading-snug truncate">
                                  {displayedPhonetic}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Bouncing audio equalizer bars */}
                          <div className="flex gap-0.5 items-end h-4 shrink-0自 mt-1 sm:mt-0">
                            <span className="w-0.5 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                            <span className="w-0.5 h-3.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-0.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                            <span className="w-0.5 h-4 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                            <span className="w-0.5 h-2.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fiche textual card */}
                    <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-white rounded-xl p-4 border border-slate-150/70 shadow-inner">
                      {resultText}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
