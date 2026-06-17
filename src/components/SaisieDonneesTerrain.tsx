import React, { useState } from 'react';
import { Send, FileText, Bot, AlertCircle, Sparkles, HelpCircle, ClipboardCheck, ArrowRight, CornerDownRight, Landmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SaisieDonneesTerrain() {
  const [donnees, setDonnees] = useState('');
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

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
  };

  const handleGenerateFiche = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donnees.trim() || !question.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResultText(null);

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
            
            {/* Input 1: Textarea */}
            <div className="space-y-2">
              <label htmlFor="donneesTerrain" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                Données observées
              </label>
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

            {/* Input 2: Question */}
            <div className="space-y-2">
              <label htmlFor="questionTerrain" className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block">
                Votre question
              </label>
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
                  <div className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-white rounded-xl p-4 border border-slate-150/70">
                    {resultText}
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
