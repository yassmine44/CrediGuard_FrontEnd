export type ProfilHomeOwnership = 'RENT' | 'MORTGAGE' | 'OWN' | 'OTHER';
export type ProfilDefaultFlag = 'Y' | 'N';
export type ProfilLoanIntent =
  | 'EDUCATION'
  | 'MEDICAL'
  | 'VENTURE'
  | 'PERSONAL'
  | 'DEBTCONSOLIDATION'
  | 'HOMEIMPROVEMENT';

export interface ProfilCreditRequest {
  personAge: number;
  personIncomeAnnual: number;
  personHomeOwnership: ProfilHomeOwnership;
  personEmploymentLength: number;
  previousDefaultOnFile: ProfilDefaultFlag;
  creditHistoryLength: number;
  loanIntent: ProfilLoanIntent;
  monthlyFixedCharges: number;
  existingLoanMonthlyPayments: number;
  outstandingOldDebt: number;
  projectStartDelayMonths: number;
  expectedMonthlyRevenueAfterStart: number;
  hasExistingClients: boolean;
  needsGracePeriod: boolean;
}

export interface ProfilCreditResponse {
  id: number;
  personAge: number;
  personIncomeAnnual: number;
  personHomeOwnership: ProfilHomeOwnership;
  personEmploymentLength: number;
  previousDefaultOnFile: ProfilDefaultFlag;
  creditHistoryLength: number;
  loanIntent: ProfilLoanIntent;
  monthlyFixedCharges: number;
  existingLoanMonthlyPayments: number;
  outstandingOldDebt: number;
  projectStartDelayMonths: number;
  expectedMonthlyRevenueAfterStart: number;
  hasExistingClients: boolean;
  needsGracePeriod: boolean;
  clientId: number;
  createdAt: string;
  updatedAt: string;
}
