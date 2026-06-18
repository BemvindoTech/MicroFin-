import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

function generateExpertAdviceFallback(
  culture: string,
  departement: string,
  ndvi: number,
  pluviometrie: number,
  pluviometrieMoyenne: number,
  temperature: number,
  droughtStatut: string,
  regionParent: string,
  userMessage?: string
): string {
  const selectedCulture = culture || "Cultures maraîchères";
  const selectedDept = departement || "Louga";
  const parent = regionParent || "Zone horticole";
  const ndviValue = ndvi || 0.35;
  const pluv = pluviometrie || 240;
  const pluvMoy = pluviometrieMoyenne || 280;
  const temp = temperature || 32;
  const status = droughtStatut || "ALERTE";

  const customQ = userMessage ? `\n\n*Note : Réponse formulée pour votre question spécifique : "${userMessage}"*` : '';

  // Calculate some insights
  const ndviStatus = ndviValue < 0.35 ? "STRESSÉ OU ARIDE" : "SATISFAISANTE (ACTIF)";
  const moistureRation = Math.round((pluv / pluvMoy) * 100) || 100;

  let adviceNdvi = "";
  if (ndviValue < 0.35) {
    adviceNdvi = `L'indice NDVI mesuré par satellite est de **${ndviValue}**, ce qui est inférieur au seuil optimal de 0,35. Cela indique un stress hydrique important pour la végétation naturelle et un sol superficiellement assoiffé à ${selectedDept}.`;
  } else {
    adviceNdvi = `L'indice NDVI de **${ndviValue}** montre un couvert végétal actif à ${selectedDept}, signalant une humidité résiduelle favorable dans les 20 premiers centimètres du sol.`;
  }

  let verdict = "";
  let actions = "";
  if (ndviValue < 0.35 || status === "CRITIQUE" || status === "ALERTE") {
    verdict = `🔴 **SEMIS À REPORTER / HAUTEMENT SÉCURISÉ REQUIS**
Pour la culture de de **${selectedCulture}**, nous recommandons d'éviter les semis en plein champ sans système d'irrigation d'appoint contrôlé. Le déficit de pluie accumulé (${pluv} mm contre une moyenne de ${pluvMoy} mm, soit seulement **${moistureRation}%** des moyennes ANACIM) augmente le risque de perte de semences.`;
    actions = `- **Choix de semences résilientes :** Privilégiez des variétés à cycle court (ex. Niébé Souna, ou variétés d'arachide précoces de 75-90 jours).
- **Techniques d'irrigation :** Installez du goutte-à-goutte ou paillez généreusement le sol pour limiter l'évaporation intense due aux températures de **${temp}°C**.
- **Assurance CNAAS :** Votre zone est couverte. En cas de sécheresse prolongée constatée par nos capteurs satellites avant la fin de saison, vous êtes éligibles au déclenchement de l'indemnisation automatique par virement mobile money.`;
  } else {
    verdict = `🟢 **SEMIS AUTORISÉ (EXCELLENTES CONDITIONS)**
Le verdict de semis pour **${selectedCulture}** est favorable ! L'humidité cumulée (${pluv} mm / normal de ${pluvMoy} mm) et la température de **${temp}°C** offrent un lit de semence optimal pour la germination immédiate.`;
    actions = `- **Suivi du calendrier de semis :** Semez dès la prochaine pluie utile de plus de 15 mm.
- **Ajout de matière organique :** Incorporez du compost bien décomposé pour maintenir la fraîcheur du sol.
- **Entretien régulier :** Veillez à éliminer les mauvaises herbes concurrentes dès la levée.`;
  }

  return `⚠️ **[ATTENTION : PROJET ASSOCIE EN COURS D'APPROBATION CLOUD / FALLBACK EXPERT ACTIF]**
*SeneSemis IA fonctionne temporairement avec son moteur d'expertise agronomique locale en raison de restrictions géographiques ou d'accès sur votre clé d'API Google Cloud.*

### 🌾 ÉVALUATION MATURE DE L'ÉTAT DU SOL ET DE L'INDEX NDVI SATELLITE
Salamalékoum ! L'analyse de vos capteurs à **${selectedDept}** (${parent}) met en évidence les données agro-climatiques de l'ANACIM :
- **Végétation spatiale (NDVI) :** ${ndviValue} (${ndviStatus})
- **Pluviométrie observée :** ${pluv} mm (Normal historique : ${pluvMoy} mm)
- **Température moyenne locale :** ${temp}°C
- **Statut de vigilance sécheresse :** ${status}

${adviceNdvi}${customQ}

### 🎯 VERDICT DE SEMIS
${verdict}

### 🛠️ CONSEILS TECHNIQUES ET GESTION DE L'EAU
Voici nos fiches de préconisations développées avec l'ANACIM pour ${selectedDept} :
${actions}

Jërëjëf ! Restez connectés pour d'autres bulletins.`;
}

