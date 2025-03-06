export interface Step {
  title: string;
  calculation: string;
}

export interface TaxCalculationResult {
  total: number;
  steps: Step[];
}

/**
 * Interface for defining a tax bracket configuration
 */
export interface TaxBracket {
  start: number;
  end: number;
  rate: number;
  title: string;
  formatRate?: boolean; // Whether to format rate with 2 or 3 decimal places
}