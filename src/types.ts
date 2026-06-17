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