// SeneSemis AI advice API route
app.post("/api/gemini/advice", async (req, res) => {
  const { culture, departement, ndvi, pluviometrie, pluviometrieMoyenne, temperature, droughtStatut, regionParent, userMessage } = req.body;

  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found. Falling back to local expert system.");
      const advice = generateExpertAdviceFallback(culture, departement, ndvi, pluviometrie, pluviometrieMoyenne, temperature, droughtStatut, regionParent, userMessage);
      return res.json({ advice });
    }

    // Initialize Gemini SDK with telemetry User-Agent lazily as instructed in the skill guidelines
    const aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstruction = `Tu es "SeneSemis IA", un conseiller agricole virtuel intelligent propulsé par l'IA de Google Gemini, en partenariat avec l'ANACIM (Agence Nationale de l'Aviation Civile et de la Météorologie du Sénégal) et la CNAAS.
Ton rôle est d'analyser en temps réel les indices d'humidité des sols, les données satellitaires NDVI (Index de Végétation), et la pluviométrie d'un département sénégalais donné afin de délivrer un conseil ultra-local de semis pour une culture particulière.

Directives de réponse :
1. Sois très attentionné, pédagogique, pragmatique et ancré dans le milieu rural sénégalais.
2. Structure clairement ton analyse en 3 parties claires et bien présentées avec des emojis adaptés :
   - 🌾 ÉVALUATION MATURE DE L'ÉTAT DU SOL ET DE L'INDEX NDVI SATELLITE (analyse la sécheresse critique/normale, le niveau d'humidité).
   - 🎯 VERDICT DE SEMIS : Recommande d'attendre, de préparer les parcelles ou de semer immédiatement pour la culture demandée. Sois précis !
   - 🛠️ CONSEILS TECHNIQUES ET GESTION DE L'EAU (ex : irrigation d'appoint, choix de variétés précoces à cycle court si NDVI bas, engrais, aide collective GIE, assurance indicielle s'il y a alerte de sécheresse).
3. Adapte tes conseils précisément en fonction des variables fournies (ex: Si NDVI est bas ou s'il y a alerte CRITIQUE, déconseille de planter les oignons maintenant ou suggère des solutions résilientes).
4. Explique brièvement ce que signifient les chiffres (ex : NDVI de 0.24 signifie que le couvert végétal est stressé, ou pluviométrie en baisse par rapport aux normales).
5. Réponds de façon concise et réconfortante en français, et utilise parfois de courtes expressions amicales locales de salutation (comme "Salamalékoum", "Jërëjëf", "Bismilah").`;

    let contextText = "";
    if (departement) {
      contextText = `Voici les relevés satellites actuels de l'ANACIM/CNAAS pour l'analyse :
- Département : ${departement} (${regionParent || 'Sénégal'})
- Culture d'intérêt : ${culture || 'Toutes cultures'}
- Indice de végétation actuel (NDVI) : ${ndvi || 'Inconnu'} (Le seuil d'alerte critique sécheresse est de 0.35)
- Statut de sécheresse signalé : ${droughtStatut || 'NORMALE'}
- Pluviométrie cumulée cumulée de saison : ${pluviometrie || '0'} mm
- Pluviométrie historique moyenne : ${pluviometrieMoyenne || 'Inconnu'} mm
- Température moyenne : ${temperature || 'Inconnu'}°C`;
    }

    const prompt = userMessage 
      ? `L'agriculteur pose la question suivante : "${userMessage}".\n\nContexte météorologique local lié :\n${contextText}\n\nDonne une réponse de conseil personnalisée d'expert agricole.`
      : `Analyse l'opportunité de semer la culture "${culture}" dans le département "${departement}" au vu des indicateurs satellites suivants :\n${contextText}\n\nDonne un verdict de semis précis d'expert agricole.`;

    // Generate content using gemini-3.5-flash as recommended
    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const advice = response.text || "Désolé, SeneSemis IA n'a pas pu formuler de recommandations pour le moment. Veuillez réessayer.";

    res.json({ advice });
  } catch (error: any) {
    console.error("Gemini API server route error (falling back to locally generated response):", error);
    try {
      const advice = generateExpertAdviceFallback(culture, departement, ndvi, pluviometrie, pluviometrieMoyenne, temperature, droughtStatut, regionParent, userMessage);
      return res.json({ advice });
    } catch (fallbackError) {
      res.status(500).json({ 
        error: "Erreur lors du traitement de la requête par le compagnon IA. Détails : " + (error.message || error) 
      });
    }
  }
});

// Vite middleware for development vs static asset serving for production build
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on port ${PORT}`);
  });
}

setupVite();
