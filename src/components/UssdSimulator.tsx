import React, { useState, useEffect } from 'react';
import { Phone, Wifi, Battery, Send, RefreshCw, Milestone, MessageSquare, CheckCircle2, AlertTriangle, Play, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OFFRES_DATA } from '../data';

export default function UssdSimulator() {
  const [ussdInput, setUssdInput] = useState('');
  const [screen, setScreen] = useState<'idle' | 'loading' | 'menu' | 'input' | 'success' | 'sms'>('idle');
  const [menuTitle, setMenuTitle] = useState('');
  const [menuOptions, setMenuOptions] = useState<string[]>([]);
  const [inputPlaceholder, setInputPlaceholder] = useState('');
  const [currentAction, setCurrentAction] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [smsNotification, setSmsNotification] = useState<{ sender: string; body: string; time: string } | null>(null);
  
  // History of USSD commands for user reference
  const quickCodes = [
    { code: '*221#', label: 'Menu Général MicroFin' },
    { code: '*221*101#', label: 'Crédit Niayes (75k)' },
    { code: '*221*102#', label: 'Assurance Kaolack (5k)' },
    { code: '*221*104#', label: 'Tontine Kaffrine (12 sem.)' }
  ];

  const handleKeyPress = (num: string) => {
    if (screen === 'idle') {
      setUssdInput(prev => prev + num);
    } else if (screen === 'input') {
      setInputValue(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    if (screen === 'idle') {
      setUssdInput(prev => prev.slice(0, -1));
    } else if (screen === 'input') {
      setInputValue(prev => prev.slice(0, -1));
    }
  };

  const handleReset = () => {
    setUssdInput('');
    setInputValue('');
    setScreen('idle');
    setSmsNotification(null);
  };

  const executeUssd = (codeToRun?: string) => {
    const finalCode = codeToRun || ussdInput;
    if (!finalCode) return;
    
    setUssdInput(finalCode);
    setScreen('loading');
    setSmsNotification(null);

    setTimeout(() => {
      processUssdCommand(finalCode);
    }, 1000);
  };

  const processUssdCommand = (code: string) => {
    const sanitized = code.trim();
    
    // Direct offers USSD
    if (sanitized === '*221*101#') {
      setScreen('menu');
      setMenuTitle('MicroFin Crédit Niayes :');
      setMenuOptions([
        '1. Demander le Crédit Semences (75 000 FCFA)',
        '2. Voir les conditions d’éligibilité',
        '3. Contacter le délégué de GIE Niayes'
      ]);
      setCurrentAction('credit_niayes_menu');
    } else if (sanitized === '*221*102#') {
      setScreen('menu');
      setMenuTitle('MicroFin Assurance Kaolack :');
      setMenuOptions([
        '1. Souscrire à l’Assurance (5 000 FCFA/an)',
        '2. Déclarer un sinistre sécheresse',
        '3. Consulter mon certificat CNAAS'
      ]);
      setCurrentAction('assurance_kaolack_menu');
    } else if (sanitized === '*221*104#') {
      setScreen('menu');
      setMenuTitle('Tontine Kaffrine :');
      setMenuOptions([
        '1. Effectuer ma cotisation hebdomadaire',
        '2. Consulter mon solde d’épargne',
        '3. Demande de tirage prioritaire GIE'
      ]);
      setCurrentAction('tontine_kaffrine_menu');
    } else if (sanitized === '*221#' || sanitized === '*221') {
      // General menu
      setScreen('menu');
      setMenuTitle('Bienvenue sur MicroFin Senegal :');
      setMenuOptions([
        '1. Cotisations Tontines',
        '2. Demandes de Crédit court terme',
        '3. Assurances Indicielles CNAAS',
        '4. Mon Score de crédit & GIE'
      ]);
      setCurrentAction('main_menu');
    } else {
      // Unknown USSD code
      setScreen('menu');
      setMenuTitle('MicroFin Sénégal - Erreur :');
      setMenuOptions([
        'Le code USSD saisi n’est pas reconnu.',
        '1. Retour au menu général (*221#)',
        '0. Quitter le service'
      ]);
      setCurrentAction('unknown_code_menu');
    }
  };

  const handleMenuSelect = (option: string) => {
    setScreen('loading');
    setTimeout(() => {
      // Step-by-step state machine based on options
      if (currentAction === 'main_menu') {
        if (option === '1') {
          // Tontine main menu option selected
          setScreen('menu');
          setMenuTitle('MicroFin - Vos Tontines :');
          setMenuOptions([
            '1. Tontine maraîchère 12 sem. (Kaffrine)',
            '2. Tontine arboricole Kaolack (Active)',
            '9. Retour au menu précédent'
          ]);
          setCurrentAction('tontines_list');
        } else if (option === '2') {
          setScreen('menu');
          setMenuTitle('MicroFin - Crédit :');
          setMenuOptions([
            '1. Crédit Semences (Dossier Niayes)',
            '2. Mini prêt intrants (Fatick)',
            '9. Retour au menu précédent'
          ]);
          setCurrentAction('credits_list');
        } else if (option === '3') {
          setScreen('menu');
          setMenuTitle('MicroFin - Assurance :');
          setMenuOptions([
            '1. Assurance maraîchère Kaolack',
            '2. Assurance bétail / intrants',
            '9. Retour au menu précédent'
          ]);
          setCurrentAction('assurance_list');
        } else if (option === '4') {
          setScreen('menu');
          setMenuTitle('MicroFin - Solvabilité :');
          setMenuOptions([
            'Votre Score : 78/100 (Excellent)',
            'Statut : Éligible aux micro-crédits',
            '1. Télécharger mon attestation de score',
            '9. Retour au menu précédent'
          ]);
          setCurrentAction('score_menu');
        } else {
          setScreen('menu');
          setMenuTitle('Option invalide :');
          setMenuOptions([
            'Veuillez sélectionner un chiffre valide.',
            '1. Retour au menu principal'
          ]);
          setCurrentAction('retry_main_menu');
        }
      } 
      
      // Credit Niayes Options inside Menu
      else if (currentAction === 'credit_niayes_menu') {
        if (option === '1') {
          setScreen('input');
          setInputPlaceholder('Saisissez le montant max (ex: 75000) :');
          setCurrentAction('enter_amount_credit_niayes');
          setInputValue('');
        } else if (option === '2') {
          setScreen('menu');
          setMenuTitle('Conditions - Crédit Niayes :');
          setMenuOptions([
            '- Résider dans la zone maraîchère',
            '- Être membre dʼun GIE déclaré',
            '- Avoir cotisé > 4 sem. de tontine',
            '1. Introduire ma demande',
            '0. Quitter'
          ]);
          setCurrentAction('credit_niayes_menu'); // loop back to 1 if needed
        } else {
          handleReset();
        }
      }

      // Assurance Kaolack options inside Menu
      else if (currentAction === 'assurance_kaolack_menu') {
        if (option === '1') {
          setScreen('menu');
          setMenuTitle('Souscription :');
          setMenuOptions([
            'Valider la prime de 5 000 FCFA/an',
            'déduite de votre compte Mobile Money.',
            '1. Confirmer la souscription',
            '2. Annuler'
          ]);
          setCurrentAction('confirm_assurance_kaolack');
        } else if (option === '2') {
          setScreen('menu');
          setMenuTitle('Déclarer un sinistre :');
          setMenuOptions([
            'Veuillez confirmer que vos cultures',
            'de Kaolack ont subi une sécheresse.',
            '1. Confirmer lʼenvoi des données satellite',
            '2. Retour'
          ]);
          setCurrentAction('declare_sinistre');
        } else {
          handleReset();
        }
      }

      else if (currentAction === 'confirm_assurance_kaolack') {
        if (option === '1') {
          setScreen('success');
          setMessage('Félicitations ! Votre souscription à l’Assurance Maraîchère Kaolack est validée avec la CNAAS.');
          triggerSms('CNAAS-Assur', 'MicroFin : Souscription confirmée pour Assurance Kaolack (Ref: AS-90231). 5 000 FCFA débités. Vos cultures sont protégées par satellite !');
        } else {
          handleReset();
        }
      }

      else if (currentAction === 'declare_sinistre') {
        if (option === '1') {
          setScreen('success');
          setMessage('Votre déclaration a été enregistrée. Demande transmise à la CNAAS pour évaluation météorologique.');
          triggerSms('CNAAS-Info', 'MicroFin : Votre demande de sinistre sécheresse à Kaolack est en cours de traitement. Analyse satellitaire en cours.');
        } else {
          handleReset();
        }
      }

      // entering amount for Niayes Credit
      else if (currentAction === 'enter_amount_credit_niayes') {
        // Option is actually input text in this context!
        const parsedVal = parseInt(inputValue, 10);
        if (isNaN(parsedVal) || parsedVal <= 0 || parsedVal > 75000) {
          setScreen('menu');
          setMenuTitle('Erreur de montant :');
          setMenuOptions([
            'Le montant doit être compris entre 1 000 FCFA',
            'et 75 000 FCFA max.',
            '1. Recommencer',
            '0. Quitter'
          ]);
          setCurrentAction('credit_niayes_menu');
        } else {
          setScreen('success');
          setMessage(`Demande de crédit de ${parsedVal.toLocaleString()} FCFA pour "Semences Niayes" soumise avec succès.`);
          triggerSms('MicroFin', `MicroFin : Votre demande de crédit de ${parsedVal.toLocaleString()} FCFA a été pré-approuvée. Le délégué de votre GIE va confirmer la libération des fonds.`);
        }
      }

      // Tontine options
      else if (currentAction === 'tontines_list' || currentAction === 'tontine_kaffrine_menu') {
        if (option === '1') {
          setScreen('input');
          setInputPlaceholder('Entrez le montant de cotisation (FCFA) :');
          setCurrentAction('enter_tontine_payment_kaffrine');
          setInputValue('');
        } else if (option === '2') {
          setScreen('success');
          setMessage('Votre solde disponible sur la Tontine Kaffrine est de 32 000 FCFA avec un historique de 100% d’assiduité.');
          triggerSms('MicroFin', 'MicroFin Solde : Tontine Kaffrine. Total accumulé : 32 000 FCFA (16 semaines restantes). Statut GIE : Actif.');
        } else {
          handleReset();
        }
      }

      else if (currentAction === 'enter_tontine_payment_kaffrine') {
        const amt = parseInt(inputValue, 10);
        if (isNaN(amt) || amt <= 0) {
          handleReset();
        } else {
          setScreen('success');
          setMessage(`Paiement de ${amt.toLocaleString()} FCFA vers la tontine locale validé.`);
          triggerSms('Tontine-Sen', `MicroFin Cotisation : Félicitations, versement de ${amt.toLocaleString()} FCFA reçu dans la Tontine 12 semaines Kaffrine. Nouveau solde : ${(32000 + amt).toLocaleString()} FCFA.`);
        }
      }

      // Fallbacks
      else if (option === '9' || option === '9. Retour au menu précédent') {
        executeUssd('*221#');
      } else {
        handleReset();
      }
    }, 800);
  };

  const triggerSms = (sender: string, body: string) => {
    setTimeout(() => {
      setSmsNotification({
        sender,
        body,
        time: 'À l’instant'
      });
      // Simple beep sound effect using web audio context (harmless, lovely UX if browser allows)
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } catch (e) {
        // Audio template silent bypass if not focused
      }
    }, 2800);
  };

  return (
    <div id="ussd-simulator-container" className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 items-center max-w-4xl mx-auto">
      {/* PHONE GRAPHIC MOCKUP */}
      <div className="relative w-[300px] h-[550px] bg-slate-900 rounded-[40px] px-4 py-8 shadow-2xl border-4 border-slate-700 flex flex-col justify-between shrink-0 select-none">
        {/* Top Speaker & Camera */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-700 rounded-full flex gap-1.5 items-center justify-center">
          <div className="w-8 h-1 bg-slate-900 rounded-full"></div>
          <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
        </div>

        {/* Status Bar inside Screen */}
        <div className="w-full flex justify-between items-center px-3 pt-2 text-[10px] font-mono text-emerald-400">
          <div className="flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            <span>Orange SN / Tigo</span>
          </div>
          <div className="flex items-center gap-1">
            <Battery className="w-3.5 h-3.5" />
            <span>82%</span>
          </div>
        </div>

        {/* SCREEN SECTION */}
        <div className="w-full h-[270px] bg-[#0c1813] border-2 border-emerald-950 rounded-xl relative overflow-hidden font-mono text-emerald-400 p-3 mt-1 text-xs select-text flex flex-col">
          {/* Internal Glow overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,150,105,0.12)_0%,rgba(0,0,0,0)_100%)] pointer-events-none"></div>
          
          <AnimatePresence mode="wait">
            {screen === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="text-center font-display text-emerald-500 font-bold border-b border-emerald-900/40 pb-1.5 mb-2 text-xs">
                    📱 SIMULATEUR USSD
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-300/80">
                    Saisissez un code USSD ou cliquez sur un des raccourcis bleus à côté pour tester la plateforme hors-ligne.
                  </p>
                </div>
                <div className="my-2 bg-emerald-950/40 p-2 rounded border border-emerald-800/20 text-center">
                  <span className="text-emerald-500 text-[10px] block uppercase font-bold tracking-wider mb-0.5">Écran principal</span>
                  <span className="text-sm tracking-wider font-semibold">
                    {ussdInput || <span className="text-emerald-600/50">Prêt...</span>}
                  </span>
                </div>
                <div className="text-[10px] text-center text-emerald-500/60 italic pb-1">
                  Appuyez sur "Lancer" ou l'icône verte.
                </div>
              </motion.div>
            )}

            {screen === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-2"
              >
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 animate-duration-1000" />
                <span className="text-xs text-emerald-300 font-medium tracking-widest animate-pulse">
                  ENVOI EN COURS...
                </span>
              </motion.div>
            )}

            {screen === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-emerald-400 mb-2 whitespace-pre-line border-b border-emerald-900/30 pb-1">
                    {menuTitle}
                  </div>
                  <div className="space-y-1 text-[11px] text-emerald-200">
                    {menuOptions.map((opt, i) => (
                      <div key={i} className="leading-tight py-0.5">{opt}</div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-emerald-900/30 pt-1.5 mt-auto">
                  {/* Option Input Panel */}
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      className="bg-emerald-950 border border-emerald-800 rounded px-1.5 py-0.5 text-xs text-white placeholder-emerald-800 focus:outline-none w-full font-mono"
                      placeholder="Votre réponse..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleMenuSelect(inputValue);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleMenuSelect(inputValue)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-slate-999 rounded px-2 py-0.5 text-[10px] font-bold uppercase transition"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {screen === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <label className="text-[11px] font-semibold block text-emerald-400 mb-2">
                    {inputPlaceholder}
                  </label>
                  <div className="my-1 text-center py-2 bg-emerald-950/40 rounded border border-emerald-900/50 text-white font-bold text-base tracking-widest">
                    {inputValue || <span className="text-emerald-800 font-normal">Saisissez...</span>}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-emerald-900/30">
                  <button
                    onClick={handleReset}
                    className="bg-emerald-950 border border-emerald-800 text-emerald-400 rounded px-2.5 py-1 text-[10px] hover:bg-emerald-900 transition-colors"
                  >
                    Quitter
                  </button>
                  <button
                    onClick={() => handleMenuSelect(inputValue)}
                    className="bg-emerald-500 text-slate-950 font-bold rounded px-4 py-1 text-[10px] hover:bg-emerald-450 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </motion.div>
            )}

            {screen === 'success' && (
              <motion.div
                key="success"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div className="text-center pt-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-[11px] text-emerald-100 leading-tight">
                    {message}
                  </p>
                </div>
                <div className="pt-2 border-t border-emerald-900/30 text-center">
                  <button
                    onClick={handleReset}
                    className="w-full bg-emerald-500 text-slate-950 text-[10px] font-bold py-1.5 rounded uppercase hover:bg-emerald-400 transition"
                  >
                    Fermer (Écran accueil)
                  </button>
                  <span className="block text-[8px] text-emerald-400/60 mt-1 animate-pulse">
                    Note : Vous allez recevoir un SMS de démonstration...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VIRTUAL SMS NOTIFICATION SLIDEOUT */}
          <AnimatePresence>
            {smsNotification && (
              <motion.div
                initial={{ transform: 'translateY(120%)' }}
                animate={{ transform: 'translateY(0%)' }}
                exit={{ transform: 'translateY(120%)' }}
                transition={{ type: 'spring', damping: 15 }}
                className="absolute bottom-1 left-1 right-1 bg-slate-950 border-2 border-emerald-500 text-white p-2.5 rounded-lg shadow-xl z-20 font-sans"
              >
                <div className="flex justify-between items-center mb-0.5 border-b border-slate-800 pb-0.5">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold text-slate-300">SMS : {smsNotification.sender}</span>
                  </div>
                  <span className="text-[8px] text-slate-500">{smsNotification.time}</span>
                </div>
                <p className="text-[10px] leading-snug text-slate-200">
                  {smsNotification.body}
                </p>
                <button
                  onClick={() => setSmsNotification(null)}
                  className="mt-1 w-full text-center text-[9px] text-emerald-400 hover:text-emerald-300 font-bold border-t border-slate-900 pt-0.5"
                >
                  Fermer la notification
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM DIAL PAD & BUTTONS */}
        <div className="w-full flex flex-col gap-3 mt-2">
          {/* Navigation Action Keys */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleReset}
              className="py-1 bg-red-950 hover:bg-red-900 border border-red-800 text-red-100 rounded-lg text-[10px] font-bold transition duration-150 uppercase"
            >
              Annuler
            </button>
            <button
              onClick={handleBackspace}
              className="py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-bold transition duration-150"
            >
              ←
            </button>
            <button
              onClick={() => executeUssd()}
              className="py-1 bg-emerald-600 hover:bg-emerald-550 text-slate-950 rounded-lg text-[10px] font-bold transition duration-150 flex items-center justify-center gap-0.5 uppercase"
            >
              <Send className="w-2.5 h-2.5" /> Lancer
            </button>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((char) => (
              <button
                key={char}
                onClick={() => handleKeyPress(char)}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white rounded-lg font-semibold text-xs border border-slate-700 transition duration-150 shadow-sm"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Simulated Home Bar */}
          <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto -mb-2 mt-1"></div>
        </div>
      </div>

      {/* EXPLANATORY CONTENT AND QUICK CODES */}
      <div id="ussd-explanation-panel" className="flex-1 space-y-4">
        <div>
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Technologie SMS & USSD
          </span>
          <h3 className="text-xl font-display font-bold text-slate-900 mt-2">
            L'Inclusion par la simplicité
          </h3>
          <p className="text-slate-600 text-sm mt-1.5 leading-relaxed">
            Parce que plus de 60% des exploitants maraîchers sénégalais n'ont pas de smartphone ou de connexion internet stable dans leurs champs, MicroFin fonctionne sans connexion de données : par de simples commandes de téléphone classique.
          </p>
        </div>

        {/* QUICK CONNECTIONS */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
            <Milestone className="w-3.5 h-3.5 text-primary" /> Raccourcis de Simulation :
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickCodes.map((qc) => (
              <button
                key={qc.code}
                onClick={() => executeUssd(qc.code)}
                className="p-2.5 bg-white border border-slate-200 hover:bg-primary-hover/5 hover:border-primary rounded-xl text-left transition group active:scale-95 duration-100 flex flex-col justify-between"
              >
                <code className="text-primary font-bold text-xs group-hover:scale-105 duration-150 block mb-0.5">
                  {qc.code}
                </code>
                <span className="text-slate-500 text-[11px] leading-tight font-medium">
                  {qc.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* USER GUIDE STEPS */}
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold font-mono shrink-0">1</div>
            <div>
              <strong>Sélectionnez un code</strong> ci-dessus ou composez-le sur le clavier virtuel.
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold font-mono shrink-0">2</div>
            <div>
              Appuyez sur le bouton vert <strong>"Lancer"</strong> pour soumettre la requête au réseau virtuel.
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold font-mono shrink-0">3</div>
            <div>
              <strong>Naviguez dans les sections</strong> en répondant avec les chiffres puis validez pour tester les simulations de prêts, cotisations ou assurances !
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
