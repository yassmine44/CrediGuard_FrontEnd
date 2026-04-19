export type ModeRemboursement = 'MANUEL' | 'LIE_AUX_VENTES' | 'MIXTE';
export type StatutCredit = 'ACTIF' | 'CLOTURE' | 'EN_DEFAUT';

export interface CreditResponse {
  id: number;
  montantAccorde: number;
  montantTotal: number;
  montantRestant: number;
  tauxRemboursement: number;
  dateDebut: string;
  dateFin: string;
  statut: StatutCredit;
  modeRemboursement: ModeRemboursement;
  clientId: number;
  demandeId: number;
  createdAt: string;
  updatedAt: string;
}