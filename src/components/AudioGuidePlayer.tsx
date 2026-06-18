import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, RotateCcw, AlertCircle, Headphones, Languages, BookOpen, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TrackData {
  id: string;
  title: string;
  icon: string;
  fr: string;
  wo: string;
  pu: string;
  duration: number; // in seconds
}

const GUIDE_TRACKS: TrackData[] = [
  {
    id: 'intro',
    title: 'Présentation de MicroFin',
    icon: '✨',
    fr: "Bienvenue sur MicroFin. Nous facilitons l'accès aux micro-crédits et à l'assurance récolte indexée sur la météo pour accompagner tous les producteurs agricoles au Sénégal.",
    wo: "Dalal jamm ci MicroFin. Ñun dañuy yombal joxe njaatig ak sàrtu dund ci wàllu mbay di jaare ci mbebe mewe melo jawwu ji ci Sénégal.",
    pu: "Bismillah mon e MicroFin. Minen mballata ko heɓde njaatigi e kodki nguura ngo reko jawmu he Senegal.",
    duration: 10,
  },
  {
    id: 'credit',
    title: 'Le Crédit Solidaire',
    icon: '🌾',
    fr: "Le Crédit Solidaire vous permet d'emprunter pour acheter des semences ou du matériel, sans paperasse, basé sur la caution solidaire et la garantie morale de votre GIE.",
    wo: "Njaatig tegalen di ngen ko mëna jëfandikoo ngir jënd ji ak njuumteeq, té du am karton, li ci war moy woolute nuy am ci seen GIE.",
    pu: "Njaatigi solidere mu huwtorengo mon no walliri coodgu aawdi walla kuutorɗe, tawa woodaa ɗereeji, gooto heen ko e hoolaare GIE mum.",
    duration: 12,
  },
  {
    id: 'tontine',
    title: 'La Tontine Digitale',
    icon: '💰',
    fr: "Épargnez seulement 2 000 francs CFA par semaine via Mobile Money pour faire grandir votre cote de crédit et sécuriser votre communauté villageoise.",
    wo: "Dencal ñaari junni CFA ci ayu bës bu nekk ci sa telefone ngir gëna yok sa doole ñatt ak baaxale sa dëkk.",
    pu: "Mbaɗen maral ujunere e ujunere CFA e yontere kala e kuwtoral mon telefoŋ ngir mawninde bawki mon e kisal renndo mon.",
    duration: 11,
  },
  {
    id: 'meteo',
    title: 'Météo & Index NDVI',
    icon: '🛰️',
    fr: "Notre système de télédétection surveille la sécheresse depuis l'espace par satellite et déclenche automatiquement vos indemnités en cas de déficit hydrique.",
    wo: "Sama masin télédétection dafay topp xeer wi foofa ci asamaan te day tàkk ndimbal yi ci sa saas bu xeer gi amé.",
    pu: "Kuwtal télédétection amen no toppitoo joorngol he kodo asamaan, enen soɓat ballal gooto e kuwtoral kodo so joorngol ngol sellaani.",
    duration: 13,
  }
];

