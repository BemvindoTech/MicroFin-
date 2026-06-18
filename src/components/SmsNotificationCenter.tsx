import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Bell, Trash2, Smartphone, Volume2, Shield, CloudLightning, 
  Sparkles, Layers, ArrowDownCircle, CheckCircle, Info, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSimulatedSmsList, addSimulatedSms, clearAllSms, SmsMessage } from '../utils/smsHelper';
import { User } from '../types';

interface SmsNotificationCenterProps {
  currentUser?: User | null;
}

export default function SmsNotificationCenter({ currentUser }: SmsNotificationCenterProps) {
  const [messages, setMessages] = useState<SmsMessage[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'ANACIM' | 'CNAAS' | 'MicroFin'>('All');
  const [activeTab, setActiveTab] = useState<'chats' | 'stats'>('chats');
  const [showToast, setShowToast] = useState<string | null>(null);

  // Load message stack
  const loadMessages = () => {
    setMessages(getSimulatedSmsList());
  };

  useEffect(() => {
    loadMessages();

    // Custom event listener for incoming simulated SMS (synced across USSD and pages)
    const handleNewSms = (e: Event) => {
      loadMessages();
      const customEvent = e as CustomEvent<SmsMessage>;
      if (customEvent.detail) {
        setShowToast(`Nouveau SMS reçu de ${customEvent.detail.sender} !`);
        setTimeout(() => setShowToast(null), 4000);
      }
    };

    window.addEventListener('microfin_new_sms', handleNewSms);
    return () => {
      window.removeEventListener('microfin_new_sms', handleNewSms);
    };
  }, []);

  // Text to speech for accessible audio reading of the selected SMS
  const speakSms = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // 1. ANACIM personalized weather simulation
  const triggerAnacimSms = () => {
    const region = currentUser?.region || 'Kaffrine';
    const gie = currentUser?.gieNom || 'GIE "Solidarité rurale"';
    const body = `ANACIM Alerte Sécheresse : Évolution du climat à ${region}. Précipitations cumulées en baisse de 35% par rapport à l'historique de saison. Arrosage d'appoint conseillé pour le groupement ${gie}.`;
    addSimulatedSms('ANACIM', body);
  };

  // 2. CNAAS satellite payout simulation
  const triggerCnaasSms = () => {
    const region = currentUser?.region || 'Kaolack';
    const gie = currentUser?.gieNom || 'GIE maraîcher de Kaolack';
    const body = `CNAAS Assurance : Déclenchement automatique d'indemnités sécheresse pour la zone ${region}. Télédétection NDVI confirme un déficit hydrique critique. Virement de 65 000 FCFA en attente de libération sur votre compte GIE (${gie}).`;
    addSimulatedSms('CNAAS', body);
  };

  // 3. Tontine payment confirmation simulation
  const triggerTontineSms = () => {
    const name = currentUser?.nom || 'Adama Diouf';
    const region = currentUser?.region || 'Kaffrine';
    const body = `MicroFin Tontine : Dépôt Mobile Money de 2 000 FCFA effectué avec succès par ${name}. Votre solde d'épargne est sécurisé pour la tontine maraîchère de ${region}. Cote de crédit : +4 points.`;
    addSimulatedSms('MicroFin', body);
  };

  // 4. Quick Credit payment simulation
  const triggerCreditSms = () => {
    const name = currentUser?.nom || 'Adama Diouf';
    const body = `MicroFin Crédit : Remboursement de 15 000 FCFA enregistré pour le prêt de semences maraîchères. Merci pour votre régularité, votre capacité d'emprunt a été réévaluée à la hausse !`;
    addSimulatedSms('MicroFin', body);
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    if (activeFilter === 'All') return true;
    return msg.sender === activeFilter;
  });

  return (
    <div id="sms-notification-center-workspace" className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden flex flex-col">
      
      {/* HEADER BANNER OF THE CENTER */}
      <div className="bg-slate-900 px-6 py-5 text-white flex justify-between items-center relative overflow-hidden">
        {/* Abstract satellite signal line decorative element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#1A7A3E]/30 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-3 z-10">
          <div className="w-11 h-11 bg-[#1A7A3E] rounded-xl flex items-center justify-center text-white font-bold text-lg animate-pulse">
            📱
          </div>
          <div>
            <h3 id="sms-panel-title" className="font-display font-black text-[15px] uppercase tracking-wide flex items-center gap-1.5">
              <span>Centre de Notification SMS</span>
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">SIMULATEUR</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Visualisez le réseau cellulaire fictif et recevez vos alertes de terrain en direct.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            clearAllSms();
            loadMessages();
          }}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-xl transition cursor-pointer"
          title="Vider la boîte de réception"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* QUICK SIMULATION SENDERS SECTION */}
      <div className="p-4 md:p-5 bg-slate-50 border-b border-slate-150">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Tableau d'envoi rapide d'alertes & reçus :</span>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* ANACIM */}
          <button
            type="button"
            onClick={triggerAnacimSms}
            className="p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-150 rounded-2xl text-left transition hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-sky-700 bg-sky-200/50 px-2 py-0.5 rounded-full uppercase">ANACIM</span>
              <CloudLightning className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <p className="text-[10px] text-sky-850 font-bold leading-tight line-clamp-2">
              Alerte de sécheresse personnalisée ({currentUser?.region || 'Kaffrine'})
            </p>
          </button>

          {/* CNAAS INDEMNITE */}
          <button
            type="button"
            onClick={triggerCnaasSms}
            className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 rounded-2xl text-left transition hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-200/50 px-2 py-0.5 rounded-full uppercase">CNAAS</span>
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-[10px] text-emerald-850 font-bold leading-tight line-clamp-2">
              Rapport d'Indemnisation d'Indice NDVI
            </p>
          </button>

          {/* DEPOT TONTINE RECU */}
          <button
            type="button"
            onClick={triggerTontineSms}
            className="p-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-150 rounded-2xl text-left transition hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-amber-700 bg-amber-200/50 px-2 py-0.5 rounded-full uppercase">Tontine</span>
              <ArrowDownCircle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            </div>
            <p className="text-[10px] text-amber-850 font-bold leading-tight line-clamp-2">
              Reçu de Dépôt Tontine de 2 000 FCFA
            </p>
          </button>

          {/* REMBOURSEMENT CREDIT RECU */}
          <button
            type="button"
            onClick={triggerCreditSms}
            className="p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-150 rounded-2xl text-left transition hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-purple-700 bg-purple-200/50 px-2 py-0.5 rounded-full uppercase">MicroFin</span>
              <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="text-[10px] text-purple-850 font-bold leading-tight line-clamp-2">
              SMS Reçu de Remboursement de prêt
            </p>
          </button>
        </div>
      </div>

      {/* FILTER PILLS FOR TEXT LOGS */}
      <div className="p-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white">
        <div className="flex gap-1.5 flex-wrap">
          {[
            { filter: 'All', label: 'Toutes les boîtes' },
            { filter: 'ANACIM', label: 'ANACIM Météo' },
            { filter: 'CNAAS', label: 'CNAAS Assurances' },
            { filter: 'MicroFin', label: 'MicroFin' }
          ].map((item) => (
            <button
              key={item.filter}
              onClick={() => setActiveFilter(item.filter as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeFilter === item.filter
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Counter of SMS in box */}
        <div className="text-[11px] font-mono text-slate-500 font-bold flex items-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-slate-400" />
          <span>{filteredMessages.length} message(s) filtré(s)</span>
        </div>
      </div>

      {/* CHAT THREADS LISTING SCREEN */}
      <div className="p-4 md:p-6 bg-slate-50/60 max-h-[360px] overflow-y-auto space-y-3 min-h-[180px]">
        <AnimatePresence initial={false}>
          {filteredMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center space-y-2"
            >
              <div className="text-3xl text-slate-300">📬</div>
              <p className="text-slate-500 text-xs font-semibold">Boîte de réception vide</p>
              <p className="text-slate-400 text-[10px] max-w-[280px]">
                Utilisez le tableau d'envoi rapide ci-dessus ou effectuez une transaction dans l'espace membre pour générer des reçus !
              </p>
            </motion.div>
          ) : (
            filteredMessages.map((msg) => {
              // Custom avatars and color styles based on Sender
              const isAnacim = msg.sender === 'ANACIM';
              const isCnaas = msg.sender === 'CNAAS';
              
              const headerColor = isAnacim 
                ? 'bg-sky-100 text-sky-800 border-sky-200' 
                : isCnaas 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200';

              const bubbleBgColor = isAnacim
                ? 'bg-sky-50 border-sky-100/50'
                : isCnaas
                ? 'bg-emerald-50 border-emerald-100/50'
                : 'bg-white border-slate-150';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`border p-4 rounded-3xl ${bubbleBgColor} transition-all shadow-xs relative flex gap-3`}
                >
                  {/* Sender Bullet Badge */}
                  <div className={`w-9 h-9 shrink-0 rounded-2xl flex items-center justify-center font-black text-xs border ${headerColor}`}>
                    {msg.sender === 'ANACIM' ? '☁️' : msg.sender === 'CNAAS' ? '📡' : '💰'}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {/* Header meta info */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-950 uppercase">{msg.sender}</span>
                        {msg.isNew && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">{msg.timestamp}</span>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-slate-750 font-medium leading-relaxed">
                      {msg.body}
                    </p>

                    {/* Footer speech action trigger */}
                    <div className="pt-2 flex justify-between items-center text-[10px]">
                      <div className="text-slate-400 flex items-center gap-1 font-semibold">
                        <Info className="w-3 h-3 text-slate-350" />
                        <span>Reçu sur le réseau cellulaire de {currentUser?.region || 'Sénégal'}</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => speakSms(msg.body)}
                        className="flex items-center gap-1 py-1 px-2.5 bg-slate-900 text-white hover:bg-[#1A7A3E] rounded-xl transition cursor-pointer text-[9px] font-black uppercase"
                        title="Écouter par synthèse vocale"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Lire</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* GLOBAL TOAST BANNER */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-4 left-4 right-4 bg-slate-950 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 z-50 text-xs font-bold"
          >
            <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
