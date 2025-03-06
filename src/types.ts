export interface Step {
  title: string;
  calculation: string;
}

export interface TaxCalculationResult {
  total: number;
  steps: Step[];
}
