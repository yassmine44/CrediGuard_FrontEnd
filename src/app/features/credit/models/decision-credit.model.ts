export type DecisionFinale = 'ACCEPTE' | 'REFUSE' | 'CONDITIONNEL';

export interface DecisionCreditRequest {
  decisionFinale: DecisionFinale;
  justification: string;
  conditions?: string | null;
  prisePar: string;
}

export interface DecisionCreditResponse {
  id: number;
  decisionFinale: DecisionFinale;
  justification: string;
  conditions?: string | null;
  dateDecision: string;
  prisePar: string;
  demandeId: number;
  createdAt: string;
  updatedAt: string;
}