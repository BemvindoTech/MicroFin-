export interface Offre {
  id: string;
  titre: string;
  zone: string;
  prixText: string;
  prixNombre: number;
  statut: 'Disponible' | 'Indisponible';
  categorie: 'Crédit' | 'Assurance' | 'Tontine';
  description: string;
  ficheTechnique: string[];
  codeUSSD: string;
}

export interface InscriptionTontine {
  nom: string;
  telephone: string;
  frequence: string;
  montant: number;
}

export type UserRole = 'PRODUCTEUR' | 'AGENT' | 'GESTIONNAIRE';

export interface User {
  id: string;
  nom: string;
  telephone: string;
  role: UserRole;
  region: string;
  gieNom?: string;       // pour les producteurs
  matriculeAgent?: string; // pour les agents
  serviceUnite?: string;   // pour les gestionnaires
  soldeEpargne?: number;   // pour les producteurs
  limiteCredit?: number;   // pour les producteurs
}
