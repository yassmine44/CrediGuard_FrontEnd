export interface AdvisorBaseline {
    baseRisk: number;
    scenarioRisk: number;
    severeRisk: number;
    uncertainty: number;
    score: number;
    decision: string;
    riskClass: string;
    highUncertainty: boolean;
  }
  
  export interface ImprovementPath {
    id: string;
    title: string;
    message: string;
    action: string;
    scoreAfter: number;
    riskAfter: number;
    scoreGain: number;
    riskReduction: number;
    decisionAfter: string;
  }
  
  export interface ChartPoint {
    label: string;
    value: number;
  }
  
  export interface ImpactPoint {
    label: string;
    scoreGain: number;
    riskReduction: number;
  }
  
  export interface AdvisorChartData {
    scorePath: ChartPoint[];
    riskPath: ChartPoint[];
    impactRanking: ImpactPoint[];
  }
  
  export interface ActionPlanStep {
    period: string;
    task: string;
  }
  
  export interface ClientReport {
    title: string;
    headline: string;
    clientMessage: string;
    businessContext: string;
    mainRecommendation: string;
    strengths: string[];
    weaknesses: string[];
    actionPlan: ActionPlanStep[];
    aiNarrative?: string;
  }
  
  export interface FinancialAdvisorResponse {
    engine: string;
    baseline: AdvisorBaseline;
    improvementPaths: ImprovementPath[];
    bestPath: ImprovementPath | null;
    chartData: AdvisorChartData;
    clientReport: ClientReport;
  }
  