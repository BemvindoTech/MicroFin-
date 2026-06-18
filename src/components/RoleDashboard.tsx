import React, { useState, useEffect } from 'react';
import { User, UserRole, Offre, InscriptionTontine } from '../types';
import { 
  PiggyBank, Landmark, ShieldCheck, CheckCircle, Clock, AlertCircle, 
  ArrowRight, HeartHandshake, UserCheck, ShieldAlert, Sparkles, TrendingUp, 
  Wallet, PhoneCall, PlusCircle, Check, X, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AudioGuidePlayer from './AudioGuidePlayer';
import { addSimulatedSms } from '../utils/smsHelper';
import SmsNotificationCenter from './SmsNotificationCenter';

interface RoleDashboardProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  setCurrentPage?: (page: 'accueil' | 'offres' | 'contact' | 'terrain') => void;
}

export default function RoleDashboard({ user, onUpdateUser, setCurrentPage }: RoleDashboardProps) {
  // Producteur actions
  const [cotisationMontant, setCotisationMontant] = useState('2000');
  const [demandeMontant, setDemandeMontant] = useState(30000);
  const [demandeDuree, setDemandeDuree] = useState(4); // mois
  const [sollicitations, setSollicitations] = useState<any[]>([]);
  const [platformSubs, setPlatformSubs] = useState<any[]>([]);
  const [successActionMsg, setSuccessActionMsg] = useState<string | null>(null);

  // Load requested active credits from localStore
  useEffect(() => {
    const list = JSON.parse(localStorage.getItem('microfin_sollicitations') || '[]');
    // Filter for current user if Producteur
    if (user.role === 'PRODUCTEUR') {
      const filtered = list.filter((item: any) => item.userId === user.id);
      setSollicitations(filtered);
    } else {
      setSollicitations(list);
    }

    const subsList = JSON.parse(localStorage.getItem('microfin_platform_subscriptions') || '[]');
    if (user.role === 'PRODUCTEUR') {
      setPlatformSubs(subsList.filter((item: any) => item.userId === user.id));
    } else {
      setPlatformSubs(subsList);
    }
  }, [user]);

  // Save changes to solicitations helper
  const saveSolicitations = (newList: any[]) => {
    localStorage.setItem('microfin_sollicitations', JSON.stringify(newList));
    if (user.role === 'PRODUCTEUR') {
      setSollicitations(newList.filter((item: any) => item.userId === user.id));
    } else {
      setSollicitations(newList);
    }
  };

  // Producteur: Pay contribution to tontine
  const handlePayWeeklyTontine = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cotisationMontant);
    if (!amount || amount <= 0) return;

    // Simulate mobile payment process
    const previousEpargne = user.soldeEpargne || 0;
    const previousLimit = user.limiteCredit || 15000;
    
    const updatedUser: User = {
      ...user,
      soldeEpargne: previousEpargne + amount,
      // Dynamic expansion of borrowing capacity: rating expands as you pay tontines
      limiteCredit: Math.floor((previousEpargne + amount) * 2.65)
    };

    onUpdateUser(updatedUser);
    setSuccessActionMsg(`Virement mobile money de ${amount.toLocaleString()} FCFA validé. Votre épargne cumulée passe à ${(previousEpargne + amount).toLocaleString()} FCFA !`);
    
    // Log in notifications list
    const logList = JSON.parse(localStorage.getItem('microfin_activity_logs') || '[]');
    logList.unshift({
      id: 'LOG_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      text: `Cotisation Tontine de ${amount.toLocaleString()} FCFA par ${user.nom}`
    });
    localStorage.setItem('microfin_activity_logs', JSON.stringify(logList));

    // Send centralized simulated SMS receipt
    addSimulatedSms('MicroFin', `MicroFin Reçu : Cotisation Tontine de ${amount.toLocaleString()} FCFA effectuée en direct. Votre épargne totale passe à ${(previousEpargne + amount).toLocaleString()} FCFA. Cote de solvabilité mise à jour.`);

    setTimeout(() => {
      setSuccessActionMsg(null);
    }, 4500);
  };

  // Producteur: Make Micro-credit request
  const handleRequestCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (demandeMontant > (user.limiteCredit || 50000)) {
      alert(`Le montant demandé dépasse votre limite actuelle de crédit solidaire de ${(user.limiteCredit || 50000).toLocaleString()} FCFA.`);
      return;
    }

    const newRequest = {
      id: 'CRED_' + Math.floor(Math.random() * 100000),
      userId: user.id,
      userNom: user.nom,
      userRegion: user.region,
      userGie: user.gieNom || 'Individuel',
      userPhone: user.telephone,
      montant: demandeMontant,
      duree: demandeDuree,
      statut: 'EN_ATTENTE', // EN_ATTENTE | APPROUVE | REJETE
      date: new Date().toLocaleDateString('fr-FR'),
      taux: 2.0 // % standard
    };

    const currentList = JSON.parse(localStorage.getItem('microfin_sollicitations') || '[]');
    currentList.unshift(newRequest);
    saveSolicitations(currentList);

    setSuccessActionMsg(`Votre demande de crédit solidaire pour un montant de ${demandeMontant.toLocaleString()} FCFA a été soumise au GIE et à l'Unité de Contrôle pour validation.`);

    // Send simulated SMS receipt
    addSimulatedSms('MicroFin', `MicroFin Prêt : Demande de crédit de ${demandeMontant.toLocaleString()} FCFA pour l'achat de semences/intrants soumise avec succès. Votre GIE va être sollicité pour valider la caution solidaire.`);

    setTimeout(() => {
      setSuccessActionMsg(null);
    }, 4500);
  };

  // Gestionnaire actions: Approve/Reject requests
  const updateRequestStatus = (reqId: string, newStatus: 'APPROUVE' | 'REJETE') => {
    const currentList = JSON.parse(localStorage.getItem('microfin_sollicitations') || '[]');
    const updated = currentList.map((req: any) => {
      if (req.id === reqId) {
        return { ...req, statut: newStatus };
      }
      return req;
    });
    saveSolicitations(updated);

    // If approved and the user is currently looking at it, reload or show message
    // Also log this action
    const reqItem = currentList.find((r: any) => r.id === reqId);
    const logList = JSON.parse(localStorage.getItem('microfin_activity_logs') || '[]');
    logList.unshift({
      id: 'LOG_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      text: `Décision de crédit: ${newStatus === 'APPROUVE' ? 'Approbation' : 'Rejet'} de ${reqItem ? reqItem.montant.toLocaleString() : ''} FCFA pour ${reqItem ? reqItem.userNom : 'Producteur'}`
    });
    localStorage.setItem('microfin_activity_logs', JSON.stringify(logList));

    if (reqItem) {
      if (newStatus === 'APPROUVE') {
        addSimulatedSms('MicroFin', `MicroFin Crédit : Félicitations ! Votre demande de financement de ${reqItem.montant.toLocaleString()} FCFA pour le groupement (${reqItem.userGie}) a été validée par l'Unité de Contrôle. Les fonds ont été débloqués sur votre mobile !`);
      } else {
        addSimulatedSms('MicroFin', `MicroFin Info : Votre demande de crédit de ${reqItem.montant.toLocaleString()} FCFA a été rejetée par l'Unité de Contrôle en raison d'un manque de cautionnement mutuel collectif.`);
      }
    }

    setSuccessActionMsg(`Statut mis à jour avec succès : la demande est désormais ${newStatus === 'APPROUVE' ? 'approuvée' : 'rejetée'}.`);
    
    // Auto clear
    setTimeout(() => {
      setSuccessActionMsg(null);
    }, 3000);
  };

  return (
    <div className="bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* WELCOME BLOCK WITH AVATAR */}
        <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1A7A3E]/10 flex items-center justify-center text-3xl shrink-0">
              {user.role === 'PRODUCTEUR' ? '🌾' : user.role === 'AGENT' ? '📋' : '🏛️'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-widest bg-emerald-100 text-[#1A7A3E]">
                  {user.role === 'PRODUCTEUR' ? 'Producteur Agricole' : user.role === 'AGENT' ? 'Agent de Terrain' : 'Gestionnaire de Crédit'}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                  {user.region}
                </span>
              </div>
              <h2 className="font-display font-black text-2xl text-slate-900 mt-1">
                Jami, {user.nom} 👋
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {user.role === 'PRODUCTEUR' && `Membre du collectif: ${user.gieNom}`}
                {user.role === 'AGENT' && `Identifiant de liaison: ${user.matriculeAgent}`}
                {user.role === 'GESTIONNAIRE' && `Service: ${user.serviceUnite}`}
              </p>
            </div>
          </div>

          {/* Quick Metrics display depending on roles */}
          {user.role === 'PRODUCTEUR' && (
            <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 md:flex-initial bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 text-center md:text-left">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">Votre Épargne</span>
                <span className="text-base font-black text-primary font-mono">
                  {(user.soldeEpargne || 0).toLocaleString()} FCFA
                </span>
              </div>
              <div className="flex-1 md:flex-initial bg-emerald-50/50 px-4 py-3 rounded-2xl border border-emerald-100 text-center md:text-left">
                <span className="text-[9px] text-[#1A7A3E] font-extrabold uppercase tracking-widest block">Limite d'Emprunt</span>
                <span className="text-base font-black text-[#1A7A3E] font-mono">
                  {(user.limiteCredit || 15000).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          )}

          {user.role === 'AGENT' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (setCurrentPage) {
                    setCurrentPage('terrain');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="px-5 py-3 bg-primary hover:bg-[#1A7A3E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-accent" />
                <span>Remplir une Fiche d'évaluation</span>
              </button>
            </div>
          )}
        </div>

        {/* Action success alert */}
        {successActionMsg && (
          <div className="bg-emerald-50 border border-emerald-250 text-[#1A7A3E] p-4 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <span className="text-lg">✔️</span>
            <div className="text-xs font-bold font-sans">
              {successActionMsg}
            </div>
          </div>
        )}

        {/* MINIMALIST ACCESSIBLE VOCAL AUDIO PLAYER GUIDING SERVICES */}
        <AudioGuidePlayer />

        {/* DASHBOARD GRID CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================== ROLE 1: PRODUCTEUR INSIDE VIEWS ================== */}
          {user.role === 'PRODUCTEUR' && (
            <>
              {/* Column 1: Contribution area and Credit request (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. COTISER A LA TONTINE */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg shrink-0">
                      💰
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
                        Cotisation Hebdomadaire Mobile
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Renforcez votre épargne communautaire pour doubler votre capacité de crédit solidaire.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handlePayWeeklyTontine} className="flex flex-col sm:flex-row gap-3 pt-2">
                    <div className="relative flex-1">
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-extrabold font-mono">
                        FCFA
                      </span>
                      <select
                        value={cotisationMontant}
                        onChange={(e) => setCotisationMontant(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3 px-4 text-xs font-bold focus:outline-none"
                      >
                        <option value="2000">2 000 FCFA (Cotisation type)</option>
                        <option value="5000">5 000 FCFA</option>
                        <option value="10000">10 000 FCFA</option>
                        <option value="25000">25 000 FCFA (Intrants avancés)</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="py-3 px-6 bg-primary hover:bg-[#1A7A3E] text-white text-xs font-black uppercase tracking-widest rounded-xl transition cursor-pointer"
                    >
                      Payer par Mobile Money 📱
                    </button>
                  </form>
                </div>

                {/* 2. DEMANDER UN MICRO-CREDIT */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1A7A3E]/10 flex items-center justify-center text-lg shrink-0">
                      🌾
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
                        Nouveau micro-crédit intrants ou matériel
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Soumettez instantanément une demande numérique. Sans caution ni paperasse.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleRequestCredit} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">Montant souhaité</span>
                        <span className="font-extrabold text-[#1A7A3E] font-mono bg-emerald-50 px-2 py-0.5 rounded">
                          {demandeMontant.toLocaleString()} FCFA
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5000"
                        max={user.limiteCredit || 15000}
                        step="5000"
                        value={demandeMontant}
                        onChange={(e) => setDemandeMontant(parseInt(e.target.value))}
                        className="w-full accent-primary h-2 bg-slate-100 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                        <span>Min: 5 000 FCFA</span>
                        <span>Limite max: {(user.limiteCredit || 15000).toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest">
                          Période de remboursement
                        </label>
                        <select
                          value={demandeDuree}
                          onChange={(e) => setDemandeDuree(parseInt(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-3 text-xs font-semibold"
                        >
                          <option value={2}>2 mois (Maraîchage court)</option>
                          <option value={4}>4 mois (Saison complète)</option>
                          <option value={6}>6 mois (Post-récolte max)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest">
                          Taux d'intérêt annuel
                        </label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-mono font-bold text-slate-700">
                          2.0% préférentiel GIE
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl space-y-1 border border-slate-100">
                      <div className="flex justify-between text-xs font-medium text-slate-600">
                        <span>Intérêts cumulés :</span>
                        <span className="font-bold text-slate-800 font-mono">
                          {Math.round(demandeMontant * 0.02).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-slate-800 pt-1 border-t border-slate-200">
                        <span>Total à rembourser :</span>
                        <span className="font-black text-primary font-mono">
                          {Math.round(demandeMontant * 1.02).toLocaleString()} FCFA
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-primary hover:bg-[#1A7A3E] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-md cursor-pointer text-center"
                    >
                      Soumettre la demande de crédit 🚀
                    </button>
                  </form>
                </div>
              </div>

              {/* Column 2: Sollicitations state tracker & Tontine rules (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1.5 ACTIVE PLATFORM SUBSCRIPTIONS */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                      Vos souscriptions directes (Plateforme)
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#1A7A3E]/10 text-[#1A7A3E]">
                      {platformSubs.length} Active{platformSubs.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {platformSubs.length === 0 ? (
                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      <p>Aucune souscription directe active sur la plateforme.</p>
                      <button 
                        onClick={() => {
                          if (setCurrentPage) {
                            setCurrentPage('offres');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="mt-2 text-primary font-bold hover:underline cursor-pointer"
                      >
                        Créer une souscription directe 🌿
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {platformSubs.map((sub) => (
                        <div key={sub.id} className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/10 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-slate-900">
                              {sub.offreTitre}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-550/15 text-[#1A7A3E] border border-emerald-250">
                              ● Actif (Plateforme)
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-550">
                            <div>
                              <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] text-slate-600 uppercase font-black">
                                {sub.offreCategorie}
                              </span>
                              <span className="text-[10px] text-slate-400 ml-2">Paiement: {sub.modePaiement}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800 font-mono">
                              {sub.offrePrix > 0 ? `${sub.offrePrix.toLocaleString()} FCFA` : 'Gratuit'}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400">Souscrit le {sub.dateSouscription}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* LIST OF CURRENT REQUESTS */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                    Vos demandes de financement
                  </h3>

                  {sollicitations.length === 0 ? (
                    <div className="bg-slate-50/50 p-8 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                      <p>Aucune demande de crédit enregistrée.</p>
                      <p className="mt-1 font-semibold text-primary">Utilisez le formulaire pour faire votre première demande.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sollicitations.map((req) => (
                        <div key={req.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/20 space-y-2">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">
                              #{req.id.split('_')[1]}
                            </span>
                            
                            {/* Tags status */}
                            {req.statut === 'EN_ATTENTE' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2.0 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                                ⏳ En attente
                              </span>
                            )}
                            {req.statut === 'APPROUVE' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2.0 py-0.5 rounded-full font-bold bg-emerald-550/10 text-[#1A7A3E] border border-emerald-200">
                                ✅ Approuvé
                              </span>
                            )}
                            {req.statut === 'REJETE' && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-2.0 py-0.5 rounded-full font-bold bg-red-50 text-red-700 border border-red-100">
                                ❌ Rejeté
                              </span>
                            )}
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs text-slate-500">Crédit semences/intrants</p>
                              <span className="text-xs font-semibold text-slate-700">Durée : {req.duree} mois</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 font-mono">
                              {req.montant.toLocaleString()} FCFA
                            </span>
                          </div>

                          <p className="text-[10px] text-slate-400">Créé le {req.date}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SOLIDARY SECURITY RULES INFO */}
                <div className="bg-gradient-to-br from-emerald-900 to-[#1A7A3E] text-white rounded-3xl p-6 shadow-md space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent">Charte de Solidarité</span>
                  </div>
                  <h4 className="font-display font-extrabold text-base leading-tight">
                    Comment préserver mon éligibilité de crédit ?
                  </h4>
                  <ul className="space-y-2 text-[11px] text-slate-200">
                    <li className="flex gap-2">
                      <span className="text-accent">✔</span>
                      <span>Versez régulièrement vos 2 000 FCFA dans la tontine.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✔</span>
                      <span>Assurez un remboursement sous 4 mois post-récolte pour étendre votre crédit à la saison suivante.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent">✔</span>
                      <span>Gardez un œil sur les alertes météo locales envoyées par SMS.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* ================== ROLE 2: AGENT DE TERRAIN INTERFACES ================== */}
          {user.role === 'AGENT' && (
            <div className="lg:col-span-12 space-y-6">
              
              {/* Agent Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Collectifs rattachés</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-slate-900">4 GIE</span>
                    <span className="text-xs font-bold text-primary bg-emerald-50 px-2 py-1 rounded">Actifs à Kaolack</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Évaluations effectuées</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-slate-900">48 fiches</span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">100% synchronisées</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Taux d'adhésion local</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black text-slate-900">97.8%</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">Zone de Kaolack</span>
                  </div>
                </div>

              </div>

              {/* Farmer roster overview and action quick links */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Dynamic Roster */}
                <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
                        Données des producteurs du secteur
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Registre local des évaluations d'éligibilités réalisées sur le terrain et confirmées de vive voix.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-450 uppercase tracking-widest">
                          <th className="pb-3 text-slate-800">Producteur</th>
                          <th className="pb-3 text-slate-800">GIE collectif</th>
                          <th className="pb-3 text-slate-800">Secteur</th>
                          <th className="pb-3 text-slate-800">Situation Épargne</th>
                          <th className="pb-3 text-slate-800">Score Mobile</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-705">
                        {[
                          { nom: 'Fatou Cissé', gie: 'GIE Teranga Kaolack', secteur: 'Koutal', epargne: '28 000 FCFA', score: 'Excellent' },
                          { nom: 'Demba Ndiaye', gie: 'GIE Joolaa Casamance', secteur: 'Bignona', epargne: '14 500 FCFA', score: 'Bon' },
                          { nom: 'Awa Pouye', gie: 'GIE Deggo Kaolack', secteur: 'Kahone', epargne: '42 000 FCFA', score: 'Excellent' },
                          { nom: 'Ibrahima Diallo', gie: 'GIE Maraîchers Thiès', secteur: 'Fandène', epargne: '9 000 FCFA', score: 'Moyen' }
                        ].map((prod, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3 font-bold text-slate-900">{prod.nom}</td>
                            <td className="py-3 font-medium text-slate-600">{prod.gie}</td>
                            <td className="py-3">{prod.secteur}</td>
                            <td className="py-3 font-mono font-bold text-primary">{prod.epargne}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prod.score === 'Excellent' 
                                  ? 'bg-emerald-50 text-[#1A7A3E]' 
                                  : prod.score === 'Bon' 
                                    ? 'bg-[#1A7A3E]/10 text-primary' 
                                    : 'bg-amber-50 text-amber-700'
                              }`}>
                                {prod.score}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right side: quick logs */}
                <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                    Historique des activités locales
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { time: '14:22', text: 'Nouvelle enquête maraîchère de Fatou Cissé synchornisée.' },
                      { time: '11:05', text: 'Validation du crédit d\'intrants GIE Deggo Kahone.' },
                      { time: 'Hier', text: 'Paiement tontine de 12 GIE enregistré via Orange Money.' }
                    ].map((log, idx) => (
                      <div key={idx} className="flex gap-3 text-[11px] leading-relaxed">
                        <span className="font-bold text-primary font-mono shrink-0 select-none">{log.time}</span>
                        <p className="text-slate-600 font-medium">{log.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================== ROLE 3: GESTIONNAIRE DE CREDIT INTERFACES ================== */}
          {user.role === 'GESTIONNAIRE' && (
            <div className="lg:col-span-12 space-y-6">
              
              {/* Regional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Crédits Sollicités de l'Union</span>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {sollicitations.length} dossiers
                    </span>
                    <span className="text-[11px] font-bold text-amber-750 bg-amber-50 px-2 py-0.5 rounded animate-pulse">
                      À traiter
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Somme Totale Engagée</span>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {sollicitations.reduce((acc, current) => acc + current.montant, 0).toLocaleString()} FCFA
                    </span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Taux de Remboursement Moyen</span>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-[#1A7A3E]">96.4%</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Objectif national</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Tontines Actives</span>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-indigo-700">188 Groupes GIE</span>
                  </div>
                </div>

              </div>

              {/* ADMIN ACTION PANEL FOR IN-FLOW REQS */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-150 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
                    Demandes de Financement Sollicitées
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Prenez une décision (Approuver / Rejeter) sur chaque dossier. Les décisions sont répercutées instantanément dans l'espace des maraîchers.
                  </p>
                </div>

                {sollicitations.length === 0 ? (
                  <div className="bg-slate-50 p-12 rounded-2xl text-center border border-dashed text-xs text-slate-500">
                    Aucun dossier de crédit n'est en attente de traitement pour le moment au Sénégal.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {sollicitations.map((req) => (
                      <div key={req.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              #{req.id.split('_')[1]}
                            </span>
                            <span className="text-xs font-extrabold text-slate-800">
                              {req.userNom} ({req.userGie})
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-550/15 text-[#1A7A3E] font-bold">
                              {req.userRegion}
                            </span>
                          </div>

                          <div className="flex gap-4 text-xs text-slate-500 font-medium">
                            <span>Téléphone: <strong className="text-slate-800">{req.userPhone}</strong></span>
                            <span>Date: <strong className="text-slate-800">{req.date}</strong></span>
                            <span>Durée: <strong className="text-slate-800">{req.duree} mois</strong></span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-left md:text-right shrink-0">
                          <span className="text-base font-black text-primary font-mono block">
                            {req.montant.toLocaleString()} FCFA
                          </span>
                          <span className="text-[10px] text-slate-400 block font-semibold">Taux: {req.taux}%</span>
                        </div>

                        {/* Actions controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          {req.statut === 'EN_ATTENTE' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => updateRequestStatus(req.id, 'APPROUVE')}
                                className="px-3 py-1.5 bg-[#1A7A3E] hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition shadow-sm"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approuver</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateRequestStatus(req.id, 'REJETE')}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-650 text-white text-[11px] font-bold rounded-xl flex items-center gap-1 cursor-pointer transition shadow-sm"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Rejeter</span>
                              </button>
                            </>
                          ) : (
                            <span className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border ${
                              req.statut === 'APPROUVE' 
                                ? 'bg-emerald-50 text-[#1A7A3E] border-emerald-150' 
                                : 'bg-red-50 text-red-700 border-red-100'
                            }`}>
                              {req.statut === 'APPROUVE' ? 'Approuvé ✔️' : 'Rejeté ❌'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* SMS NOTIFICATION PALETTE INTEGRATION */}
        <div className="mt-10">
          <SmsNotificationCenter currentUser={user} />
        </div>

      </div>
    </div>
  );
}
