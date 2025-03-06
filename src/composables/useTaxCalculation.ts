import { computed, Ref } from 'vue';
import { Step, TaxBracket, TaxCalculationResult } from '../types';
import { useFormatting } from './useFormatting';

/**
 * Composable for vehicle tax calculation in Austria
 * @param leistung - Vehicle power in kW
 * @param gewicht - Vehicle weight in kg
 * @returns Tax calculation results and utility functions
 */
export function useTaxCalculation(leistung: Ref<number>, gewicht: Ref<number>) {
  const { formatNumber, formatCurrency } = useFormatting();

  /**
   * Generic function to calculate tax based on bracket configurations
   * @param value - Base value for calculation
   * @param reduction - Reduction amount to subtract from value
   * @param minimum - Minimum value after reduction
   * @param brackets - Array of tax brackets to apply
   * @param unit - Unit of measurement for display
   * @returns Tax calculation result with total and steps
   */
  const calculateBracketTax = (
    value: number,
    reduction: number,
    minimum: number,
    brackets: TaxBracket[],
    unit: string
  ): TaxCalculationResult => {
    const steps: Step[] = [];
    let totalTax = 0;

    // Calculate effective value with minimum floor
    const effectiveValue = Math.max(value - reduction, minimum);
    steps.push({
      title: 'Berechnungsgrundlage:',
      calculation: `${formatNumber(effectiveValue)} ${unit}`
    });

    // Calculate tax for each bracket
    brackets.forEach(bracket => {
      const { start, end, rate, title, formatRate = false } = bracket;
      const applicableValue = Math.max(0, Math.min(effectiveValue - start, end - start));
      const bracketTax = applicableValue * rate;
      const rateFormatted = formatRate ? rate.toFixed(3) : rate.toFixed(2);
      
      steps.push({
        title,
        calculation: applicableValue > 0
          ? `${formatNumber(applicableValue)} × ${rateFormatted} = ${formatCurrency(bracketTax)}`
          : `0 × ${rateFormatted} = ${formatCurrency(0)}`
      });
      
      totalTax += bracketTax;
    });

    steps.push({
      title: `Gesamt: ${formatCurrency(totalTax)}`,
      calculation: ''
    });

    return { total: totalTax, steps };
  };

  /**
   * Calculates the power-based tax component
   * @param kw - Vehicle power in kW
   * @returns Tax calculation result with total and calculation steps
   */
  const calculatePowerTax = (kw: number): TaxCalculationResult => {
    // Power tax bracket configuration
    const powerBrackets: TaxBracket[] = [
      {
        start: 0,
        end: 35,
        rate: 0.25,
        title: 'Erste 35 kW um 0,25 €:'
      },
      {
        start: 35,
        end: 60,
        rate: 0.35,
        title: 'Nächste 25 kW um 0,35 €:'
      },
      {
        start: 60,
        end: Number.MAX_SAFE_INTEGER,
        rate: 0.45,
        title: 'Restliche kW um 0,45 €:'
      }
    ];

    return calculateBracketTax(kw, 45, 10, powerBrackets, 'kW');
  };

  /**
   * Calculates the weight-based tax component
   * @param weight - Vehicle weight in kg
   * @returns Tax calculation result with total and calculation steps
   */
  const calculateWeightTax = (weight: number): TaxCalculationResult => {
    // Weight tax bracket configuration
    const weightBrackets: TaxBracket[] = [
      {
        start: 0,
        end: 500,
        rate: 0.015,
        title: 'Erste 500 kg um 0,015 €:',
        formatRate: true
      },
      {
        start: 500,
        end: 1200,
        rate: 0.030,
        title: 'Nächste 700 kg um 0,030 €:',
        formatRate: true
      },
      {
        start: 1200,
        end: 99999,
        rate: 0.045,
        title: 'Restliche kg um 0,045 €:',
        formatRate: true
      }
    ];

    return calculateBracketTax(weight, 900, 200, weightBrackets, 'kg');
  };

  /**
   * Computed property that calculates total tax based on current power and weight values
   */
  const result = computed(() => {
    const powerCalc = calculatePowerTax(leistung.value);
    const weightCalc = calculateWeightTax(gewicht.value);
    
    const monthlyTotal = powerCalc.total + weightCalc.total;

    return {
      powerSteps: powerCalc.steps,
      weightSteps: weightCalc.steps,
      monthlyTotal
    };
  });

  return {
    result,
    formatCurrency
  };
}
