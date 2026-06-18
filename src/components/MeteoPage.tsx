import React, { useState, useEffect } from 'react';
import { 
  CloudRain, Wind, Thermometer, Droplets, ShieldAlert, Sparkles, 
  Volume2, VolumeX, Landmark, Satellite, RefreshCw, Layers, 
  CheckCircle2, ChevronRight, Languages, AlertCircle, HelpCircle,
  TrendingUp, BarChart3, Radio, FileCheck2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';

// Meteorological dataset for Senegalese agricultural regions
interface DepMeteoData {
  id: string;
  nom: string;
  regionParent: string;
  statutDrought: 'CRITIQUE' | 'ALERTE' | 'NORMALE' | 'OPTIMAL';
  ndvi: number; // Normalized Difference Vegetation Index (0 to 1)
  ndviMinThreshold: number; // Trigger threshold (anything below is paid)
  pluviometrieCumulee: number; // mm
  pluviometrieMoyenne: number; // mm (historical average)
  temperature: number; // °C
  humidite: number; // %
  vent: number; // km/h
  indemniteDeclenchee: boolean;
  tauxIndemnite: number; // FCFA per hectare
  gieMembres: number; // Coops registered
  dernierVersement: string; // date
  phonetics: {
    fr: { text: string; audioText: string };
    wo: { text: string; audioText: string };
    sr: { text: string; audioText: string };
    pu: { text: string; audioText: string };
  };
  historiqueEvolution: Array<{
    mois: string;
    pluvioReel: number;
    pluvioMoyenne: number;
    ndviActuel: number;
  }>;
}
const DEPARTEMENTS_METEO: Record<string, DepMeteoData> = {
  podor: {
    id: 'podor',
    nom: 'Podor',
    regionParent: 'Saint-Louis',
    statutDrought: 'CRITIQUE',
    ndvi: 0.24,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 110,
    pluviometrieMoyenne: 240,
    temperature: 41,
    humidite: 22,
    vent: 21,
    indemniteDeclenchee: true,
    tauxIndemnite: 55000,
    gieMembres: 34,
    dernierVersement: '15 Juin 2026',
    phonetics: {
      fr: {
        text: "[Pau-dorr] : Indice NDVI critique de 0,24 (Seuil d'indemnisation à 0,35). Indemnisation automatique de 55 000 FCFA/hectare déclenchée pour Podor.",
        audioText: "Alerte Podor. L'indice satellite montre un déficit de pluie sévère. L'indemnisation de cinquante-cinq mille francs par hectare est activée automatiquement par la CNAAS."
      },
      wo: {
        text: "Ndakaaru Podor : Ndox mi tuuti na lool. Xaaliss bi ñeel ndimbal war na mën a jott.",
        audioText: "Podor weuy na ndox. Téeméere ak juroom ñetti junni ci waal gou né war nala fey liggey bi."
      },
      sr: {
        text: "Podor : Tew ye wetna o fi. Satélit o ande o ke yen.",
        audioText: "Podor o wet a ande tew feet. Ndof o ande fa mbin, xaliss a feyna ley mbin."
      },
      pu: {
        text: "Podor : Ndiyam famdi be sanne. Kaaliss mballgu foti hoccude joni.",
        audioText: "Podor ndiyam famdi sanne. Kaaliri mbalitogu sappo e joyi ujunere hoccama kadi."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.18 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 2, ndviActuel: 0.16 },
      { mois: 'Mar', pluvioReel: 2, pluvioMoyenne: 1, ndviActuel: 0.15 },
      { mois: 'Avr', pluvioReel: 1, pluvioMoyenne: 1, ndviActuel: 0.15 },
      { mois: 'Mai', pluvioReel: 5, pluvioMoyenne: 6, ndviActuel: 0.18 },
      { mois: 'Juin', pluvioReel: 12, pluvioMoyenne: 32, ndviActuel: 0.21 },
      { mois: 'Juil', pluvioReel: 45, pluvioMoyenne: 110, ndviActuel: 0.24 },
      { mois: 'Août', pluvioReel: 45, pluvioMoyenne: 87, ndviActuel: 0.24 }
    ]
  },
  linguere: {
    id: 'linguere',
    nom: 'Linguère',
    regionParent: 'Louga (Zone Ferlo)',
    statutDrought: 'ALERTE',
    ndvi: 0.32,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 180,
    pluviometrieMoyenne: 290,
    temperature: 39,
    humidite: 31,
    vent: 18,
    indemniteDeclenchee: true,
    tauxIndemnite: 35000,
    gieMembres: 41,
    dernierVersement: '12 Juin 2026',
    phonetics: {
      fr: {
        text: "[Lain-gheur] : Indice NDVI de 0,32 (Seuil 0,35). Déficit modéré relevé. Indemnité anticipée de 35 000 FCFA/hectare déclenchée.",
        audioText: "Alerte vigilance à Linguère. NDVI en dessous des normales de saison. Les indemnités ont été libérées à hauteur de trente-cinq mille francs par hectare."
      },
      wo: {
        text: "Linguère : Ndox mi macc na lu jéggi dayo. Ñu tàmbatali fey xaaliss yi.",
        audioText: "Linguère ndox ma macc na. LIGUEY BI fey nagnou téemeeere ak juroom niet junni."
      },
      sr: {
        text: "Linguère : Fite ref tew. Satélit la andone o mbin a ref no feex.",
        audioText: "Linguere fite a tew. Ndid a feyle no xaaliss mbin."
      },
      pu: {
        text: "Linguère: Ndiyam ko famdi koni o foti hoccude.",
        audioText: "Linguère ndiyam famdi, koni mballgu sappo e tatiri hebooma."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 1, pluvioMoyenne: 2, ndviActuel: 0.22 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.20 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.18 },
      { mois: 'Avr', pluvioReel: 3, pluvioMoyenne: 2, ndviActuel: 0.18 },
      { mois: 'Mai', pluvioReel: 8, pluvioMoyenne: 12, ndviActuel: 0.24 },
      { mois: 'Juin', pluvioReel: 25, pluvioMoyenne: 56, ndviActuel: 0.29 },
      { mois: 'Juil', pluvioReel: 143, pluvioMoyenne: 216, ndviActuel: 0.32 },
      { mois: 'Août', pluvioReel: 180, pluvioMoyenne: 290, ndviActuel: 0.32 }
    ]
  },
  kaolack: {
    id: 'kaolack',
    nom: 'Kaolack',
    regionParent: 'Bassin Arachidier',
    statutDrought: 'NORMALE',
    ndvi: 0.48,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 490,
    pluviometrieMoyenne: 510,
    temperature: 34,
    humidite: 55,
    vent: 14,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 58,
    dernierVersement: 'Aucun (Végétation satisfaisante)',
    phonetics: {
      fr: {
        text: "[Kao-lack] : Végétation dans les normes (NDVI 0,48 supérieur au seuil critique de 0,35). Statut d'assurance inactif.",
        audioText: "Kaolack présente un indice végétal normal et de bonnes précipitations. Aucune sécheresse critique n'est observée, l'assurance reste en veille."
      },
      wo: {
        text: "Kaolack : Mbaye mi am na taw. Sa tontine ak sa dound baax na.",
        audioText: "Kaolack am na taw bu barree. Mbax lool moudi souniou tool."
      },
      sr: {
        text: "Kaolack : Tew ye mo fexna ref. Ndap can a ref no feex.",
        audioText: "Kaolack tew can feet fex. Mbaye can can."
      },
      pu: {
        text: "Kaolack: Ndiyam ko hewi loll. Ngesa foti beyde joni.",
        audioText: "Kaolack ndiyam hewi, alaa sena sabaabu kaliss."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 1, pluvioMoyenne: 1, ndviActuel: 0.28 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.25 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.22 },
      { mois: 'Avr', pluvioReel: 0, pluvioMoyenne: 2, ndviActuel: 0.20 },
      { mois: 'Mai', pluvioReel: 15, pluvioMoyenne: 20, ndviActuel: 0.29 },
      { mois: 'Juin', pluvioReel: 85, pluvioMoyenne: 92, ndviActuel: 0.36 },
      { mois: 'Juil', pluvioReel: 389, pluvioMoyenne: 395, ndviActuel: 0.44 },
      { mois: 'Août', pluvioReel: 490, pluvioMoyenne: 510, ndviActuel: 0.48 }
    ]
  },
  matam: {
    id: 'matam',
    nom: 'Matam',
    regionParent: 'Vallée du Fleuve',
    statutDrought: 'CRITIQUE',
    ndvi: 0.21,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 95,
    pluviometrieMoyenne: 280,
    temperature: 42,
    humidite: 18,
    vent: 25,
    indemniteDeclenchee: true,
    tauxIndemnite: 60000,
    gieMembres: 29,
    dernierVersement: '14 Juin 2026',
    phonetics: {
      fr: {
        text: "[Ma-tam] : Stress hydrique aigu (NDVI 0,21). Indemnisation maximale activée à 60 000 FCFA/hectare par virement mobile instantané.",
        audioText: "Alerte extrême à Matam. Pluviométrie historiquement basse. Déclenchement automatique de l'aide satellite à hauteur de soixante mille francs par hectare."
      },
      wo: {
        text: "Matam: Ndox mégi macc, droug ye barree na. War nagnu leen ndimbal xaliss ji.",
        audioText: "Matam ndox mi macc na lool. Waar nagn ko yeley xalliss juroom ben fuki junni."
      },
      sr: {
        text: "Matam: Tew feet wetna tew. Fila ye ando.",
        audioText: "Matam fite wetna ley tew. Satelit o andone ley mbin."
      },
      pu: {
        text: "Matam: Sanne ndiyam famdi loll. Hoccama kaaliss tatan joni.",
        audioText: "Matam sanne ndiyam famdi. Timmi mballgu sappo e jeenayi mballitogu moussama."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.16 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.15 },
      { mois: 'Mar', pluvioReel: 1, pluvioMoyenne: 0, ndviActuel: 0.14 },
      { mois: 'Avr', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.14 },
      { mois: 'Mai', pluvioReel: 2, pluvioMoyenne: 5, ndviActuel: 0.16 },
      { mois: 'Juin', pluvioReel: 7, pluvioMoyenne: 43, ndviActuel: 0.18 },
      { mois: 'Juil', pluvioReel: 35, pluvioMoyenne: 120, ndviActuel: 0.20 },
      { mois: 'Août', pluvioReel: 95, pluvioMoyenne: 280, ndviActuel: 0.21 }
    ]
  },
  dakar: {
    id: 'dakar',
    nom: 'Dakar',
    regionParent: 'Capitale (Presqu’île)',
    statutDrought: 'OPTIMAL',
    ndvi: 0.58,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 450,
    pluviometrieMoyenne: 430,
    temperature: 28,
    humidite: 82,
    vent: 19,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 12,
    dernierVersement: 'Aucun (Zone Horticole stable)',
    phonetics: {
      fr: {
        text: "[Da-kar] : Climat côtier régulé, NDVI de 0,58. Écosystème horticole stable et hors de risque de sécheresse.",
        audioText: "Dakar présente une situation stable. Régulation côtière favorable aux cultures urbaines et maraîchères de la presqu'île."
      },
      wo: {
        text: "Ndakaaru : Mbay mi mu ngi dox ci asamaan bu rëy.",
        audioText: "Ndakaaru mbaya rafet na lool lii de dund la."
      },
      sr: {
        text: "Dakar : Can e fex kene.",
        audioText: "Dakar tew fex ref o ande."
      },
      pu: {
        text: "Dakar : Ndiyam foti kadi joni.",
        audioText: "Dakar ndiyam foti, ngesa na rafetee sanne."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.40 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.38 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.38 },
      { mois: 'Avr', pluvioReel: 1, pluvioMoyenne: 1, ndviActuel: 0.36 },
      { mois: 'Mai', pluvioReel: 8, pluvioMoyenne: 5, ndviActuel: 0.42 },
      { mois: 'Juin', pluvioReel: 55, pluvioMoyenne: 48, ndviActuel: 0.49 },
      { mois: 'Juil', pluvioReel: 220, pluvioMoyenne: 210, ndviActuel: 0.55 },
      { mois: 'Août', pluvioReel: 450, pluvioMoyenne: 430, ndviActuel: 0.58 }
    ]
  },
  thies: {
    id: 'thies',
    nom: 'Thiès',
    regionParent: 'Thiès (Niayes Horticoles)',
    statutDrought: 'NORMALE',
    ndvi: 0.46,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 520,
    pluviometrieMoyenne: 540,
    temperature: 32,
    humidite: 65,
    vent: 15,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 48,
    dernierVersement: 'Aucun (Irrigation adéquate)',
    phonetics: {
      fr: {
        text: "[Tyes] : NDVI à 0,46. Climat semi-aride stabilisé par les nappes phréatiques côtières des Niayes.",
        audioText: "Thiès est dans les normales avec un excellent dynamisme arboricole. Aucun seuil de sinistre n'est atteint."
      },
      wo: {
        text: "Thiès : Mbaye mi mu ngi dox bu baax.",
        audioText: "Thiès mbaye mi am na taw té rafet na."
      },
      sr: {
        text: "Thies : Tew na fex mbay.",
        audioText: "Thies ref o ande tew feet."
      },
      pu: {
        text: "Thies : Ngesa mi foti hoccude.",
        audioText: "Thies mballitogu alaa ko ngesa foti hewde."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.30 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.28 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.26 },
      { mois: 'Avr', pluvioReel: 2, pluvioMoyenne: 2, ndviActuel: 0.28 },
      { mois: 'Mai', pluvioReel: 15, pluvioMoyenne: 12, ndviActuel: 0.32 },
      { mois: 'Juin', pluvioReel: 90, pluvioMoyenne: 85, ndviActuel: 0.39 },
      { mois: 'Juil', pluvioReel: 310, pluvioMoyenne: 330, ndviActuel: 0.44 },
      { mois: 'Août', pluvioReel: 520, pluvioMoyenne: 540, ndviActuel: 0.46 }
    ]
  },
  diourbel: {
    id: 'diourbel',
    nom: 'Diourbel',
    regionParent: 'Bassin Arachidier Nord',
    statutDrought: 'ALERTE',
    ndvi: 0.34,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 280,
    pluviometrieMoyenne: 360,
    temperature: 38,
    humidite: 40,
    vent: 16,
    indemniteDeclenchee: true,
    tauxIndemnite: 30000,
    gieMembres: 37,
    dernierVersement: '10 Juin 2026',
    phonetics: {
      fr: {
        text: "[Dewrb-el] : NDVI à 0,34, juste sous le seuil d'alerte (0,35). Indemnisation de 30 000 FCFA/ha distribuée d'urgence.",
        audioText: "Vigilance Diourbel. L'assurance sécheresse indicielle satellite s'active en raison d'une baisse notable de l'indice végétal."
      },
      wo: {
        text: "Njaaréem : Ndox macc na té taw bi weuy na.",
        audioText: "Njaaréem ndox mi macc na lu jéggi dayo. Ñu wara fey ndimbal."
      },
      sr: {
        text: "Diourbel : O wet a ande fite.",
        audioText: "Diourbel tew na fex o ande no mbin."
      },
      pu: {
        text: "Diourbel : Ndiyam ko famdi koni foti hebooma.",
        audioText: "Diourbel ndiyam famdi sanne, kaliss mballgu foti hoccude."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.22 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.20 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.18 },
      { mois: 'Avr', pluvioReel: 1, pluvioMoyenne: 2, ndviActuel: 0.18 },
      { mois: 'Mai', pluvioReel: 10, pluvioMoyenne: 15, ndviActuel: 0.22 },
      { mois: 'Juin', pluvioReel: 45, pluvioMoyenne: 70, ndviActuel: 0.28 },
      { mois: 'Juil', pluvioReel: 180, pluvioMoyenne: 230, ndviActuel: 0.32 },
      { mois: 'Août', pluvioReel: 280, pluvioMoyenne: 360, ndviActuel: 0.34 }
    ]
  },
  fatick: {
    id: 'fatick',
    nom: 'Fatick',
    regionParent: 'Delta du Saloum',
    statutDrought: 'NORMALE',
    ndvi: 0.42,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 580,
    pluviometrieMoyenne: 610,
    temperature: 33,
    humidite: 70,
    vent: 12,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 29,
    dernierVersement: 'Aucun (Statut Normal)',
    phonetics: {
      fr: {
        text: "[Fa-teek] : Delta salifère sous contrôle, NDVI 0,42 dans les moyennes. Pas de sinistre majeur.",
        audioText: "Fatick affiche une santé végétale stable. Les écosystèmes côtiers et de mangroves régulent l'évapotranspiration."
      },
      wo: {
        text: "Fatick : Taw mi bari na, ngesa yi nex na.",
        audioText: "Fatick am na taw bu barree. Souniou tool baax na."
      },
      sr: {
        text: "Fatick : Fex a ref no ley ween.",
        audioText: "Fatick fite ref tew feet fex o lene."
      },
      pu: {
        text: "Fatick : Ndiyam mawdum ngon kadi.",
        audioText: "Fatick ndiyam hewi, alaa sena sabaabu kaliss joni."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.26 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.24 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.24 },
      { mois: 'Avr', pluvioReel: 2, pluvioMoyenne: 3, ndviActuel: 0.22 },
      { mois: 'Mai', pluvioReel: 20, pluvioMoyenne: 18, ndviActuel: 0.28 },
      { mois: 'Juin', pluvioReel: 110, pluvioMoyenne: 105, ndviActuel: 0.35 },
      { mois: 'Juil', pluvioReel: 390, pluvioMoyenne: 420, ndviActuel: 0.40 },
      { mois: 'Août', pluvioReel: 580, pluvioMoyenne: 610, ndviActuel: 0.42 }
    ]
  },
  kaffrine: {
    id: 'kaffrine',
    nom: 'Kaffrine',
    regionParent: 'Nouveau Bassin Arachidier',
    statutDrought: 'NORMALE',
    ndvi: 0.51,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 640,
    pluviometrieMoyenne: 680,
    temperature: 35,
    humidite: 60,
    vent: 13,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 45,
    dernierVersement: 'Aucun (Pluies optimales dans le sud)',
    phonetics: {
      fr: {
        text: "[Kaf-reen] : NDVI de 0,51. Fertilité élevée cette saison dans les exploitations céréalières.",
        audioText: "Région de Kaffrine dans les vertes. Précipitations et fertilité des sols au rendez-vous. Couverture d'assurance inactive."
      },
      wo: {
        text: "Kaffrine : Mbay mi mu ngi barri dund lool.",
        audioText: "Kaffrine am na taw bu dolliku barree."
      },
      sr: {
        text: "Kaffrine : Tew i fex na.",
        audioText: "Kaffrine tew feet can can ref."
      },
      pu: {
        text: "Kaffrine : Ndiyam ko barri do.",
        audioText: "Kaffrine ndiyam mawdum. Beltogu hewina."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.30 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.28 },
      { mois: 'Mar', pluvioReel: 1, pluvioMoyenne: 1, ndviActuel: 0.28 },
      { mois: 'Avr', pluvioReel: 3, pluvioMoyenne: 4, ndviActuel: 0.26 },
      { mois: 'Mai', pluvioReel: 35, pluvioMoyenne: 30, ndviActuel: 0.34 },
      { mois: 'Juin', pluvioReel: 150, pluvioMoyenne: 140, ndviActuel: 0.42 },
      { mois: 'Juil', pluvioReel: 420, pluvioMoyenne: 440, ndviActuel: 0.48 },
      { mois: 'Août', pluvioReel: 640, pluvioMoyenne: 680, ndviActuel: 0.51 }
    ]
  },
  louga: {
    id: 'louga',
    nom: 'Louga',
    regionParent: 'Zone Sylvopastorale',
    statutDrought: 'ALERTE',
    ndvi: 0.31,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 210,
    pluviometrieMoyenne: 320,
    temperature: 39,
    humidite: 28,
    vent: 17,
    indemniteDeclenchee: true,
    tauxIndemnite: 40000,
    gieMembres: 55,
    dernierVersement: '12 Juin 2026',
    phonetics: {
      fr: {
        text: "[Lou-ga] : Stress pastoral (NDVI 0,31). Déblocage de 40 000 FCFA/ha pour prébendes de bétail.",
        audioText: "Vigilance Louga. Les pâturages du Ferlo sont touchés par un déficit sévère de verdure, déclenchant le protocole d'indemnisation anticipée."
      },
      wo: {
        text: "Luga : Ndox mi tuuti na, mbay mi mu ngi nexul.",
        audioText: "Luga ndox mi macc na lool. Mbay mi am na jafe-jafe."
      },
      sr: {
        text: "Louga : Tew na ref no fite a ande.",
        audioText: "Louga o wet a ande fex ley."
      },
      pu: {
        text: "Louga : Ndiyam ko famdi loll pastorale.",
        audioText: "Louga ndiyam famdi pastorale. Kaaliss mballgu foti hoccude joni."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.20 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.18 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.18 },
      { mois: 'Avr', pluvioReel: 2, pluvioMoyenne: 2, ndviActuel: 0.16 },
      { mois: 'Mai', pluvioReel: 8, pluvioMoyenne: 10, ndviActuel: 0.22 },
      { mois: 'Juin', pluvioReel: 30, pluvioMoyenne: 60, ndviActuel: 0.27 },
      { mois: 'Juil', pluvioReel: 140, pluvioMoyenne: 210, ndviActuel: 0.30 },
      { mois: 'Août', pluvioReel: 210, pluvioMoyenne: 320, ndviActuel: 0.31 }
    ]
  },
  saint_louis: {
    id: 'saint_louis',
    nom: 'Saint-Louis',
    regionParent: 'Vallée du Fleuve',
    statutDrought: 'ALERTE',
    ndvi: 0.33,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 190,
    pluviometrieMoyenne: 280,
    temperature: 36,
    humidite: 45,
    vent: 22,
    indemniteDeclenchee: true,
    tauxIndemnite: 35000,
    gieMembres: 42,
    dernierVersement: '11 Juin 2026',
    phonetics: {
      fr: {
        text: "[Sain-Lwi] : NDVI bas de 0,33. Riziculture fluviale assistée par indemnité CNAAS anticipée.",
        audioText: "Alerte Saint-Louis. Le déficit hydrique de la rive gauche menace les récoltes. Les indemnités s'élèvent à trente-cinq mille francs par hectare."
      },
      wo: {
        text: "Ndar : Ndox mi macc na, mbay yi reyna lu bari.",
        audioText: "Ndar ndox mi bariwul lool ci dound mi."
      },
      sr: {
        text: "Saint-Louis : O wet a ande tew.",
        audioText: "Ndar feet wetna ley tew satelit."
      },
      pu: {
        text: "Saint-Louis : Ndiyam famdi rizicole.",
        audioText: "Saint-Louis ndiyam famdi. Kaliss sappo e joyi ujunere mballitogu feyama."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 1, pluvioMoyenne: 1, ndviActuel: 0.22 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.20 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.18 },
      { mois: 'Avr', pluvioReel: 1, pluvioMoyenne: 1, ndviActuel: 0.18 },
      { mois: 'Mai', pluvioReel: 12, pluvioMoyenne: 10, ndviActuel: 0.24 },
      { mois: 'Juin', pluvioReel: 35, pluvioMoyenne: 55, ndviActuel: 0.29 },
      { mois: 'Juil', pluvioReel: 130, pluvioMoyenne: 190, ndviActuel: 0.32 },
      { mois: 'Août', pluvioReel: 190, pluvioMoyenne: 280, ndviActuel: 0.33 }
    ]
  },
  tambacounda: {
    id: 'tambacounda',
    nom: 'Tambacounda',
    regionParent: 'Sénégal Oriental',
    statutDrought: 'NORMALE',
    ndvi: 0.55,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 710,
    pluviometrieMoyenne: 760,
    temperature: 37,
    humidite: 50,
    vent: 14,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 72,
    dernierVersement: 'Aucun (Précipitations soudaniennes normales)',
    phonetics: {
      fr: {
        text: "[Tamba-coonda] : NDVI 0,55. Conditions favorables pour le maïs et le coton oriental.",
        audioText: "Tambacounda affiche des normales saisonnières adéquates. Les cultures de rente sont en excellente vigueur végétative."
      },
      wo: {
        text: "Tambacounda : Mbay mi mu ngi rafet lool, dund bi baax na.",
        audioText: "Tamba dund mi bari na té rafet na lool climal oriental."
      },
      sr: {
        text: "Tambacounda : Tew ye fexna ref.",
        audioText: "Tamba feet ye wetna can can."
      },
      pu: {
        text: "Tambacounda : Ndiyam ko hewi ngesa foti beyde.",
        audioText: "Tambacounda ndiyam mawdum. Ngesa na rafetee loll."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.32 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.30 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.30 },
      { mois: 'Avr', pluvioReel: 5, pluvioMoyenne: 8, ndviActuel: 0.28 },
      { mois: 'Mai', pluvioReel: 55, pluvioMoyenne: 45, ndviActuel: 0.36 },
      { mois: 'Juin', pluvioReel: 190, pluvioMoyenne: 180, ndviActuel: 0.44 },
      { mois: 'Juil', pluvioReel: 490, pluvioMoyenne: 520, ndviActuel: 0.50 },
      { mois: 'Août', pluvioReel: 710, pluvioMoyenne: 760, ndviActuel: 0.55 }
    ]
  },
  kedougou: {
    id: 'kedougou',
    nom: 'Kédougou',
    regionParent: 'Contreforts du Fouta',
    statutDrought: 'OPTIMAL',
    ndvi: 0.76,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 1250,
    pluviometrieMoyenne: 1180,
    temperature: 30,
    humidite: 82,
    vent: 10,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 31,
    dernierVersement: 'Aucun (Région forestière humide)',
    phonetics: {
      fr: {
        text: "[Kay-dou-gou] : NDVI record de 0,76. Conditions hydriques maximales dans les collines du Sud-Est.",
        audioText: "Kédougou bénéficie de pluies torrentielles et de milieux riches. Aucun risque climatique d'ordre aride détecté."
      },
      wo: {
        text: "Kedougou : Taw bi dafa weuy, ndox mi am na bu barri.",
        audioText: "Kedougou taw bi dafa weuy lool. Alhamdoulilah!"
      },
      sr: {
        text: "Kedougou : Can fex ref o fex.",
        audioText: "Kedougou ref o tew fex wetna."
      },
      pu: {
        text: "Kedougou : Ndiyam gu mawdum wele sanne.",
        audioText: "Kedougou ndiyam gu mawdum loll. Beltogu timmana."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.42 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.39 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 2, ndviActuel: 0.38 },
      { mois: 'Avr', pluvioReel: 15, pluvioMoyenne: 10, ndviActuel: 0.40 },
      { mois: 'Mai', pluvioReel: 95, pluvioMoyenne: 85, ndviActuel: 0.48 },
      { mois: 'Juin', pluvioReel: 380, pluvioMoyenne: 360, ndviActuel: 0.59 },
      { mois: 'Juil', pluvioReel: 890, pluvioMoyenne: 860, ndviActuel: 0.69 },
      { mois: 'Août', pluvioReel: 1250, pluvioMoyenne: 1180, ndviActuel: 0.76 }
    ]
  },
  sedhiou: {
    id: 'sedhiou',
    nom: 'Sédhiou',
    regionParent: 'Casamance Moyenne',
    statutDrought: 'OPTIMAL',
    ndvi: 0.65,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 980,
    pluviometrieMoyenne: 1020,
    temperature: 31,
    humidite: 75,
    vent: 11,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 38,
    dernierVersement: 'Aucun (Climat guinéen optimal)',
    phonetics: {
      fr: {
        text: "[Say-dyou] : NDVI à 0,65. Récoltes abondantes de riz et de mangues en Casamance moyenne.",
        audioText: "La région de Sédhiou présente d'excellents apports hydriques et un couvert forestier sain. Assurance inactive."
      },
      wo: {
        text: "Sédhiou : Taw bi rafet na lool lii dund rekk la.",
        audioText: "Sédhiou am na taw lool té dund baax na."
      },
      sr: {
        text: "Sedhiou : Tew i can mbay fex.",
        audioText: "Sedhiou tew can feet fex xool."
      },
      pu: {
        text: "Sedhiou : Casamance ndiyam mawdum hew.",
        audioText: "Sedhiou mbelu hewi kadi Casamance ndiyam hewi loll."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.34 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.32 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.31 },
      { mois: 'Avr', pluvioReel: 5, pluvioMoyenne: 5, ndviActuel: 0.31 },
      { mois: 'Mai', pluvioReel: 55, pluvioMoyenne: 48, ndviActuel: 0.40 },
      { mois: 'Juin', pluvioReel: 220, pluvioMoyenne: 205, ndviActuel: 0.52 },
      { mois: 'Juil', pluvioReel: 610, pluvioMoyenne: 580, ndviActuel: 0.60 },
      { mois: 'Août', pluvioReel: 980, pluvioMoyenne: 1020, ndviActuel: 0.65 }
    ]
  },
  ziguinchor: {
    id: 'ziguinchor',
    nom: 'Ziguinchor',
    regionParent: 'Casamance Maritime',
    statutDrought: 'OPTIMAL',
    ndvi: 0.72,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 1350,
    pluviometrieMoyenne: 1280,
    temperature: 29,
    humidite: 85,
    vent: 12,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 50,
    dernierVersement: 'Aucun (Excédent pluviométrique)',
    phonetics: {
      fr: {
        text: "[Zee-ghin-shor] : NDVI exceptionnel de 0,72. Densité foliaire maximale et pluies excédentaires.",
        audioText: "Ziguinchor est dans une saison culturale hautement productive. Risque de sécheresse inexistant."
      },
      wo: {
        text: "Ziguinchor : Taw bi weuy na ci bëj-saalum.",
        audioText: "Zaygansoar taw bi dafa bari lool baax na."
      },
      sr: {
        text: "Ziguinchor : Mbay ye fexna o ref fex.",
        audioText: "Ziguinchor feet can can. casamance guineen."
      },
      pu: {
        text: "Ziguinchor : Ndiyam gu hewi sanne.",
        audioText: "Ziguinchor ndiyam gu barri sanne. Alaa sena sabaabu kaliss."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.38 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.36 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.35 },
      { mois: 'Avr', pluvioReel: 8, pluvioMoyenne: 6, ndviActuel: 0.36 },
      { mois: 'Mai', pluvioReel: 75, pluvioMoyenne: 60, ndviActuel: 0.44 },
      { mois: 'Juin', pluvioReel: 310, pluvioMoyenne: 285, ndviActuel: 0.56 },
      { mois: 'Juil', pluvioReel: 840, pluvioMoyenne: 790, ndviActuel: 0.65 },
      { mois: 'Août', pluvioReel: 1350, pluvioMoyenne: 1280, ndviActuel: 0.72 }
    ]
  },
  kolda: {
    id: 'kolda',
    nom: 'Kolda',
    regionParent: 'Casamance',
    statutDrought: 'OPTIMAL',
    ndvi: 0.68,
    ndviMinThreshold: 0.35,
    pluviometrieCumulee: 890,
    pluviometrieMoyenne: 850,
    temperature: 31,
    humidite: 78,
    vent: 11,
    indemniteDeclenchee: false,
    tauxIndemnite: 0,
    gieMembres: 64,
    dernierVersement: 'Aucun (Rendement record)',
    phonetics: {
      fr: {
        text: "[Kol-da] : Conditions optimales exceptionnelles. NDVI de 0,68 indiquant une végétation dense et vigoureuse.",
        audioText: "Kolda bénéficie d'une pluviométrie abondante et d'une santé végétale remarquable. Félicitations aux cultivateurs maraîchers de la zone."
      },
      wo: {
        text: "Kolda : Taw bi bari na, ngesa yi rafet na lool. Ndox mi dolli na.",
        audioText: "Kolda taw bi baree lool, mbon yi te rafet. Alhamdoulilah!"
      },
      sr: {
        text: "Kolda: Mbay mi wetna tew. Can can can.",
        audioText: "Kolda ya tew wet fex. can fex."
      },
      pu: {
        text: "Kolda: Ndiyam mawdum, gese na rafetee sanne. Be wele mbelu.",
        audioText: "Kolda ndiyam hewi loll ey casamance. Beltogu mawdi."
      }
    },
    historiqueEvolution: [
      { mois: 'Jan', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.35 },
      { mois: 'Fév', pluvioReel: 0, pluvioMoyenne: 0, ndviActuel: 0.32 },
      { mois: 'Mar', pluvioReel: 0, pluvioMoyenne: 1, ndviActuel: 0.30 },
      { mois: 'Avr', pluvioReel: 2, pluvioMoyenne: 5, ndviActuel: 0.31 },
      { mois: 'Mai', pluvioReel: 45, pluvioMoyenne: 39, ndviActuel: 0.42 },
      { mois: 'Juin', pluvioReel: 180, pluvioMoyenne: 165, ndviActuel: 0.54 },
      { mois: 'Juil', pluvioReel: 540, pluvioMoyenne: 510, ndviActuel: 0.62 },
      { mois: 'Août', pluvioReel: 890, pluvioMoyenne: 850, ndviActuel: 0.68 }
    ]
  }
};

interface ClaimsLog {
  id: string;
  departement: string;
  cooperativeNom: string;
  hectares: number;
  montantFcfas: number;
  modePaiement: string;
  dateDeclenchement: string;
  status: 'Reçu' | 'Traitement' | 'Payé';
  txHash: string;
}

const RECENT_CLAIMS_LOGS: ClaimsLog[] = [
  {
    id: 'TXN-9021-CN',
    departement: 'Podor',
    cooperativeNom: 'GIE Maraîcher de Mboumba',
    hectares: 25,
    montantFcfas: 1375000,
    modePaiement: "Crédit d'Épargne MicroFin (Blockchain)",
    dateDeclenchement: '16 Juin 2026',
    status: 'Payé',
    txHash: '0x8f7a...3d9e'
  },
  {
    id: 'TXN-8843-CN',
    departement: 'Matam',
    cooperativeNom: 'Union des Producteurs d\'Ouro Sogui',
    hectares: 18,
    montantFcfas: 1080000,
    modePaiement: 'Wave Sénégal Direct-to-Wallet',
    dateDeclenchement: '15 Juin 2026',
    status: 'Payé',
    txHash: '0x4c2b...901f'
  },
  {
    id: 'TXN-8072-CN',
    departement: 'Linguère',
    cooperativeNom: 'GIE Sylvopastoral Ranérou-Ferlo',
    hectares: 35,
    montantFcfas: 1225000,
    modePaiement: "Crédit d'Épargne MicroFin (Blockchain)",
    dateDeclenchement: '12 Juin 2026',
    status: 'Payé',
    txHash: '0xde90...7281'
  },
  {
    id: 'TXN-7941-CN',
    departement: 'Podor',
    cooperativeNom: 'Coopérative Rizicole et Maraîchère de Gamadji',
    hectares: 12,
    montantFcfas: 660000,
    modePaiement: 'Orange Money Sénégal Business',
    dateDeclenchement: '10 Juin 2026',
    status: 'Payé',
    txHash: '0xe231...ffc0'
  }
];

interface MeteoPageProps {
  currentUser?: User | null;
  onUpdateUser?: (updatedUser: User) => void;
  setCurrentPage?: (page: 'accueil' | 'offres' | 'contact' | 'terrain' | 'dashboard' | 'meteo') => void;
}

export default function MeteoPage({ currentUser, onUpdateUser, setCurrentPage }: MeteoPageProps) {
  const [selectedDepId, setSelectedDepId] = useState<string>('podor');
  const [activeLang, setActiveLang] = useState<'fr' | 'wo' | 'sr' | 'pu'>('fr');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPayoutSimulatorModal, setShowPayoutSimulatorModal] = useState(false);
  const [simulationDep, setSimulationDep] = useState<string>('podor');
  const [simulationHectares, setSimulationHectares] = useState<number>(5);
  const [localClaimHistory, setLocalClaimHistory] = useState<ClaimsLog[]>(RECENT_CLAIMS_LOGS);
  const [mapLayer, setMapLayer] = useState<'ndvi' | 'pluvio' | 'radar'>('ndvi');
  const [hoveredDepId, setHoveredDepId] = useState<string | null>(null);
  const [subPageTab, setSubPageTab] = useState<'evolution' | 'global_stats'>('evolution');
  const [statsSearchTerm, setStatsSearchTerm] = useState<string>('');
  
  // Simulated stats for top header metrics
  const [satelliteStatus, setSatelliteStatus] = useState<'En ligne' | 'Actualisation...'>('En ligne');

  const selectedDepData = DEPARTEMENTS_METEO[selectedDepId] || DEPARTEMENTS_METEO.podor;

  // Cleanup synthesis audio on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAudioPlay = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const textToSpeak = selectedDepData.phonetics[activeLang].audioText;
        const msg = new SpeechSynthesisUtterance(textToSpeak);
        msg.lang = activeLang === 'fr' ? 'fr-FR' : 'fr-FR'; // Standard fallback since local dialects require phonetic text or custom voices
        msg.rate = 0.95;
        
        msg.onend = () => {
          setIsPlayingAudio(false);
        };
        msg.onerror = () => {
          setIsPlayingAudio(false);
        };

        setIsPlayingAudio(true);
        window.speechSynthesis.speak(msg);
      }
    } else {
      alert("La synthèse vocale n'est pas supportée dans ce navigateur.");
    }
  };

  const refreshSatelliteData = () => {
    setSatelliteStatus('Actualisation...');
    setTimeout(() => {
      setSatelliteStatus('En ligne');
      // Toast message simulated
      const logList = JSON.parse(localStorage.getItem('microfin_activity_logs') || '[]');
      logList.unshift({
        id: 'LOG_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toLocaleTimeString('fr-FR'),
        text: `Mise à jour des données satellites CNAAS Connect. Satellite Copernicus Sentinel-2 synchronisé.`
      });
      localStorage.setItem('microfin_activity_logs', JSON.stringify(logList));
    }, 1200);
  };

  const handleSimulateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const depData = DEPARTEMENTS_METEO[simulationDep];
    if (!depData) return;

    if (!depData.indemniteDeclenchee) {
      alert(`Le département ${depData.nom} ne présente pas de sécheresse critique sous le seuil d'indice NDVI (${depData.ndvi} > seuil ${depData.ndviMinThreshold}). Aucun remboursement n'est déclenché.`);
      return;
    }

    const outputAmount = simulationHectares * depData.tauxIndemnite;

    // Simulate payment transaction
    const newTxId = 'TXN-' + Math.floor(1000 + Math.random() * 9000) + '-SIM';
    const newClaim: ClaimsLog = {
      id: newTxId,
      departement: depData.nom,
      cooperativeNom: currentUser ? `GIE de ${currentUser.nom}` : `Ferme Maraîchère de Sarr`,
      hectares: simulationHectares,
      montantFcfas: outputAmount,
      modePaiement: currentUser ? "Crédit d'Épargne MicroFin (Blockchain)" : "Wave Sénégal Direct-to-Wallet",
      dateDeclenchement: 'A l\'instant',
      status: 'Payé',
      txHash: '0x' + Math.random().toString(16).substring(2, 10) + '...eff2'
    };

    setLocalClaimHistory([newClaim, ...localClaimHistory]);

    // If user is logged-in, append payout to their balance to make it interactive and dynamic!
    if (currentUser && onUpdateUser) {
      onUpdateUser({
        ...currentUser,
        soldeEpargne: (currentUser.soldeEpargne || 0) + outputAmount
      });
    }

    // Save simulation in logs
    const logList = JSON.parse(localStorage.getItem('microfin_activity_logs') || '[]');
    logList.unshift({
      id: 'LOG_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('fr-FR'),
      text: `Indemnisation auto-créditée CNAAS: ${outputAmount.toLocaleString()} FCFA versés pour ${simulationHectares}ha à ${currentUser?.nom || 'Producteur Simulé'}`
    });
    localStorage.setItem('microfin_activity_logs', JSON.stringify(logList));

    setShowPayoutSimulatorModal(false);
    alert(`🎉 [Succès Satellite CNAAS] : Indemnité de ${outputAmount.toLocaleString()} FCFA créditée sur le livret d'épargne !`);
  };

  // Helper to compute color transitions for each department
  const getDepartmentColor = (depId: string, layer: 'ndvi' | 'pluvio' | 'radar', isSelected: boolean, isHovered: boolean) => {
    const data = DEPARTEMENTS_METEO[depId];
    if (!data) return '#cbd5e1';

    if (layer === 'radar') {
      if (isSelected || isHovered) return '#10b981'; // vibrant neon green
      if (data.statutDrought === 'CRITIQUE') return 'rgba(239, 68, 68, 0.25)'; // critical red translucent
      if (data.statutDrought === 'ALERTE') return 'rgba(245, 158, 11, 0.2)'; // warning amber translucent
      return 'rgba(16, 185, 129, 0.15)'; // translucent healthy green
    }

    if (layer === 'pluvio') {
      const ratio = data.pluviometrieCumulee / data.pluviometrieMoyenne;
      if (ratio < 0.4) return isSelected || isHovered ? '#b91c1c' : '#ef4444'; // critical rain deficit
      if (ratio < 0.75) return isSelected || isHovered ? '#ea580c' : '#f97316'; // mild rain deficit
      if (ratio < 1.0) return isSelected || isHovered ? '#15803d' : '#22c55e'; // slightly under or normal
      return isSelected || isHovered ? '#1d4ed8' : '#3b82f6'; // rain surplus (Kolda)
    }

    // Default 'ndvi'
    if (data.statutDrought === 'CRITIQUE') return isSelected || isHovered ? '#b91c1c' : '#ef4444';
    if (data.statutDrought === 'ALERTE') return isSelected || isHovered ? '#d97706' : '#f59e0b';
    if (data.statutDrought === 'NORMALE') return isSelected || isHovered ? '#047857' : '#10b981';
    return isSelected || isHovered ? '#065f46' : '#059669'; // optimal (Kolda)
  };

  const getDepartmentStroke = (depId: string, layer: 'ndvi' | 'pluvio' | 'radar', isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return '#ffffff';
    if (isHovered) return '#f8fafc';
    if (layer === 'radar') {
      const data = DEPARTEMENTS_METEO[depId];
      if (data?.statutDrought === 'CRITIQUE') return '#f87171';
      if (data?.statutDrought === 'ALERTE') return '#fbbf24';
      return '#34d399';
    }
    return 'rgba(255, 255, 255, 0.55)';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* 1. BRAND HERO SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-primary rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-900/30">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
          <Satellite className="w-96 h-96 animate-pulse" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs text-accent font-bold">
            <Radio className="w-3.5 h-3.5 animate-ping text-accent" />
            <span>CNAAS CONNECT — Surveillance Satellite en Temps Réel</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight leading-none text-white">
            Carte d'Alerte Météo & Indemnisations Climat
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
            En partenariat avec l'<strong>ANACIM</strong> et la <strong>CNAAS</strong> (Compagnie Nationale d'Assurance Agricole du Sénégal), MicroFin utilise l'imagerie satellite pour calculer automatiquement votre stress hydrique (déficit de pluie NDVI) et débloquer vos remboursements d'assurance tontine sans paperasses.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={refreshSatelliteData}
              className="bg-white/10 hover:bg-white/15 px-4 py-2 border border-white/20 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${satelliteStatus === 'Actualisation...' ? 'animate-spin text-accent' : ''}`} />
              <span>Données Satellite : {satelliteStatus}</span>
            </button>
            <button
              onClick={() => setShowPayoutSimulatorModal(true)}
              className="bg-accent text-slate-900 hover:bg-yellow-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-accent/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simuler un Sinistre Satellite</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CORE INTERACTIVE SECTION (MAP + ALERTS SIDEBAR) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SENEGAL INTERACTIVE SVG MAP DISPLAY CARD (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-150 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary animate-pulse" />
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest leading-none">Imagerie Satellite interactive</h3>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Filtres satellite de télédétection. Survolez pour activer le ciblage.</p>
            </div>

            {/* Map Layer Mode Selection Buttons */}
            <div className="flex bg-slate-100 p-1 border border-slate-205/60 rounded-2xl gap-1 self-stretch md:self-auto justify-between">
              <button
                onClick={() => setMapLayer('ndvi')}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  mapLayer === 'ndvi' 
                    ? 'bg-primary text-white shadow-md shadow-emerald-700/10' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                🌾 Index NDVI
              </button>
              <button
                onClick={() => setMapLayer('pluvio')}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  mapLayer === 'pluvio' 
                    ? 'bg-primary text-white shadow-md shadow-emerald-700/10' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                🌧️ Pluviométrie
              </button>
              <button
                onClick={() => setMapLayer('radar')}
                className={`flex-1 md:flex-none px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  mapLayer === 'radar' 
                    ? 'bg-slate-900 text-accent border border-slate-800 shadow-md' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                🛰️ Scan Radar
              </button>
            </div>
          </div>

          {/* CHOSEN DEPARTMENT DETAILS MAP COMPONENT */}
          <div className={`relative w-full aspect-video min-h-[300px] rounded-3xl border transition-all duration-500 flex items-center justify-center p-3 overflow-hidden ${
            mapLayer === 'radar' 
              ? 'bg-slate-950 border-slate-900 shadow-inner' 
              : 'bg-slate-50/50 border-slate-100'
          }`}>
            
            {/* Visual satellite orbits illustration */}
            <div className="absolute inset-x-0 top-0 flex justify-between p-4 pointer-events-none z-10">
              <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-wider">
                <Satellite className={`w-3.5 h-3.5 ${mapLayer === 'radar' ? 'text-accent animate-spin-slow' : 'text-primary animate-pulse'}`} />
                <span className={mapLayer === 'radar' ? 'text-accent' : 'text-slate-500'}>
                  {mapLayer === 'radar' ? 'COPERNICUS COH-RADAR-S2' : 'SATELLITE SYNC ACTIVE'}
                </span>
              </div>
              <span className={`text-[9px] font-mono font-bold ${mapLayer === 'radar' ? 'text-[#10b981]' : 'text-gray-400'}`}>
                {mapLayer === 'radar' ? 'LIAISON REÇUE 100%' : 'LATENCE: 1.2s'}
              </span>
            </div>

            {/* Dynamic Live Telemetry HUD Panel */}
            <div className={`absolute top-12 left-4 p-3 rounded-2xl border font-mono text-[9px] w-[210px] space-y-1.5 hidden md:block select-none pointer-events-none z-10 transition-all ${
              mapLayer === 'radar'
                ? 'bg-slate-950/90 border-emerald-900/40 text-emerald-400 shadow-emerald-950/20 shadow-lg'
                : 'bg-slate-900/95 border-slate-850 text-slate-200 shadow-xl'
            }`}>
              <div className={`flex justify-between items-center border-b pb-1 text-[8px] font-black tracking-widest uppercase ${
                mapLayer === 'radar' ? 'border-emerald-900/40 text-[#10b981]' : 'border-slate-800 text-primary'
              }`}>
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full animate-ping ${mapLayer === 'radar' ? 'bg-[#10b981]' : 'bg-primary'}`}></span>
                  <span>CNAAS_STATION_FEED</span>
                </span>
                <span>ONLINE</span>
              </div>
              <div>
                {hoveredDepId ? (
                  <div className="space-y-1">
                    <p className="font-extrabold text-white text-[10px] uppercase">ZONE: {DEPARTEMENTS_METEO[hoveredDepId].nom}</p>
                    <p>├─ COOPÉ.: {DEPARTEMENTS_METEO[hoveredDepId].gieMembres} COOP_GIE</p>
                    <p>├─ INDEX NDVI: <span className={DEPARTEMENTS_METEO[hoveredDepId].ndvi < 0.35 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>{DEPARTEMENTS_METEO[hoveredDepId].ndvi}</span></p>
                    <p>├─ PLUVIOM.: {DEPARTEMENTS_METEO[hoveredDepId].pluviometrieCumulee} mm / {DEPARTEMENTS_METEO[hoveredDepId].pluviometrieMoyenne} mm</p>
                    <p>└─ STATUT: <span className={DEPARTEMENTS_METEO[hoveredDepId].indemniteDeclenchee ? 'text-red-400 font-black animate-pulse' : 'text-emerald-400 font-bold'}>{DEPARTEMENTS_METEO[hoveredDepId].statutDrought}</span></p>
                  </div>
                ) : (
                  <div className="space-y-1 text-slate-400">
                    <p className="font-bold text-white text-[9px] uppercase">STATION : {selectedDepData.nom} (Focus)</p>
                    <p>├─ NDVI CIBLE: {selectedDepData.ndvi}</p>
                    <p>├─ PLUVIE CIBLE: {selectedDepData.pluviometrieCumulee} mm</p>
                    <p className="text-[8px] text-slate-500 italic mt-1 leading-snug">Survolez un autre district pour capter son signal radio.</p>
                  </div>
                )}
              </div>
            </div>

            {/* SVG SENEGAL SIMULATOR FOR MAP DEPARTMENTS */}
            <svg 
              viewBox="0 0 650 450" 
              className="w-full h-full max-h-[380px] drop-shadow-md select-none transition-all duration-500"
              id="senegal-svg-dept-map"
            >
              {/* Background styling for Atlantic Ocean */}
              <rect width="650" height="450" rx="16" fill="none" />
              <text x="35" y="320" className={`text-[9px] font-black font-mono tracking-widest pointer-events-none uppercase ${
                mapLayer === 'radar' ? 'text-emerald-900/40' : 'text-slate-300'
              }`}>
                Océan Atlantique 🌊
              </text>

              {/* Dotted Geographic Grid (GIS Theme Coordinates) */}
              <g className="opacity-25" stroke={mapLayer === 'radar' ? '#10b981' : '#cbd5e1'} strokeDasharray="3,6" strokeWidth="0.5">
                {/* Horizontal parallels lines */}
                <line x1="0" y1="110" x2="650" y2="110" />
                <line x1="0" y1="220" x2="650" y2="220" />
                <line x1="0" y1="330" x2="650" y2="330" />
                {/* Vertical meridians lines */}
                <line x1="160" y1="0" x2="160" y2="450" />
                <line x1="320" y1="0" x2="320" y2="450" />
                <line x1="480" y1="0" x2="480" y2="450" />
              </g>

              {/* Grid Coordinate labels */}
              <g className={`text-[8px] font-mono tracking-widest pointer-events-none font-bold ${
                mapLayer === 'radar' ? 'fill-emerald-800' : 'fill-slate-400'
              }`}>
                <text x="10" y="215">16°N</text>
                <text x="10" y="105">17°N</text>
                <text x="325" y="440">14°W</text>
                <text x="485" y="440">13°W</text>
              </g>

              {/* POLYGONS D'ALERTE POUR LES DEPARTEMENTS DU SENEGAL (CARTE COMPLETE) */}
              {/* 1. DAKAR */}
              <polygon
                points="75,190 90,185 85,198 72,197"
                onClick={() => setSelectedDepId('dakar')}
                onMouseEnter={() => setHoveredDepId('dakar')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('dakar', mapLayer, selectedDepId === 'dakar', hoveredDepId === 'dakar'),
                  stroke: getDepartmentStroke('dakar', mapLayer, selectedDepId === 'dakar', hoveredDepId === 'dakar'),
                  transform: (selectedDepId === 'dakar' || hoveredDepId === 'dakar') ? 'scale(1.05) translate(-1px, 0px)' : 'none',
                  transformOrigin: '80px 190px'
                }}
              />
              <text x="68" y="182" className="fill-slate-700 text-[8px] font-black pointer-events-none tracking-tighter drop-shadow-sm">DKR</text>

              {/* 2. THIES */}
              <polygon
                points="90,185 115,165 125,190 102,205 85,198"
                onClick={() => setSelectedDepId('thies')}
                onMouseEnter={() => setHoveredDepId('thies')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('thies', mapLayer, selectedDepId === 'thies', hoveredDepId === 'thies'),
                  stroke: getDepartmentStroke('thies', mapLayer, selectedDepId === 'thies', hoveredDepId === 'thies'),
                  transform: (selectedDepId === 'thies' || hoveredDepId === 'thies') ? 'scale(1.03) translate(-2px, -1px)' : 'none',
                  transformOrigin: '100px 185px'
                }}
              />
              <text x="96" y="178" className="fill-white text-[8px] font-black pointer-events-none tracking-widest leading-none drop-shadow">THIÈS</text>

              {/* 3. DIOURBEL */}
              <polygon
                points="115,165 137,152 147,180 125,190"
                onClick={() => setSelectedDepId('diourbel')}
                onMouseEnter={() => setHoveredDepId('diourbel')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('diourbel', mapLayer, selectedDepId === 'diourbel', hoveredDepId === 'diourbel'),
                  stroke: getDepartmentStroke('diourbel', mapLayer, selectedDepId === 'diourbel', hoveredDepId === 'diourbel'),
                  transform: (selectedDepId === 'diourbel' || hoveredDepId === 'diourbel') ? 'scale(1.03) translate(-1px, -1px)' : 'none',
                  transformOrigin: '130px 170px'
                }}
              />
              <text x="120" y="176" className="fill-white text-[7px] font-black pointer-events-none tracking-tighter drop-shadow">DBL</text>

              {/* 4. SAINT-LOUIS */}
              <polygon
                points="105,65 180,50 170,100 120,105 105,80"
                onClick={() => setSelectedDepId('saint_louis')}
                onMouseEnter={() => setHoveredDepId('saint_louis')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('saint_louis', mapLayer, selectedDepId === 'saint_louis', hoveredDepId === 'saint_louis'),
                  stroke: getDepartmentStroke('saint_louis', mapLayer, selectedDepId === 'saint_louis', hoveredDepId === 'saint_louis'),
                  transform: (selectedDepId === 'saint_louis' || hoveredDepId === 'saint_louis') ? 'scale(1.02) translate(-2px, -2px)' : 'none',
                  transformOrigin: '140px 75px'
                }}
              />
              <text x="114" y="92" className="fill-white text-[8px] font-black pointer-events-none tracking-widest drop-shadow">ST-LOUIS</text>

              {/* 5. PODOR */}
              <polygon
                points="180,50 310,80 340,110 320,130 250,110 170,100"
                onClick={() => setSelectedDepId('podor')}
                onMouseEnter={() => setHoveredDepId('podor')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('podor', mapLayer, selectedDepId === 'podor', hoveredDepId === 'podor'),
                  stroke: getDepartmentStroke('podor', mapLayer, selectedDepId === 'podor', hoveredDepId === 'podor'),
                  transform: (selectedDepId === 'podor' || hoveredDepId === 'podor') ? 'scale(1.02) translate(-2px, -2px)' : 'none',
                  transformOrigin: '240px 90px'
                }}
              />
              <text x="235" y="85" className="fill-white text-[10px] font-black pointer-events-none tracking-widest drop-shadow">PODOR</text>

              {/* 6. LOUGA */}
              <polygon
                points="120,105 170,100 200,160 137,152 115,165"
                onClick={() => setSelectedDepId('louga')}
                onMouseEnter={() => setHoveredDepId('louga')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('louga', mapLayer, selectedDepId === 'louga', hoveredDepId === 'louga'),
                  stroke: getDepartmentStroke('louga', mapLayer, selectedDepId === 'louga', hoveredDepId === 'louga'),
                  transform: (selectedDepId === 'louga' || hoveredDepId === 'louga') ? 'scale(1.02) translate(-2px, 0px)' : 'none',
                  transformOrigin: '150px 130px'
                }}
              />
              <text x="142" y="132" className="fill-white text-[9px] font-black pointer-events-none tracking-widest drop-shadow">LOUGA</text>

              {/* 7. LINGUERE */}
              <polygon
                points="170,100 250,110 320,130 380,180 310,230 200,160"
                onClick={() => setSelectedDepId('linguere')}
                onMouseEnter={() => setHoveredDepId('linguere')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('linguere', mapLayer, selectedDepId === 'linguere', hoveredDepId === 'linguere'),
                  stroke: getDepartmentStroke('linguere', mapLayer, selectedDepId === 'linguere', hoveredDepId === 'linguere'),
                  transform: (selectedDepId === 'linguere' || hoveredDepId === 'linguere') ? 'scale(1.02) translate(-1px, 1px)' : 'none',
                  transformOrigin: '260px 160px'
                }}
              />
              <text x="245" y="160" className="fill-white text-[10px] font-black pointer-events-none tracking-widest drop-shadow">LINGUÈRE</text>

              {/* 8. MATAM */}
              <polygon
                points="310,80 430,130 450,170 380,180 340,110"
                onClick={() => setSelectedDepId('matam')}
                onMouseEnter={() => setHoveredDepId('matam')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('matam', mapLayer, selectedDepId === 'matam', hoveredDepId === 'matam'),
                  stroke: getDepartmentStroke('matam', mapLayer, selectedDepId === 'matam', hoveredDepId === 'matam'),
                  transform: (selectedDepId === 'matam' || hoveredDepId === 'matam') ? 'scale(1.02) translate(1px, -1px)' : 'none',
                  transformOrigin: '370px 140px'
                }}
              />
              <text x="365" y="140" className="fill-white text-[10px] font-black pointer-events-none tracking-widest drop-shadow">MATAM</text>

              {/* 9. FATICK */}
              <polygon
                points="102,205 125,190 147,180 170,250 120,270 102,230"
                onClick={() => setSelectedDepId('fatick')}
                onMouseEnter={() => setHoveredDepId('fatick')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('fatick', mapLayer, selectedDepId === 'fatick', hoveredDepId === 'fatick'),
                  stroke: getDepartmentStroke('fatick', mapLayer, selectedDepId === 'fatick', hoveredDepId === 'fatick'),
                  transform: (selectedDepId === 'fatick' || hoveredDepId === 'fatick') ? 'scale(1.02) translate(-1px, 2px)' : 'none',
                  transformOrigin: '130px 220px'
                }}
              />
              <text x="115" y="235" className="fill-white text-[8px] font-black pointer-events-none tracking-widest drop-shadow">FATICK</text>

              {/* 10. KAOLACK */}
              <polygon
                points="130,160 200,160 310,230 280,270 170,250 120,210"
                onClick={() => setSelectedDepId('kaolack')}
                onMouseEnter={() => setHoveredDepId('kaolack')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('kaolack', mapLayer, selectedDepId === 'kaolack', hoveredDepId === 'kaolack'),
                  stroke: getDepartmentStroke('kaolack', mapLayer, selectedDepId === 'kaolack', hoveredDepId === 'kaolack'),
                  transform: (selectedDepId === 'kaolack' || hoveredDepId === 'kaolack') ? 'scale(1.02) translate(-2px, 2px)' : 'none',
                  transformOrigin: '180px 210px'
                }}
              />
              <text x="175" y="210" className="fill-white text-[10px] font-black pointer-events-none tracking-widest drop-shadow">KAOLACK</text>

              {/* 11. KAFFRINE */}
              <polygon
                points="200,160 280,210 270,250 170,250"
                onClick={() => setSelectedDepId('kaffrine')}
                onMouseEnter={() => setHoveredDepId('kaffrine')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('kaffrine', mapLayer, selectedDepId === 'kaffrine', hoveredDepId === 'kaffrine'),
                  stroke: getDepartmentStroke('kaffrine', mapLayer, selectedDepId === 'kaffrine', hoveredDepId === 'kaffrine'),
                  transform: (selectedDepId === 'kaffrine' || hoveredDepId === 'kaffrine') ? 'scale(1.03) translate(1px, 1px)' : 'none',
                  transformOrigin: '230px 210px'
                }}
              />
              <text x="212" y="202" className="fill-white text-[8px] font-black pointer-events-none tracking-widest drop-shadow">KAFFRINE</text>

              {/* 12. TAMBACOUNDA */}
              <polygon
                points="310,230 430,250 460,320 380,350 280,270"
                onClick={() => setSelectedDepId('tambacounda')}
                onMouseEnter={() => setHoveredDepId('tambacounda')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('tambacounda', mapLayer, selectedDepId === 'tambacounda', hoveredDepId === 'tambacounda'),
                  stroke: getDepartmentStroke('tambacounda', mapLayer, selectedDepId === 'tambacounda', hoveredDepId === 'tambacounda'),
                  transform: (selectedDepId === 'tambacounda' || hoveredDepId === 'tambacounda') ? 'scale(1.01) translate(2px, 2px)' : 'none',
                  transformOrigin: '360px 290px'
                }}
              />
              <text x="330" y="295" className="fill-white text-[10px] font-black pointer-events-none tracking-widest drop-shadow">TAMBACOUNDA</text>

              {/* 13. KEDOUGOU */}
              <polygon
                points="430,250 490,290 470,360 460,320"
                onClick={() => setSelectedDepId('kedougou')}
                onMouseEnter={() => setHoveredDepId('kedougou')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('kedougou', mapLayer, selectedDepId === 'kedougou', hoveredDepId === 'kedougou'),
                  stroke: getDepartmentStroke('kedougou', mapLayer, selectedDepId === 'kedougou', hoveredDepId === 'kedougou'),
                  transform: (selectedDepId === 'kedougou' || hoveredDepId === 'kedougou') ? 'scale(1.03) translate(2px, 3px)' : 'none',
                  transformOrigin: '460px 310px'
                }}
              />
              <text x="442" y="312" className="fill-white text-[8px] font-black pointer-events-none tracking-widest drop-shadow">KÉDOUGOU</text>

              {/* 14. SEDHIOU */}
              <polygon
                points="130,320 170,320 170,360 130,360"
                onClick={() => setSelectedDepId('sedhiou')}
                onMouseEnter={() => setHoveredDepId('sedhiou')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('sedhiou', mapLayer, selectedDepId === 'sedhiou', hoveredDepId === 'sedhiou'),
                  stroke: getDepartmentStroke('sedhiou', mapLayer, selectedDepId === 'sedhiou', hoveredDepId === 'sedhiou'),
                  transform: (selectedDepId === 'sedhiou' || hoveredDepId === 'sedhiou') ? 'scale(1.03) translate(0px, 3px)' : 'none',
                  transformOrigin: '150px 340px'
                }}
              />
              <text x="134" y="344" className="fill-white text-[7px] font-black pointer-events-none tracking-widest drop-shadow">SÉDHIOU</text>

              {/* 15. ZIGUINCHOR */}
              <polygon
                points="90,320 130,320 130,360 90,360"
                onClick={() => setSelectedDepId('ziguinchor')}
                onMouseEnter={() => setHoveredDepId('ziguinchor')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('ziguinchor', mapLayer, selectedDepId === 'ziguinchor', hoveredDepId === 'ziguinchor'),
                  stroke: getDepartmentStroke('ziguinchor', mapLayer, selectedDepId === 'ziguinchor', hoveredDepId === 'ziguinchor'),
                  transform: (selectedDepId === 'ziguinchor' || hoveredDepId === 'ziguinchor') ? 'scale(1.03) translate(-2px, 3px)' : 'none',
                  transformOrigin: '110px 340px'
                }}
              />
              <text x="92" y="344" className="fill-white text-[7px] font-black pointer-events-none tracking-widest drop-shadow">ZIG.</text>

              {/* 16. KOLDA */}
              <polygon
                points="170,250 280,270 380,250 490,320 310,360 170,320"
                onClick={() => setSelectedDepId('kolda')}
                onMouseEnter={() => setHoveredDepId('kolda')}
                onMouseLeave={() => setHoveredDepId(null)}
                className="transition-all duration-300 cursor-pointer stroke-2"
                style={{
                  fill: getDepartmentColor('kolda', mapLayer, selectedDepId === 'kolda', hoveredDepId === 'kolda'),
                  stroke: getDepartmentStroke('kolda', mapLayer, selectedDepId === 'kolda', hoveredDepId === 'kolda'),
                  transform: (selectedDepId === 'kolda' || hoveredDepId === 'kolda') ? 'scale(1.02) translate(1px, 2px)' : 'none',
                  transformOrigin: '280px 315px'
                }}
              />
              <text x="270" y="315" className="fill-white text-[10px] font-black pointer-events-none tracking-widest drop-shadow">KOLDA</text>

              {/* ACTIVE METEOROLOGICAL EMERGENCY BLINKING BEACONS */}
              {/* Emergency Beacon for Podor (Severity Critique) */}
              <g className="pointer-events-none">
                <circle cx="230" cy="95" r="7" fill="#ef4444" className="animate-ping" style={{ transformOrigin: '230px 95px' }} />
                <circle cx="230" cy="95" r="4" fill="#ef4444" />
                {mapLayer === 'radar' && (
                  <text x="242" y="98" fill="#f87171" className="text-[7px] font-mono font-bold tracking-wider animate-pulse">ALERTE_RED</text>
                )}
              </g>

              {/* Emergency Beacon for Matam (Severity Critique) */}
              <g className="pointer-events-none">
                <circle cx="390" cy="150" r="7" fill="#ef4444" className="animate-ping" style={{ transformOrigin: '390px 150px' }} />
                <circle cx="390" cy="150" r="4" fill="#ef4444" />
                {mapLayer === 'radar' && (
                  <text x="402" y="153" fill="#f87171" className="text-[7px] font-mono font-bold tracking-wider animate-pulse">ALERTE_RED</text>
                )}
              </g>

              {/* Caution Beacon for Linguère (Vigilance) */}
              <g className="pointer-events-none">
                <circle cx="280" cy="180" r="6" fill="#f59e0b" className="animate-pulse" style={{ transformOrigin: '280px 180px' }} />
                <circle cx="280" cy="180" r="3.5" fill="#f59e0b" />
                {mapLayer === 'radar' && (
                  <text x="292" y="183" fill="#fbbf24" className="text-[7px] font-mono font-bold tracking-wider">WARN_AMB</text>
                )}
              </g>

              {/* Additional beacons referencing Diourbel, Louga, and Saint-Louis under watch */}
              <g className="pointer-events-none">
                {/* Louga watch */}
                <circle cx="160" cy="125" r="5" fill="#f59e0b" className="animate-pulse" style={{ transformOrigin: '160px 125px' }} />
                <circle cx="160" cy="125" r="2.5" fill="#f59e0b" />
                {/* Saint-Louis watch */}
                <circle cx="130" cy="85" r="5" fill="#f59e0b" className="animate-pulse" style={{ transformOrigin: '130px 85px' }} />
                <circle cx="130" cy="85" r="2.5" fill="#f59e0b" />
              </g>

              {/* Status safe indicators for optimally watered zones in radar mode */}
              {mapLayer === 'radar' && (
                <g className="pointer-events-none">
                  <circle cx="210" cy="225" r="4.5" fill="#34d399" />
                  <text x="220" y="228" fill="#34d399" className="text-[7px] font-mono">OK_BASSIN</text>
                  
                  <circle cx="320" cy="330" r="4.5" fill="#34d399" />
                  <text x="330" y="333" fill="#34d399" className="text-[7px] font-mono">OK_CASAM</text>

                  <circle cx="450" cy="300" r="4.5" fill="#34d399" />
                  <text x="415" y="315" fill="#34d399" className="text-[7px] font-mono">OK_ORIENTAL</text>
                </g>
              )}
            </svg>

            {/* Custom Legend Floating Panel (Adapts dynamically to the selected layer) */}
            <div className={`absolute bottom-3 right-3 backdrop-blur-md border p-3 rounded-2xl shadow-xl text-[9px] space-y-1.5 max-w-[190px] transition-all ${
              mapLayer === 'radar'
                ? 'bg-slate-950/95 border-slate-850 text-slate-300'
                : 'bg-white/95 border-slate-150 text-slate-700'
            }`}>
              <p className={`font-black border-b pb-1 text-[9px] uppercase tracking-wider ${
                mapLayer === 'radar' ? 'border-slate-800 text-teal-400' : 'border-slate-150 text-slate-850'
              }`}>
                {mapLayer === 'ndvi' 
                  ? '🌾 Légende Index Végétal' 
                  : mapLayer === 'pluvio' 
                  ? '🌧️ Légende Écart Pluies' 
                  : '🛰️ Télémétrie Radar'
                }
              </p>
              
              {mapLayer === 'ndvi' && (
                <div className="space-y-1 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-600 block"></span>
                    <span>Sécheresse Critique (&lt; 0.35)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-500 block"></span>
                    <span>Stress Léger (~ 0.36 - 0.40)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600 block"></span>
                    <span>Satisfaisant / Humide (&gt; 0.40)</span>
                  </div>
                </div>
              )}

              {mapLayer === 'pluvio' && (
                <div className="space-y-1 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-650 block"></span>
                    <span>Déficit sévère (&lt; 40%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-orange-500 block"></span>
                    <span>Déficit Modéré (40% - 75%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-650 block"></span>
                    <span>Saison Normale (75% - 100%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-blue-600 block"></span>
                    <span>Excédent Humide (&gt; 100%)</span>
                  </div>
                </div>
              )}

              {mapLayer === 'radar' && (
                <div className="space-y-1 font-mono text-[8px]">
                  <div className="flex items-center gap-1.5 text-red-400">
                    <span className="w-2 h-2 rounded bg-red-500 block animate-ping"></span>
                    <span>SINISTRE ACTIF (AUTOMATIQUE)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-teal-400">
                    <span className="w-2 h-2 rounded bg-teal-500 block"></span>
                    <span>ZONES EN OBSERVATION</span>
                  </div>
                  <p className="text-[7px] text-slate-500 italic border-t border-slate-900 pt-1">
                    Radar Copernicus S2 active. Fréquence d'observation bande C.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <div>
                <p className="font-extrabold text-slate-800">Cliqué : <span className="text-primary">{selectedDepData.nom}</span></p>
                <p className="text-[10px] text-slate-500">Région Administrative : {selectedDepData.regionParent}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSimulationDep(selectedDepId);
                setShowPayoutSimulatorModal(true);
              }}
              className="px-3.5 py-1.5 bg-primary/10 hover:bg-[#1A7A3E]/20 text-[#1A7A3E] font-bold rounded-lg transition-all text-[11px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <span>Voter Sinistre</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ALERTS & AUTOMATIC INSURANCE DISPATCH SYSTEM (Col 5) */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          {/* DETAILED SATELLITE STATS OF SELECTED REGION */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Satellite className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest block leading-none">Diagnostic</h3>
                  <span className="text-lg font-black text-slate-900">{selectedDepData.nom}</span>
                </div>
              </div>
              
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                selectedDepData.statutDrought === 'CRITIQUE'
                  ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                  : selectedDepData.statutDrought === 'ALERTE'
                  ? 'bg-yellow-50 text-yellow-750 border border-yellow-200'
                  : 'bg-emerald-50 text-[#1A7A3E] border border-emerald-200'
              }`}>
                ● {selectedDepData.statutDrought}
              </span>
            </div>

            {/* DYNAMIC TELEMETRY PROGRESS METRICS */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* NDVI INDEX LEVEL */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-105 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Indice Végétation (NDVI)</span>
                <p className="text-xl font-black font-mono text-slate-900 tracking-tight">{selectedDepData.ndvi}</p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedDepData.statutDrought === 'CRITIQUE' ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedDepData.ndvi * 100}%` }}
                  />
                </div>
                <p className="text-[8px] text-slate-400 font-medium">Seuil critique d'assurance : &lt; {selectedDepData.ndviMinThreshold}</p>
              </div>

              {/* ACCUMULATED RAINFALL */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-105 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Précipitations (mm)</span>
                <p className="text-xl font-black font-mono text-slate-900 tracking-tight">
                  {selectedDepData.pluviometrieCumulee} <span className="text-xs font-normal">/ {selectedDepData.pluviometrieMoyenne} mm</span>
                </p>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (selectedDepData.pluviometrieCumulee / selectedDepData.pluviometrieMoyenne) * 100)}%` }}
                  />
                </div>
                <p className="text-[8px] text-slate-400 font-medium">Moyenne historique décennale</p>
              </div>

            </div>

            {/* SECONDARY KPIs */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-50/55 rounded-xl border border-slate-100 text-center space-y-0.5">
                <Thermometer className="w-4 h-4 mx-auto text-orange-500" />
                <span className="text-[9px] text-slate-400 block font-bold">Température</span>
                <p className="text-xs font-black text-slate-800 font-mono">{selectedDepData.temperature}°C</p>
              </div>
              <div className="p-3 bg-slate-50/55 rounded-xl border border-slate-100 text-center space-y-0.5">
                <Droplets className="w-4 h-4 mx-auto text-sky-400" />
                <span className="text-[9px] text-slate-400 block font-bold">Humidité</span>
                <p className="text-xs font-black text-slate-800 font-mono">{selectedDepData.humidite}%</p>
              </div>
              <div className="p-3 bg-slate-50/55 rounded-xl border border-slate-100 text-center space-y-0.5">
                <Wind className="w-4 h-4 mx-auto text-slate-400" />
                <span className="text-[9px] text-slate-400 block font-bold">Vent</span>
                <p className="text-xs font-black text-slate-800 font-mono">{selectedDepData.vent} km/h</p>
              </div>
            </div>

            {/* DYNAMIC METEOROLOGICAL SPEECH ALERTS */}
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">🗣️ Guide Vocal Interrégional</span>
                
                {/* Languages selector */}
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setActiveLang('fr')} 
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeLang === 'fr' ? 'bg-primary text-white' : 'text-slate-400'}`}
                  >
                    FR
                  </button>
                  <button 
                    onClick={() => setActiveLang('wo')} 
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeLang === 'wo' ? 'bg-primary text-white' : 'text-slate-400'}`}
                  >
                    WO
                  </button>
                  <button 
                    onClick={() => setActiveLang('pu')} 
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeLang === 'pu' ? 'bg-primary text-white' : 'text-slate-400'}`}
                  >
                    PU
                  </button>
                  <button 
                    onClick={() => setActiveLang('sr')} 
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeLang === 'sr' ? 'bg-primary text-white' : 'text-slate-400'}`}
                  >
                    SR
                  </button>
                </div>
              </div>

              {/* Transcribed Alert */}
              <p className="text-xs text-slate-300 font-medium italic leading-relaxed">
                "{selectedDepData.phonetics[activeLang].text}"
              </p>

              {/* Audio controller */}
              <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[9px] text-slate-400">Cliquez pour écouter l'alerte locale</span>
                <button
                  type="button"
                  onClick={handleAudioPlay}
                  className="bg-primary hover:bg-[#1A7A3E] text-white p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                >
                  {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span className="text-[10px] uppercase tracking-wider font-extrabold px-1">
                    {isPlayingAudio ? "Pause" : "Écouter l'alerte"}
                  </span>
                </button>
              </div>
            </div>

            {/* TRANSPARENT AUTO DISPATCH DECISION TRIGGER */}
            <div className={`p-4 rounded-2xl border text-left space-y-2.5 transition-all ${
              selectedDepData.indemniteDeclenchee 
                ? 'bg-emerald-50/40 border-emerald-150 text-emerald-800' 
                : 'bg-slate-50 border-slate-150 text-slate-650'
            }`}>
              <div className="flex items-center gap-2">
                {selectedDepData.indemniteDeclenchee ? (
                  <CheckCircle2 className="w-5 h-5 text-[#1A7A3E]" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-400" />
                )}
                
                <h4 className="text-xs font-black tracking-tight uppercase">
                  {selectedDepData.indemniteDeclenchee 
                    ? '🟢 Indemnisation Automatique Déclenchée' 
                    : '⚪ Clause Assurantielle Inactive'
                  }
                </h4>
              </div>

              <p className="text-[11px] leading-relaxed font-semibold">
                {selectedDepData.indemniteDeclenchee 
                  ? `La télédétection satellite ayant validé un déficit végétal critique (< 0.35), la CNAAS a débloqué des indemnités forfaitaires de ${selectedDepData.tauxIndemnite.toLocaleString()} FCFA / hectare pour tous les membres affiliés à ${selectedDepData.nom}.`
                  : `La végétation est actuellement jugée saine par le capteur Copernicus de la CNAAS Connect à ${selectedDepData.nom}. Aucun déclenchement n'est requis.`
                }
              </p>

              {currentUser && selectedDepData.indemniteDeclenchee && (
                <div className="border-t border-emerald-100 pt-2 text-[10px] text-[#1A7A3E] font-black">
                  🛡️ Votre espace membre ({currentUser.nom}, résidant à {currentUser.region}) est rattaché à une zone assurable.
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

         {/* 3. NEW CRITICAL REQUEST FOR STATISTICAL AND METEOROLOGICAL DATA PER REGION */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-6">
        
        {/* TABBAR NAVIGATION FOR CHART FOCUS VS ALL REGIONS STATISTICAL TABLE */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black text-slate-800">
                Observatoire National et Données Statistiques Régionales
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Suivi en temps réel des indicateurs météo, états NDVI et indices pluviométriques décennaux de l'ANACIM.
            </p>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setSubPageTab('evolution')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                subPageTab === 'evolution' 
                  ? 'bg-white text-[#1A7A3E] shadow-sm' 
                  : 'text-slate-505 hover:text-slate-800'
              }`}
            >
              <span>📈 Évolution Graphique ({selectedDepData.nom})</span>
            </button>
            <button
              onClick={() => setSubPageTab('global_stats')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                subPageTab === 'global_stats' 
                  ? 'bg-white text-[#1A7A3E] shadow-sm' 
                  : 'text-slate-505 hover:text-slate-800'
              }`}
            >
              <span>📊 Données Statistiques des Différentes Régions</span>
              <span className="bg-primary/20 text-[#1A7A3E] text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">14 Zones</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CHART MONTHLY EVOLUTION FOR FOCUSED DEPT */}
        {subPageTab === 'evolution' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
              <span>Analyses pluviométriques mensuelles comparées aux normales saisonnières pour <strong className="text-primary">{selectedDepData.nom}</strong>.</span>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-800 rounded-xl border border-blue-150">
                  <span className="w-2.5 h-2.5 rounded bg-blue-500"></span> Pluviométrie réelle
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-205">
                  <span className="w-2.5 h-2.5 rounded bg-slate-400"></span> Normale saisonnière
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={selectedDepData.historiqueEvolution}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorPluvio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorMoyenne" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="mois" stroke="#64748b" fontSize={11} fontWeight="bold" />
                    <YAxis stroke="#64748b" fontSize={11} fontWeight="bold" unit="mm" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderRadius: '16px', 
                        color: '#ffffff',
                        fontSize: '11px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pluvioReel" 
                      name="Pluie Observée (mm)"
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorPluvio)" 
                      strokeWidth={2.5}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pluvioMoyenne" 
                      name="Moyenne ANACIM (mm)"
                      stroke="#94a3b8" 
                      fillOpacity={1} 
                      fill="url(#colorMoyenne)" 
                      strokeWidth={1.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* DYNAMIC REGIONAL STATS ANALYSIS NOTES CARD (Col 4) */}
              <div className="lg:col-span-4 bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-slate-800">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black uppercase tracking-wider block">Bilan Climatologique</span>
                  </div>
                  
                  <h3 className="text-base font-black text-slate-900 leading-tight">
                    {selectedDepData.pluviometrieCumulee < selectedDepData.pluviometrieMoyenne 
                      ? '⚠️ Déficit pluviométrique marqué'
                      : '✅ Précipitations satisfaisantes'
                    }
                  </h3>
                  
                  <p className="text-[11px] text-slate-600 leading-relaxed font-semibold font-sans">
                    Les observations d'août 2026 à {selectedDepData.nom} révèlent un cumul saisonnier de <strong>{selectedDepData.pluviometrieCumulee} mm</strong>, soit un écart de <strong>{Math.round(((selectedDepData.pluviometrieCumulee - selectedDepData.pluviometrieMoyenne)/selectedDepData.pluviometrieMoyenne) * 100)}%</strong> par rapport à la climatologie historique de référence (moyenne ANACIM de {selectedDepData.pluviometrieMoyenne} mm).
                  </p>

                  <div className="p-3 bg-white rounded-xl border border-slate-100 text-[10px] text-slate-500 font-medium">
                    La santé foliaire maximale enregistrée (NDVI d'août : {selectedDepData.ndvi}) témoigne de {selectedDepData.ndvi < 0.35 ? "un assèchement critique des sols." : "un bon taux d'humidité résiduelle."}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>Régions affiliées CNAAS Connect :</span>
                    <span className="text-primary font-black">14 zones provinciales</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: DETAILED STATISTICAL & METEOROLOGICAL DATA FOR ALL 14 REGIONS */
          <div className="space-y-6">
            
            {/* National Meteorological Bento Dashboard KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 tracking-wider font-extrabold uppercase block">Végétation moyenne</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {(Object.values(DEPARTEMENTS_METEO).reduce((sum, d) => sum + d.ndvi, 0) / Object.values(DEPARTEMENTS_METEO).length).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-[#1A7A3E] font-black">NDVI</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38%' }}></div>
                </div>
                <span className="text-[9px] text-slate-400 block mt-1">Seuil minimal : 0.35</span>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 tracking-wider font-extrabold uppercase block">Pluies Cumulées</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {Math.round(Object.values(DEPARTEMENTS_METEO).reduce((sum, d) => sum + d.pluviometrieCumulee, 0) / Object.values(DEPARTEMENTS_METEO).length)}
                  </span>
                  <span className="text-[10px] text-blue-700 font-bold">mm / zone</span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-3">Moyenne historique : 455 mm</span>
              </div>

              <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 tracking-wider font-extrabold uppercase block">Température Pays</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {(Object.values(DEPARTEMENTS_METEO).reduce((sum, d) => sum + d.temperature, 0) / Object.values(DEPARTEMENTS_METEO).length).toFixed(1)}
                  </span>
                  <span className="text-xs text-orange-600 font-extrabold">°C</span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-3">Amplitude : 28°C - 39°C</span>
              </div>

              <div className="bg-red-50/70 border border-red-150 p-4 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] text-slate-550 tracking-wider font-extrabold uppercase block">Urgences Télédétectées</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-xl font-black text-red-650 font-mono animate-pulse">
                    {Object.values(DEPARTEMENTS_METEO).filter(d => d.statutDrought === 'CRITIQUE').length}
                  </span>
                  <span className="text-[9px] font-black uppercase text-red-500 bg-red-100/50 px-1.5 py-0.5 rounded-md">Déclenchées</span>
                </div>
                <span className="text-[9px] text-slate-400 block mt-2">Déficit d'humidité absolu</span>
              </div>

            </div>

            {/* Filter Input search row */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <p className="text-xs text-slate-500 font-bold">
                Affichage dynamique des données climatologiques de l'ensemble du pays. Utilisez la recherche pour isoler une région :
              </p>
              
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="🔍 Rechercher une région (ex: Kaolack, Dakar...)"
                  value={statsSearchTerm}
                  onChange={(e) => setStatsSearchTerm(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-150 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-805"
                />
              </div>
            </div>

            {/* Comprehensive Detail Table of all regions */}
            <div className="overflow-x-auto rounded-2xl border border-slate-150 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-500 uppercase font-black tracking-wider border-b border-slate-150">
                    <th className="p-3">Département / Région</th>
                    <th className="p-3 text-center">Status NDVI</th>
                    <th className="p-3">Index Actuel</th>
                    <th className="p-3">Précipitations (Réc / Moy)</th>
                    <th className="p-3">Thermique / Hydriq.</th>
                    <th className="p-3">Membres GIE</th>
                    <th className="p-3">Prime d'Hectare</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {Object.values(DEPARTEMENTS_METEO)
                    .filter(d => 
                      d.nom.toLowerCase().includes(statsSearchTerm.toLowerCase()) || 
                      d.regionParent.toLowerCase().includes(statsSearchTerm.toLowerCase())
                    )
                    .map((dep) => {
                      const deltaPluvio = dep.pluviometrieCumulee - dep.pluviometrieMoyenne;
                      const percentOfNormal = Math.round((dep.pluviometrieCumulee / dep.pluviometrieMoyenne) * 100);

                      return (
                        <tr key={dep.id} className={`hover:bg-slate-50 transition-colors ${selectedDepId === dep.id ? 'bg-[#1A7A3E]/5' : ''}`}>
                          <td className="p-3">
                            <div>
                              <p className="font-extrabold text-slate-900 text-[13px]">{dep.nom}</p>
                              <span className="text-[10px] text-slate-450">{dep.regionParent}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider ${
                              dep.statutDrought === 'CRITIQUE'
                                ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                                : dep.statutDrought === 'ALERTE'
                                ? 'bg-yellow-50 text-yellow-750 border border-yellow-250'
                                : 'bg-emerald-50 text-[#1A7A3E] border border-emerald-200'
                            }`}>
                              ● {dep.statutDrought}
                            </span>
                          </td>
                          <td className="p-3 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black">{dep.ndvi}</span>
                              <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full ${dep.ndvi < 0.35 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${dep.ndvi * 100}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-bold text-slate-800 font-mono">{dep.pluviometrieCumulee} mm <span className="text-slate-400">/ {dep.pluviometrieMoyenne} mm</span></p>
                              <span className={`text-[9px] font-bold ${deltaPluvio < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                {percentOfNormal}% de la normale {deltaPluvio < 0 ? `(${deltaPluvio}mm)` : `(+${deltaPluvio}mm)`}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">
                            🌡️ {dep.temperature}°C | 💧 {dep.humidite}%
                          </td>
                          <td className="p-1.5 text-center font-mono text-slate-800 text-[13px] font-black">
                            {dep.gieMembres} <span className="text-[9px] text-slate-400 font-bold block">GIEs</span>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-black text-slate-850 font-mono">{dep.tauxIndemnite.toLocaleString()} F / ha</p>
                              <span className="text-[9px] text-slate-400 font-semibold">{dep.dernierVersement}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => {
                                setSelectedDepId(dep.id);
                                // Scroll smoothly to the map top container
                                const mapEl = document.getElementById('observatory-map-header');
                                if (mapEl) {
                                  mapEl.scrollIntoView({ behavior: 'smooth' });
                                }
                              }}
                              className="px-2 py-1 text-[10px] bg-[#1A7A3E] hover:bg-emerald-705 text-white font-extrabold rounded-lg transition"
                            >
                              📍 Cibler
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* 4. REAL-TIME BLOCKCHAIN/MOBILE PAYOUT LOGS FOR CNAAS TRUTH SENSORS */}
      <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <FileCheck2 className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-extrabold uppercase tracking-widest leading-none">Journal des versements automatiques (CNAAS Connect)</h3>
          </div>
          <p className="text-[11px] text-slate-500 font-medium pt-1">
            Chaque fois qu'un satellite détecte un indice sous le seuil d'aridité, l'indemnisation est créditée instantanément sur le livret d'épargne ou par virement mobile sans réclamation manuelle.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-500 uppercase font-black tracking-wider border-b border-slate-100">
                <th className="p-4">Identifiant TX</th>
                <th className="p-4">Département/Coopérative</th>
                <th className="p-4">Surface assurée</th>
                <th className="p-4">Indemnité payée</th>
                <th className="p-4">Canal</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium text-xs text-slate-650">
              {localClaimHistory.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-4 font-mono text-[10px] font-black text-slate-500">{log.txHash}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-extrabold text-slate-800">{log.departement}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{log.cooperativeNom}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{log.hectares} Hectares</td>
                  <td className="p-4 font-black text-red-650 font-mono">+{log.montantFcfas.toLocaleString()} FCFA</td>
                  <td className="p-4 text-[11px] font-semibold text-slate-500">{log.modePaiement}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-[9px] bg-emerald-500/15 border border-emerald-200 text-primary rounded-full font-bold">
                      ● {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-[10px] font-bold text-slate-400">{log.dateDeclenchement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. SIMULATOR MODAL PANEL */}
      <AnimatePresence>
        {showPayoutSimulatorModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-6"
            >
              <button 
                onClick={() => setShowPayoutSimulatorModal(false)}
                className="absolute top-5 right-5 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>

              <div className="flex items-center gap-2.5">
                <span className="text-3xl">📡</span>
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider leading-none">Simulation Sinistre Satellite</h3>
                  <span className="text-[10px] text-slate-500 block font-medium">Déclenchez une alerte satellite ANACIM / CNAAS</span>
                </div>
              </div>

              <div className="p-3 bg-[#1A7A3E]/10 border border-[#1A7A3E]/15 rounded-xl text-[10px] text-slate-600 leading-relaxed font-semibold">
                💡 <strong className="text-primary">Mode Démonstration :</strong> Choisissez un département en état de sécheresse critique (Podor, Linguère ou Matam) pour que l'algorithme satellite déclenche la transaction. L'indemnité sera directement créditée sur votre solde d'épargne !
              </div>

              <form onSubmit={handleSimulateClaim} className="space-y-4">
                
                {/* Select dept */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">1. Département à simuler :</label>
                  <select
                    value={simulationDep}
                    onChange={(e) => setSimulationDep(e.target.value)}
                    className="w-full font-bold text-xs bg-slate-50 border border-slate-150 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-805"
                  >
                    <option value="podor">Podor (Sécheresse Critique - Payout maximal)</option>
                    <option value="matam">Matam (Sécheresse Critique - Payout maximal)</option>
                    <option value="linguere">Linguère (Sécheresse Moyenne - Payout partiel)</option>
                    <option value="kaolack">Kaolack (Sain - Aucun versement)</option>
                    <option value="kolda">Kolda (Optimal - Aucun versement)</option>
                  </select>
                </div>

                {/* Hectares input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">2. Surface de votre exploitation (Hectares) :</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={simulationHectares}
                      onChange={(e) => setSimulationHectares(parseInt(e.target.value) || 1)}
                      className="w-full font-bold text-xs tracking-tight bg-slate-50 border border-slate-150 rounded-xl p-3 pr-12 focus:outline-none focus:border-primary text-slate-805"
                    />
                    <span className="absolute right-4.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-black">Ha</span>
                  </div>
                </div>

                {/* Calculation readout */}
                <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold leading-none uppercase">Indemnité Simulée :</span>
                    <span className="text-xs text-slate-300">Taux : {(DEPARTEMENTS_METEO[simulationDep]?.tauxIndemnite || 0).toLocaleString()} F / ha</span>
                  </div>
                  <span className="font-mono font-black text-sm text-accent">
                    {((DEPARTEMENTS_METEO[simulationDep]?.tauxIndemnite || 0) * simulationHectares).toLocaleString()} FCFA
                  </span>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPayoutSimulatorModal(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition"
                  >
                    Fermer
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#1A7A3E] hover:bg-emerald-705 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 transition cursor-pointer"
                  >
                    Déclencher l'aide 🚀
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