export default function AudioGuidePlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [lang, setLang] = useState<'fr' | 'wo' | 'pu'>('fr');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const currentTrack = GUIDE_TRACKS[currentTrackIndex];
  const duration = currentTrack.duration;

  // Speech and Audio synthesis refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ttsUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto clean speech synthesis on dismount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Whenever track or language changes, we reset play times and restart if playing
  useEffect(() => {
    const wasPlaying = isPlaying;
    stopAllAudio();
    setCurrentTime(0);
    
    if (wasPlaying) {
      // Small timeout to allow state to settle
      setTimeout(() => {
        startPlayback();
      }, 100);
    }
  }, [currentTrackIndex, lang]);

  const stopAllAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playSynthBeep = () => {
    if (isMuted) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      // Warm low frequency synthesised rhythm representing speech vocal chords
      osc.type = 'sine';
      // Vary frequency slightly to sound like modulated phonetics
      const randomFreq = 180 + Math.random() * 90;
      osc.frequency.setValueAtTime(randomFreq, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(volume * 0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (err) {
      // Browser constraint or not focused yet
    }
  };

  const textToRead = currentTrack[lang];

  const startPlayback = () => {
    stopAllAudio();
    setIsPlaying(true);

    // 1. Text to Speech if French is selected
    if (lang === 'fr' && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Clear previous
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'fr-FR';
      utterance.rate = playbackSpeed;
      utterance.volume = isMuted ? 0 : volume;
      
      // When speech starts, we map duration accurately if possible
      utterance.onend = () => {
        stopAllAudio();
        setCurrentTime(duration);
      };

      utterance.onerror = () => {
        // Fallback silently if blocked by browser policy
      };

      ttsUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      // 2. Simulated phonetic rhythm tones for Wolof & Pulaar
      synthIntervalRef.current = setInterval(() => {
        // Play soft voice sound waves every 400ms to mimic narration feedback
        if (Math.random() > 0.3) {
          playSynthBeep();
        }
      }, 400);
    }

    // Progress bar runner
    const stepMs = 100 / playbackSpeed;
    let localTime = currentTime;
    
    timerRef.current = setInterval(() => {
      localTime += 0.1;
      if (localTime >= duration) {
        setCurrentTime(duration);
        stopAllAudio();
      } else {
        setCurrentTime(parseFloat(localTime.toFixed(1)));
      }
    }, stepMs);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAllAudio();
    } else {
      if (currentTime >= duration) {
        setCurrentTime(0);
        setTimeout(() => startPlayback(), 50);
      } else {
        startPlayback();
      }
    }
  };

  const handleReset = () => {
    stopAllAudio();
    setCurrentTime(0);
  };

  const formatTime = (timeInSecs: number) => {
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // UI Waveform simulation bars count
  const barsCount = 20;

  return (
    <div id="audio-guide-player-card" className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Decorative ambient glowing circles */}
      <div className="absolute right-0 top-0 w-48 h-48 bg-[#1A7A3E]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header and Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Headphones className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h3 id="audio-guide-header-title" className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>Guide Vocal de Proximité</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-bold">Interactif</span>
            </h3>
            <p id="audio-guide-header-subtitle" className="text-[11px] text-slate-400 font-medium font-sans">
              Écoutez les explications de nos services ruraux en langues locales.
            </p>
          </div>
        </div>

        {/* Translation disclaimer indicator */}
        <div className="flex items-center gap-1.5 bg-slate-800/40 border border-slate-700/60 px-3 py-1.5 rounded-xl text-[10px] text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Aide au maraîcher</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Column (Selector, Progress and Main Controls) - Span 7 */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* TRACK SELECTOR DROPDOWN */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Sujet de l'explication</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {GUIDE_TRACKS.map((track, idx) => (
                <button
                  key={track.id}
                  id={`track-select-btn-${track.id}`}
                  onClick={() => setCurrentTrackIndex(idx)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-center items-center gap-1 text-xs ${
                    currentTrackIndex === idx
                      ? 'bg-[#1A7A3E] border-[#1A7A3E] text-white shadow-lg'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-base">{track.icon}</span>
                  <span className="font-bold text-[10px] leading-tight line-clamp-1">{track.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* LANGUAGE PILL BAR */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span>Choix de la langue de narration</span>
            </label>
            <div className="flex gap-2">
              {[
                { code: 'fr', label: '🇫🇷 Français', desc: 'Audio natif TTS' },
                { code: 'wo', label: '🇸🇳 Wolof', desc: 'Traduction vocale' },
                { code: 'pu', label: '🇸🇳 Pulaar', desc: 'Traduction vocale' }
              ].map((language) => (
                <button
                  key={language.code}
                  id={`lang-select-pill-${language.code}`}
                  onClick={() => setLang(language.code as 'fr' | 'wo' | 'pu')}
                  className={`flex-1 py-2 px-3 rounded-xl border transition cursor-pointer text-left ${
                    lang === language.code
                      ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                      : 'bg-slate-800/30 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <p className="text-xs font-black">{language.label}</p>
                  <p className="text-[9px] text-slate-400 font-medium">{language.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* PLAYBACK WAVEFORM VISUALIZER */}
          <div className="bg-slate-950/80 rounded-2xl border border-slate-800/60 p-4 relative overflow-hidden">
            <div id="audio-waveform-container" className="h-14 flex items-end justify-center gap-[3px] select-none">
              {Array.from({ length: barsCount }).map((_, barIdx) => {
                // Generate random heights that animate if playing
                const animationDelay = `${barIdx * 0.05}s`;
                return (
                  <div
                    key={barIdx}
                    className={`w-1.5 rounded-full transition-all duration-300 ${
                      isPlaying 
                        ? 'bg-emerald-400 animate-wave-bounce-slow shadow-[0_0_8px_rgba(52,211,153,0.5)]' 
                        : 'bg-slate-700 h-2'
                    }`}
                    style={{
                      animationDelay: isPlaying ? animationDelay : '0s',
                      // Static varying fallback heights if paused
                      height: !isPlaying ? `${3 + (barIdx % 4) * 4}px` : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* AUDIO ACCESSIBILITY SPEED CONTROLLER / VOLUME ROW */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-1.5">
            {/* Play, Pause & Reset controls */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                id="audio-play-pause-btn"
                onClick={handlePlayPause}
                className={`w-12 h-12 rounded-full cursor-pointer transition flex items-center justify-center hover:scale-105 active:scale-95 shadow-md ${
                  isPlaying 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' 
                    : 'bg-[#1A7A3E] hover:bg-emerald-700 text-white'
                }`}
                title={isPlaying ? 'Pause' : 'Lire la narration'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </button>

              <button
                type="button"
                id="audio-reset-btn"
                onClick={handleReset}
                className="w-9 h-9 rounded-xl cursor-pointer bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
                title="Recommencer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Real-time progression counter */}
              <div className="text-xs font-mono font-bold text-slate-400 bg-slate-950/45 px-2.5 py-1.5 rounded-xl border border-slate-800/40">
                <span>{formatTime(currentTime)}</span>
                <span className="text-slate-600 mx-1">/</span>
                <span className="text-slate-300">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Volume and Speed parameters */}
            <div className="flex items-center gap-4">
              {/* Playback rate buttons */}
              <div className="flex gap-1 items-center bg-slate-850 border border-slate-800 p-0.5 rounded-lg text-[10px]">
                <span className="text-slate-500 font-extrabold px-1.5 uppercase">Vitesse:</span>
                {[0.75, 1, 1.25].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2 py-1 rounded font-bold cursor-pointer transition-all ${
                      playbackSpeed === speed 
                        ? 'bg-slate-755 text-emerald-400 font-extrabold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Volume range slider */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white transition"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-red-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-16 accent-emerald-500 opacity-60 hover:opacity-100 transition h-1 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* PROGRESS SLIDER */}
          <div className="space-y-1">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration}
                step="0.1"
                value={currentTime}
                onChange={(e) => {
                  setCurrentTime(parseFloat(e.target.value));
                  if (isPlaying) {
                    // Small trigger to speech/interval reset
                    setTimeout(() => startPlayback(), 50);
                  }
                }}
                className="w-full accent-[#1A7A3E] h-1.5 bg-slate-800 rounded-lg cursor-pointer appearance-none outline-none"
              />
              <div 
                className="absolute top-0 bottom-0 left-0 bg-[#1A7A3E] rounded-lg pointer-events-none h-1.5"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>

        </div>

        {/* Right Column (Live highlighted transcript) - Span 5 */}
        <div className="lg:col-span-12 xl:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800/60 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-black tracking-wider">
              <span>Transcription de l'écoute</span>
              <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                {lang.toUpperCase()}
              </span>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800/80 min-h-[90px] flex flex-col justify-center space-y-2">
              <p id="audio-transcription-main text" className="text-xs leading-relaxed font-semibold text-slate-100 italic">
                "{textToRead}"
              </p>
              
              {/* If language is Wolof or Pulaar, show the French sub-translation for context */}
              {lang !== 'fr' && (
                <div className="pt-2.5 border-t border-slate-800 text-[10px] text-slate-400 font-medium">
                  <p className="font-extrabold uppercase text-[9px] tracking-wider text-amber-500/80 mb-0.5">Traduction Française :</p>
                  <p className="leading-snug">"{currentTrack.fr}"</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800 flex items-start gap-2 text-[9px] text-slate-450 leading-normal">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <p className="font-sans font-medium text-slate-400">
              {lang === 'fr' 
                ? "La lecture vocale utilise la synthèse vocale intégrée de votre navigateur. Ajustez le volume pour écouter." 
                : "Les langues locales (Wolof, Pulaar) sont accompagnées d'un signal acoustique modulaire d'entraînement rythmique."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
