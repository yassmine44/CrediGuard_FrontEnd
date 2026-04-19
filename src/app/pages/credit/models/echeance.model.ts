export type StatutEcheance = 'A_PAYER' | 'PAYEE' | 'EN_RETARD';

export interface EcheanceResponse {
  id: number;
  dateEcheance: string;
  capitalDu: number;
  interetDu: number;
  statut: StatutEcheance;
  creditId: number;
}

export interface EcheancePaymentRequest {
  montantPaye: number;
}