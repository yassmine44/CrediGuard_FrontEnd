export type TypeModalite = 'AMORTISSABLE' | 'IN_FINE' | 'REFUS';
export type DecisionModalite = 'ACCEPTER' | 'CONDITIONNEL' | 'REFUS';

export interface ModaliteRequest {
  modaliteChoisie: TypeModalite;
  commentaireAdmin?: string | null;
  choisiePar?: string | null;
}

export interface ModaliteResponse {
  id: number;
  demandeId: number;
  evaluationId: number | null;

  modaliteRecommandee: TypeModalite;
  modaliteChoisie: TypeModalite | null;
  decision: DecisionModalite;
  motif: string;

  tauxInteretAnnuel: number;

  revenuMensuelActuel: number;
  revenuFuturReconnu: number;
  revenuTotalReconnu: number;
  chargesMensuellesTotales: number;
  capaciteMensuelleMax: number;

  mensualiteAmortissable: number;
  mensualiteInFine: number;
  mensualiteGrace: number;

  graceActive: boolean;
  dureeGraceMois: number;
  dureeEffectiveMois: number;

  probabiliteDefaut: number;
  var95: number;
  cvar95: number;
  scoreCredit: number;
  niveauRisque: string | null;

  dti: number;
  paymentToIncome: number;
  lti: number;
  financialStress: boolean;

  coutTotalAmortissable: number;
  coutTotalInFine: number;

  commentaireAdmin: string | null;
  choisiePar: string | null;
  dateChoix: string | null;

  createdAt: string;
  updatedAt: string;
}
export interface LigneAmortissement {
  numeroEcheance: number;
  dateEcheance: string;
  phase: string;
  mensualite: number;
  interet: number;
  capitalRembourse: number;
  capitalRestantDu: number;
}