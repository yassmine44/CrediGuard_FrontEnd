export type ProductRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type ProductPerformanceLabel = 'BEST_SELLER' | 'STABLE' | 'SLOW_MOVING' | 'AT_RISK';
export type ProductSuggestedAction = 'RESTOCK' | 'PROMOTE' | 'MONITOR' | 'KEEP';

export interface ProductIntelligence {
  id: number;
  productId: number;
  productName: string;
  categoryName?: string | null;
  currentStock: number;
  salesLast7Days: number;
  salesLast30Days: number;
  riskLevel: ProductRiskLevel;
  daysToStockout: number;
  recommendedRestock: number;
  performanceScore: number;
  performanceLabel: ProductPerformanceLabel;
  suggestedAction: ProductSuggestedAction;
  reasons: string[];
  riskConfidence?: number | null;
  actionConfidence?: number | null;
  mlDecision?: string | null;
  mainDrivers?: string[];
  businessRecommendation?: string | null;
  modelType?: string | null;
  analyzedAt: string;
}

export interface ProductIntelligenceHistory {
  id: number;
  productId: number;
  productName: string;
  currentStock: number;
  salesLast7Days: number;
  salesLast30Days: number;
  riskLevel: ProductRiskLevel;
  daysToStockout: number;
  recommendedRestock: number;
  performanceScore: number;
  performanceLabel: ProductPerformanceLabel;
  suggestedAction: ProductSuggestedAction;
  reasons: string[];
  riskConfidence?: number | null;
  actionConfidence?: number | null;
  mlDecision?: string | null;
  mainDrivers?: string[];
  businessRecommendation?: string | null;
  modelType?: string | null;
  analyzedAt: string;
}

export interface ProductIntelligenceModelInfo {
  mlEnabled: boolean;
  modelLoaded: boolean;
  mode: string;
  modelType?: string | null;
  rows?: number | null;
  message?: string | null;
}
