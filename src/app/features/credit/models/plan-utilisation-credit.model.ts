export type NatureActivite =
  | 'AGRICULTURE'
  | 'COMMERCE'
  | 'SERVICE'
  | 'ARTISANAT'
  | 'AUTRE';

export interface PlanUtilisationRequest {
  descriptionProjet: string;
  objectifCredit: string;
  montantInvestissement: number;
  revenuMensuelPrevu: number | null;
  profitMensuelPrevu: number | null;
  delaiRentabiliteMois: number;
  natureActivite: NatureActivite;
}

export interface PlanUtilisationResponse {
  id: number;
  descriptionProjet: string;
  objectifCredit: string;
  montantInvestissement: number;
  revenuMensuelPrevu: number | null;
  profitMensuelPrevu: number | null;
  delaiRentabiliteMois: number;
  natureActivite: NatureActivite;
  demandeId: number;
}