import React, { useState } from 'react';
import { Mail, Phone, MapPin, Compass, CheckCircle2, ChevronRight, HelpCircle, Send, Users, ShieldCheck, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nomComplet: '',
    email: '',
    telephone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API process time
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  const resetForm = () => {
    setFormData({ nomComplet: '', email: '', telephone: '', message: '' });
    setIsSubmitted(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12 animate-fadeIn">
      
      {/* HEADER SECTION */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-accent font-bold text-xs uppercase tracking-widest bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
          Assistance de Proximité
        </span>
        <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-slate-950">
          Nous sommes à vos côtés
        </h1>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Que vous soyez un producteur agricole autonome, un dirigeant de tontine locale, ou un président de Groupement d’Intérêt Économique (GIE), nos conseillers dédiés vous accompagnent dans toutes vos démarches.
        </p>
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CONTACT DETAILS & INFO INFO (4 cols desktop) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Stats/Badges */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-6">
            <h3 className="font-display font-extrabold text-slate-900 text-lg">
              Bureau Principal MicroFin
            </h3>

            <div className="space-y-4 text-slate-600 text-xs sm:text-sm">
              {/* Address */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Adresse Bureau</span>
                  <p className="text-slate-600 mt-0.5 font-medium">
                    Avenue Cheikh Anta Diop, Dakar, Sénégal
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Téléphone d'Assistance</span>
                  <p className="text-slate-600 mt-0.5 font-medium">
                    +221 33 800 00 00
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Lundi au Vendredi (8h00 - 18h00)
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">Adresse E-mail</span>
                  <p className="text-slate-600 mt-0.5 font-medium">
                    contact@microfin.sn
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Réponse sous 24h ouvrées
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Localized GIE Notice */}
          <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-6 border border-primary/10 space-y-3">
            <h4 className="font-display font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" /> Spécial Groupements (GIE) :
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Pour les collectifs de plus de 10 personnes se situant dans les zones de Saint-Louis, Thiès, Kaolack ou Kaffrine, nous nous déplaçons directement sur vos parcelles pour tester et configurer vos tontines USSD. Indiquez-le dans le message !
            </p>
            <div className="flex items-center gap-1 text-[11px] text-primary font-bold">
              <span>Service gratuit d'amorçage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* INTERACTIVE FORM SECTION (7 cols desktop) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="font-display font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-3">
                Envoyer un message à l'équipe MicroFin
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="nomComplet" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="nomComplet"
                    required
                    placeholder="Ex: Babacar Diop"
                    value={formData.nomComplet}
                    onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all text-slate-800"
                  />
                </div>

                {/* E-mail */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Adresse E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="Ex: babacar.diop@orange.sn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* Telephone */}
              <div className="space-y-1.5">
                <label htmlFor="telephone" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Téléphone (Wave / WhatsApp / SMS)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="telephone"
                    required
                    placeholder="77 123 45 67"
                    pattern="^(77|78|76|75|70)[0-9]{7}$"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-4 pl-10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all text-slate-800"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">🇸🇳</span>
                </div>
                <span className="block text-[10px] text-slate-400 italic">
                  Format local à 9 chiffres : 771234567, 78..., 76...
                </span>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Votre Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  placeholder="Expliquez ici votre culture maraîchère, les besoins de votre GIE en crédit, en tontine ou en assurance..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary rounded-xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all text-slate-800"
                ></textarea>
              </div>

              {/* Submit button conforming exactly to #059669 */}
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: '#059669' }}
                className="w-full text-white text-xs font-bold py-3.5 px-6 rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-900/10 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-accent" />
                    <span>Envoyer mon formulaire</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="py-12 px-4 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-primary mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#059669]" />
              </div>

              <div className="space-y-2">
                <h3 className="font-display font-extrabold text-[#059669] text-xl">
                  Message reçu de Babacar !
                </h3>
                <p className="text-slate-600 text-xs max-w-sm mx-auto leading-relaxed">
                  Merci <strong>{formData.nomComplet}</strong>. Vos coordonnées téléphoniques (<strong>{formData.telephone}</strong>) ont été transmises à notre cellule d'inclusion agricole. Un conseiller MicroFin va prendre contact avec vous.
                </p>
              </div>

              {/* simulated confirmation details receipt */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 max-w-sm mx-auto text-left space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between border-b pb-1 font-bold text-slate-800">
                  <span>Accusé de dépôt</span>
                  <span className="text-primary font-mono text-[10px]">#MF-{(Math.floor(Math.random() * 89999) + 10000)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Secteur territorial :</span>
                  <span className="font-semibold text-slate-800">Dakar (Avenue CAD)</span>
                </div>
                <div className="flex justify-between">
                  <span>Adresse E-mail :</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Délai de traitement :</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> &lt; 2h par SMS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="text-primary hover:text-primary-hover font-bold text-xs underline cursor-pointer"
              >
                Envoyer un autre message
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
