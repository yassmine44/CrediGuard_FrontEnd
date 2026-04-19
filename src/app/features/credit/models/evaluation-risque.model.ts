export type NiveauRisque = 'FAIBLE' | 'MOYEN' | 'ELEVE';
export type DecisionSuggeree = 'ACCEPTER' | 'CONDITIONS' | 'REFUSER';

export interface EvaluationRisqueResponse {
  id: number;
  score: number;
  niveauRisque: NiveauRisque;
  probabiliteDefaut: number;
  versionModele: string;
  decisionSuggeree: DecisionSuggeree;
  dateEvaluation: string;
  demandeId: number;
}
