export type TypeCredit = 'NUMERAIRE' | 'EN_NATURE' | 'VOUCHER';

export type StatutDemande =
  | 'SOUMISE'
  | 'EN_COURS_D_ETUDE'
  | 'APPROUVEE'
  | 'REJETEE';

export interface DemandeCreditRequest {
  typeCredit: TypeCredit;
  montantDemande: number;
  dureeMois: number;
  objetCredit: string;
}

export interface DemandeCreditResponse {
  id: number;
  reference: string;
  typeCredit: TypeCredit;
  montantDemande: number;
  dureeMois: number;
  objetCredit: string;
  statut: StatutDemande;
  dateCreation: string;
  clientId: number;
  clientName: string;
  voucherId: number | null;
  createdAt: string;
  updatedAt: string;
}