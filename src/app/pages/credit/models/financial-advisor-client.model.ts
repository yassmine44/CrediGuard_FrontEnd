export interface ClientBankingPath {
    id: string;
    priority: number;
    title: string;
    subtitle: string;
    amountLabel: string;
    amount: number;
    amountSuffix: string;
    explanation: string;
    action: string;
    tone: 'blue' | 'red' | 'green';
  }
  
  export interface ClientBankingPlan {
    statusTitle: string;
    statusMessage: string;
    monthlyPayment: number;
    monthlyCapacity: number;
    paymentGap: number;
    recognizedIncome: number;
    monthlyCharges: number;
    affordableLoanAmount: number;
    recommendedOwnContribution: number;
    suggestedGuaranteeValue: number;
    extraMonthlyIncomeNeeded: number;
    paths: ClientBankingPath[];
  }
  
  export interface FinancialAdvisorClientResponse {
    engine: string;
    clientBankingPlan: ClientBankingPlan;
  }
  