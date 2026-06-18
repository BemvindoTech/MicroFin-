import React, { useState } from 'react';
import { X, User as UserIcon, Phone, MapPin, Landmark, Clipboard, ShieldCheck, Sparkles, LogIn, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'connexion' | 'inscription'>('connexion');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PRODUCTEUR');

  // Input states
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [region, setRegion] = useState('Kaolack');
  const [gieNom, setGieNom] = useState('GIE Teranga Kaolack');
  const [matriculeAgent, setMatriculeAgent] = useState('AG-221-7789');
  const [serviceUnite, setServiceUnite] = useState('Direction Régionale CNAAS');

  // Login inputs
  const [loginTelephone, setLoginTelephone] = useState('');
  const [loginRole, setLoginRole] = useState<UserRole>('PRODUCTEUR');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // List of regions for agricultural Senegal
  const regionsSénégal = [
    'Kaolack', 'Fatick', 'Diourbel', 'Kaffrine', 'Thiès', 
    'Louga', 'Saint-Louis', 'Tambacounda', 'Kolda', 'Ziguinchor', 'Dakar'
  ];

  // Helper mock db lookup or generation
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nom.trim() || !telephone.trim()) {
      setErrorMsg('Veuillez remplir les informations obligatoires (Nom et Téléphone).');
      return;
    }

    if (!/^\+?[0-9\s-]{7,15}$/.test(telephone)) {
      setErrorMsg('Veuillez saisir un numéro de téléphone valide.');
      return;
    }

    // Default simulation parameters
    let soldeEpargne = undefined;
    let limiteCredit = undefined;

    if (selectedRole === 'PRODUCTEUR') {
      soldeEpargne = Math.floor(Math.random() * 45000) + 5000; // 5k to 50k FCFA
      limiteCredit = soldeEpargne * 2.5; // Solvability double of savings
    }

    const newUser: User = {
      id: 'USR_' + Math.random().toString(36).substr(2, 9),
      nom: nom.trim(),
      telephone: telephone.trim(),
      role: selectedRole,
      region,
      gieNom: selectedRole === 'PRODUCTEUR' ? gieNom.trim() : undefined,
      matriculeAgent: selectedRole === 'AGENT' ? matriculeAgent.trim() : undefined,
      serviceUnite: selectedRole === 'GESTIONNAIRE' ? serviceUnite.trim() : undefined,
      soldeEpargne,
      limiteCredit
    };

    // Save mock db in localStorage
    const usersStore = JSON.parse(localStorage.getItem('microfin_all_users') || '[]');
    usersStore.push(newUser);
    localStorage.setItem('microfin_all_users', JSON.stringify(usersStore));

    // Sign in trigger
    localStorage.setItem('microfin_user', JSON.stringify(newUser));
    setSuccessMsg('Votre compte a été créé avec succès ! Bienvenue chez MicroFin.');
    
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 1200);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginTelephone.trim()) {
      setErrorMsg('Veuillez saisir votre numéro de téléphone.');
      return;
    }

    // Lookup in our simulated local DB first
    const usersStore = JSON.parse(localStorage.getItem('microfin_all_users') || '[]');
    let matchedUser = usersStore.find(
      (u: any) => u.telephone.replace(/\s+/g, '') === loginTelephone.replace(/\s+/g, '') && u.role === loginRole
    );

    // If not found in dynamic registrations, let's auto-generate a realistic mock profile so the app works instantly
    if (!matchedUser) {
      let gieChoice = 'GIE Teranga';
      let matricule = 'AG-221-7789';
      let service = 'Unité de Contrôle Central';
      let testName = 'Producteur Invité';

      if (loginRole === 'PRODUCTEUR') {
        testName = 'Cire Demba Diallo';
        gieChoice = 'GIE Deggo Kaolack';
      } else if (loginRole === 'AGENT') {
        testName = 'Khady Sourang';
        matricule = 'AG-221-5502';
      } else {
        testName = 'Amadou Fall';
        service = 'Sénégal Micro-Crédits Direction';
      }

      matchedUser = {
        id: 'USR_AUTO_' + Math.floor(Math.random() * 10000),
        nom: testName,
        telephone: loginTelephone,
        role: loginRole,
        region: 'Kaolack',
        gieNom: loginRole === 'PRODUCTEUR' ? gieChoice : undefined,
        matriculeAgent: loginRole === 'AGENT' ? matricule : undefined,
        serviceUnite: loginRole === 'GESTIONNAIRE' ? service : undefined,
        soldeEpargne: loginRole === 'PRODUCTEUR' ? 24500 : undefined,
        limiteCredit: loginRole === 'PRODUCTEUR' ? 65000 : undefined
      };

      // save auto-generated user to listings
      usersStore.push(matchedUser);
      localStorage.setItem('microfin_all_users', JSON.stringify(usersStore));
    }

    localStorage.setItem('microfin_user', JSON.stringify(matchedUser));
    setSuccessMsg(`Ravi de vous revoir, ${matchedUser.nom} !`);

    setTimeout(() => {
      onLoginSuccess(matchedUser);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Decorative upper banner */}
        <div className="bg-gradient-to-r from-primary to-emerald-700 px-6 py-5 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <div>
              <h3 className="font-display font-extrabold text-lg leading-tight">Espace Membre</h3>
              <p className="text-[10px] text-emerald-100 font-medium uppercase tracking-widest">
                Portail Centralisé Sénégal
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer text-white"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 shrink-0">
          <button
            onClick={() => { setActiveTab('connexion'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'connexion' 
                ? 'border-primary text-primary bg-primary/5 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Se connecter</span>
          </button>
          <button
            onClick={() => { setActiveTab('inscription'); setErrorMsg(null); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'inscription' 
                ? 'border-primary text-primary bg-primary/5 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>S'inscrire</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-5">
          
          {/* Notifications */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="bg-red-50 text-red-700 text-xs p-3.5 rounded-2xl border border-red-100 flex items-center gap-2"
              >
                <span>⚠️</span>
                <span className="font-semibold">{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="bg-emerald-50 text-[#1A7A3E] text-xs p-3.5 rounded-2xl border border-emerald-150 flex items-center gap-2"
              >
                <span>🚀</span>
                <span className="font-bold">{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'connexion' ? (
            /* CONNEXION FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                  Quel est votre profil ?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'PRODUCTEUR', label: 'Producteur', icon: '🌾' },
                    { id: 'AGENT', label: 'Agent Terrain', icon: '📋' },
                    { id: 'GESTIONNAIRE', label: 'Gestionnaire', icon: '🏛️' }
                  ].map((roleOpt) => (
                    <button
                      key={roleOpt.id}
                      type="button"
                      onClick={() => setLoginRole(roleOpt.id as UserRole)}
                      className={`py-2 px-1 text-[11px] font-bold rounded-xl transition border cursor-pointer text-center flex flex-col items-center gap-0.5 justify-center ${
                        loginRole === roleOpt.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      <span className="text-base">{roleOpt.icon}</span>
                      <span>{roleOpt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="loginPhone" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                    🇸🇳 +221
                  </span>
                  <input
                    id="loginPhone"
                    type="tel"
                    required
                    placeholder="77 123 45 67"
                    value={loginPhoneInputFormatter(loginTelephone)}
                    onChange={(e) => setLoginTelephone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-3 px-4 pl-18 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/15"
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic mt-0.5">
                  Aucun mot de passe requis ! Connectez-vous par clé de téléphone. Des profils d'exemples s'auto-génèrent instantanément.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg shadow-primary/15 cursor-pointer text-center"
              >
                Entrer dans mon espace 🔑
              </button>
            </form>
          ) : (
            /* INSCRIPTION FORM */
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Role Selection inside registration */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                  Sélectionnez votre type de profil
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'PRODUCTEUR', label: 'Producteur', icon: '🌾' },
                    { id: 'AGENT', label: 'Agent Terrain', icon: '📋' },
                    { id: 'GESTIONNAIRE', label: 'Gestionnaire', icon: '🏛️' }
                  ].map((roleOpt) => (
                    <button
                      key={roleOpt.id}
                      type="button"
                      onClick={() => setSelectedRole(roleOpt.id as UserRole)}
                      className={`py-2.5 px-1 text-[11px] font-bold rounded-xl transition border cursor-pointer text-center flex flex-col items-center gap-0.5 justify-center ${
                        selectedRole === roleOpt.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      <span className="text-base">{roleOpt.icon}</span>
                      <span>{roleOpt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label htmlFor="regName" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                    Nom Complet
                  </label>
                  <input
                    id="regName"
                    type="text"
                    required
                    placeholder="Moussa Sall"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="regPhone" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                    Numéro Téléphone
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      +221
                    </span>
                    <input
                      id="regPhone"
                      type="tel"
                      required
                      placeholder="784561234"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-3 pl-12 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Region and specific conditional fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                    Région Agricole
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-3 text-xs font-semibold focus:outline-none"
                  >
                    {regionsSénégal.map((reg) => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional profiles meta */}
                {selectedRole === 'PRODUCTEUR' && (
                  <div className="space-y-1.5">
                    <label htmlFor="regGie" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                      Nom de votre GIE
                    </label>
                    <input
                      id="regGie"
                      type="text"
                      placeholder="GIE Teranga Kaolack"
                      value={gieNom}
                      onChange={(e) => setGieNom(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none animate-fadeIn"
                    />
                  </div>
                )}

                {selectedRole === 'AGENT' && (
                  <div className="space-y-1.5">
                    <label htmlFor="regMatricule" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                      Matricule de Terrain
                    </label>
                    <input
                      id="regMatricule"
                      type="text"
                      placeholder="AG-221-7789"
                      value={matriculeAgent}
                      onChange={(e) => setMatriculeAgent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none animate-fadeIn"
                    />
                  </div>
                )}

                {selectedRole === 'GESTIONNAIRE' && (
                  <div className="space-y-1.5">
                    <label htmlFor="regService" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                      Unité de Validation
                    </label>
                    <input
                      id="regService"
                      type="text"
                      placeholder="Direction Centrale"
                      value={serviceUnite}
                      onChange={(e) => setServiceUnite(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none animate-fadeIn"
                    />
                  </div>
                )}
              </div>

              {/* Explanatory disclaimer per role */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2">
                <span className="text-xs mt-0.5">ℹ️</span>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {selectedRole === 'PRODUCTEUR' && "Vous serez enregistré avec une épargne de départ simulée et une limite de crédit calculée instantanément d'après l'historique de votre GIE."}
                  {selectedRole === 'AGENT' && "Vous disposerez de l'accès mobile de contrôle, la synchronisation du statut cloud des fiches observées et l'outil de dictée vocale locale."}
                  {selectedRole === 'GESTIONNAIRE' && "Vous pourrez approuver ou rejeter les demandes de micro-crédits et d'adhésion aux tontines des producteurs de votre région."}
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1A7A3E] hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-lg cursor-pointer text-center"
              >
                Créer mon compte & Me Connecter 🎉
              </button>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}

// Simple formatter to format entered Senegal telephone on the fly to look clean (77 xxx xx xx)
function loginPhoneInputFormatter(val: string) {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return `${clean.slice(0, 2)} ${clean.slice(2)}`;
  if (clean.length <= 7) return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`;
  return `${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5, 7)} ${clean.slice(7, 9)}`;
}
