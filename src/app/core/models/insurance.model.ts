export enum ClaimStatus {
  PENDING = 'PENDING',
  EN_ANALYSE = 'EN_ANALYSE',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum PolicyStatus {
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  EXPIRE = 'EXPIRE',
  RESILIE = 'RESILIE'
}

export interface InsuranceCompany {
  id?: number;
  name: string;
  registrationNumber: string;
  logoUrl?: string;
  description?: string;
  categories?: string[];
  reliabilityNote?: number;
  active?: boolean;
  offers?: InsuranceOffer[];
}

export interface InsuranceOffer {
  id?: number;
  name: string;
  annualPremium: number;
  coverageDetails: string;
  guarantees: any;
  exclusions: any;
  type: string;
  coverageAmount: number;
  franchise: number;
  coverageRate: number;
  tags: any;
  active?: boolean;
  companyId?: number;
  companyName?: string;
  adequacyScore?: number;
}

export interface InsurancePolicy {
  id?: number;
  policyNumber?: string;
  startDate: string;
  endDate: string;
  insuranceCompany?: InsuranceCompany;
  insuranceOffer?: InsuranceOffer;
  client?: any;
  status: PolicyStatus;
  premiumAmount: number;
  declaredValue: number;
  goodsDescription: string;
  pdfUrl?: string;
  durationYears: number;
}

export interface InsuranceClaim {
  id?: number;
  claimNumber?: string;
  status: ClaimStatus;
  description: string;
  documentsUrl?: string[];
  amountRequested: number;
  amountApproved?: number;
  rejectionReason?: string;
  fraudScore?: number;
  declaredAt?: string;
  decidedAt?: string;
  user?: any;
  insurancePolicy?: InsurancePolicy;
}

export interface RiskScore {
  id?: number;
  globalScore: number;
  sectorScore: number;
  regionScore: number;
  historyScore: number;
  factorDetails: string;
  computedAt: string;
}

export interface InsuranceRecommendation {
  id?: number;
  riskScore: number;
  recommendationText: string;
  suggestedOffers: InsuranceOffer[];
  calculationDate: string;
}
