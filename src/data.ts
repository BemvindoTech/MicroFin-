import { Offre } from './types';

export const OFFRES_DATA: Offre[] = [
  {
    id: '1',
    titre: 'Crédit semences Niayes',
    zone: 'Niayes (Dakar)',
    prixText: '75 000 FCFA',
    prixNombre: 75000,
    statut: 'Disponible',
    categorie: 'Crédit',
    description: 'Financez l’achat de semences certifiées de pommes de terre, d’oignons ou de carottes de haute qualité pour la zone des Niayes.',
    ficheTechnique: [
      'Taux d’intérêt : 2% préférentiel',
      'Période de remboursement : 4 mois post-récolte',
      'Garantie : Engagement de rachat du GIE / Score mobile money',
      'Déblocage : Sous 48 heures via Wave ou Orange Money'
    ],
    codeUSSD: '*221*101#'
  },
  {
    id: '2',
    titre: 'Assurance maraîchère Kaolack',
    zone: 'Kaolack',
    prixText: '5 000 FCFA',
    prixNombre: 5000,
    statut: 'Disponible',
    categorie: 'Assurance',
    description: 'Protégez vos cultures de gombo, piment et arachides contre le déficit pluviométrique et les vagues de chaleur extrême.',
    ficheTechnique: [
      'Couverture : Jusqu’à 150 000 FCFA par hectare',
      'Déclenchement : Automatique par données satellites météorologiques',
      'Prime annuelle : 5 000 FCFA payables par tranches',
      'Partenaire officiel : CNAAS (Compagnie Nationale d’Assurance Agricole)'
    ],
    codeUSSD: '*221*102#'
  },
  {
    id: '3',
    titre: 'Mini prêt intrants Fatick',
    zone: 'Fatick',
    prixText: '60 000 FCFA',
    prixNombre: 60000,
    statut: 'Indisponible',
    categorie: 'Crédit',
    description: 'Facilité de trésorerie de courte durée pour l’acquisition d’engrais organiques et de petits systèmes d’irrigation goutte-à-goutte.',
    ficheTechnique: [
      'Période de fermeture temporaire : Saison hivernale actuelle',
      'Prochaine ouverture : Début de la contre-saison',
      'Taux d’intérêt : 0% si remboursé sous 60 jours',
      'Plafond ajustable selon l’historique des tontines'
    ],
    codeUSSD: '*221*103#'
  },
  {
    id: '4',
    titre: 'Suivi tontine 12 semaines',
    zone: 'Kaffrine',
    prixText: '0 FCFA',
    prixNombre: 0,
    statut: 'Disponible',
    categorie: 'Tontine',
    description: 'Épargnez en communauté de manière structurée et sécurisée pour constituer le capital de votre prochaine campagne de récolte.',
    ficheTechnique: [
      'Fréquence : Versements hebdomadaires libres',
      'Cotisation minimale : 2 000 FCFA par semaine',
      'Frais d’inscription : 0 FCFA',
      'Accès automatique à un crédit bonifié d’une valeur double de l’épargne cumulée'
    ],
    codeUSSD: '*221*104#'
  },
  {
    id: '5',
    titre: 'Évaluation score mobile money Tambacounda',
    zone: 'Tambacounda',
    prixText: '1 500 FCFA',
    prixNombre: 1500,
    statut: 'Disponible',
    categorie: 'Crédit',
    description: 'Analysez vos flux de transactions pour générer une attestation de solvabilité numérique utilisable auprès des banques partenaires.',
    ficheTechnique: [
      'Critères évalués : Régularité de l’épargne, volume d’affaires mobile money',
      'Validité du score : 6 mois',
      'Économisez sur la paperasse sans besoin de titre foncier',
      'Reconnu par les banques de microfinance locales'
    ],
    codeUSSD: '*221*105#'
  },
  {
    id: '6',
    titre: 'Accompagnement GIE local Kaolack',
    zone: 'Kaolack',
    prixText: '0 FCFA',
    prixNombre: 0,
    statut: 'Disponible',
    categorie: 'Tontine',
    description: 'Assistance technique pour structurer votre Groupement d’Intérêt Économique et numériser vos registres de tontine papier.',
    ficheTechnique: [
      'Type de service : Formation gratuite sur le terrain',
      'Supports : Application SMS/USSD de démonstration multi-utilisateurs',
      'Durée de l’intégration : 3 sessions de 2 heures',
      'Objectif : 100% de transparence dans les comptes collectifs'
    ],
    codeUSSD: '*221*106#'
  }
];

export const STATS = [
  {
    valeur: '94%',
    label: 'Taux de remboursement',
    detail: 'Une solidarité communautaire exemplaire qui remplace les garanties foncières traditionnelles'
  },
  {
    valeur: '12 500+',
    label: 'Producteurs raccordés',
    detail: 'Des maraîchers et arboriculteurs qui gèrent leur quotidien par de simples codes USSD'
  },
  {
    valeur: '345 Millions',
    label: 'FCFA octroyés',
    detail: 'De microfinance locale réinjectée directement dans les sols de nos différentes régions'
  }
];

export const FAQS = [
  {
    q: 'Comment fonctionne l’accès au crédit sans titre foncier ?',
    r: 'Nous utilisons les historiques de votre tontine locale et vos scores de transactions de monnaie électronique (Wave, Orange Money) pour évaluer votre solvabilité. C’est la confiance réciproque au sein de votre GIE qui fait office de garantie.'
  },
  {
    q: 'Comment utiliser l’application sans connexion internet ?',
    r: 'La plateforme fonctionne principalement via la technologie USSD. En composant des codes spéciaux comme *221# sur n’importe quel téléphone portable (même non-smartphone), vous pouvez consulter vos soldes, payer votre tontine et demander un micro-crédit.'
  },
  {
    q: 'Est-ce sécurisé ?',
    r: 'Entièrement. Chaque transaction de tontine ou crédit requiert une double validation : la vôtre grâce à votre code PIN personnel Mobile Money, et celle du responsable de votre collectif agricole.'
  }
];
