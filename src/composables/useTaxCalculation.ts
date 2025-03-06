import { computed, Ref } from 'vue';
import { Step, TaxCalculationResult } from '../types';
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
   * Helper function to create tax calculation steps
   */
  const createBracketCalculation = (
    steps: Step[],
    value: number, 
    rate: number, 
    title: string
  ): number => {
    const cost = value * rate;
    steps.push({
      title,
      calculation: value > 0 
        ? `${formatNumber(value)} × ${rate.toFixed(2)} = ${formatCurrency(cost)}`
        : `0 × ${rate.toFixed(2)} = ${formatCurrency(0)}`
    });
    return cost;
  };

  /**
   * Calculates the power-based tax component
   * @param kw - Vehicle power in kW
   * @returns Tax calculation result with total and calculation steps
   */
  const calculatePowerTax = (kw: number): TaxCalculationResult => {
    const steps: Step[] = [];
    
    // Tax calculation constants
    const POWER_REDUCTION_KW = 45;
    const MINIMUM_POWER_KW = 10;
    const TAX_RATES = {
      firstBracket: { limit: 35, rate: 0.25 },
      secondBracket: { limit: 25, rate: 0.35 },
      thirdBracket: { rate: 0.45 }
    };
    const POWER_BRACKETS = {
      first: 35,
      second: 60, // 35 + 25
    };
    
    let totalTax = 0;

    // Calculate effective power with minimum floor
    const effectivePower = Math.max(kw - POWER_REDUCTION_KW, MINIMUM_POWER_KW);
    steps.push({ 
      title: 'Berechnungsgrundlage:', 
      calculation: `${formatNumber(effectivePower)} kW` 
    });

    // Calculate tax for first bracket
    const firstBracketPower = Math.min(effectivePower, POWER_BRACKETS.first);
    totalTax += createBracketCalculation(
      steps,
      firstBracketPower,
      TAX_RATES.firstBracket.rate,
      `Erste ${POWER_BRACKETS.first} kW um ${TAX_RATES.firstBracket.rate.toFixed(2)} €:`
    );

    // Calculate tax for second bracket
    const secondBracketPower = Math.max(0, Math.min(effectivePower - POWER_BRACKETS.first, TAX_RATES.secondBracket.limit));
    totalTax += createBracketCalculation(
      steps,
      secondBracketPower,
      TAX_RATES.secondBracket.rate,
      `Nächste ${TAX_RATES.secondBracket.limit} kW um ${TAX_RATES.secondBracket.rate.toFixed(2)} €:`
    );

    // Calculate tax for third bracket
    const thirdBracketPower = Math.max(0, effectivePower - POWER_BRACKETS.second);
    totalTax += createBracketCalculation(
      steps,
      thirdBracketPower,
      TAX_RATES.thirdBracket.rate,
      `Restliche kW um ${TAX_RATES.thirdBracket.rate.toFixed(2)} €:`
    );

    steps.push({ 
      title: `Gesamt: ${formatCurrency(totalTax)}`,
      calculation: '', 
    });

    return { total: totalTax, steps };
  };

  /**
   * Calculates the weight-based tax component
   * @param weight - Vehicle weight in kg
   * @returns Tax calculation result with total and calculation steps
   */
  const calculateWeightTax = (weight: number): TaxCalculationResult => {
    const steps: Step[] = [];
    
    // Tax calculation constants
    const WEIGHT_REDUCTION_KG = 900;
    const MINIMUM_WEIGHT_KG = 200;
    const TAX_RATES = {
      firstBracket: { limit: 500, rate: 0.015 },
      secondBracket: { limit: 700, rate: 0.030 },
      thirdBracket: { rate: 0.045 }
    };
    const WEIGHT_BRACKETS = {
      first: 500,
      second: 1200, // 500 + 700
    };
    
    let totalTax = 0;

    // Calculate effective weight with minimum floor
    const effectiveWeight = Math.max(weight - WEIGHT_REDUCTION_KG, MINIMUM_WEIGHT_KG);
    steps.push({ 
      title: 'Berechnungsgrundlage:', 
      calculation: `${formatNumber(effectiveWeight)} kg` 
    });

    /**
     * Helper function to calculate tax for a weight bracket
     */
    const calculateBracketTax = (
      startWeight: number,
      endWeight: number, 
      rate: number, 
      title: string
    ): number => {
      const applicableWeight = Math.max(0, Math.min(effectiveWeight - startWeight, endWeight - startWeight));
      const bracketTax = applicableWeight * rate;
      
      steps.push({
        title,
        calculation: applicableWeight > 0 
          ? `${formatNumber(applicableWeight)} × ${rate.toFixed(3)} = ${formatCurrency(bracketTax)}`
          : `0 × ${rate.toFixed(3)} = ${formatCurrency(0)}`
      });
      
      return bracketTax;
    };

    // Calculate tax for each weight bracket
    totalTax += calculateBracketTax(
      0, 
      WEIGHT_BRACKETS.first, 
      TAX_RATES.firstBracket.rate, 
      `Erste ${WEIGHT_BRACKETS.first} kg um ${TAX_RATES.firstBracket.rate.toFixed(3)} €:`
    );
    
    totalTax += calculateBracketTax(
      WEIGHT_BRACKETS.first, 
      WEIGHT_BRACKETS.second, 
      TAX_RATES.secondBracket.rate, 
      `Nächste ${TAX_RATES.secondBracket.limit} kg um ${TAX_RATES.secondBracket.rate.toFixed(3)} €:`
    );
    
    totalTax += calculateBracketTax(
      WEIGHT_BRACKETS.second, 
      Number.MAX_SAFE_INTEGER, 
      TAX_RATES.thirdBracket.rate, 
      `Restliche kg um ${TAX_RATES.thirdBracket.rate.toFixed(3)} €:`
    );

    steps.push({
      title: `Gesamt: ${formatCurrency(totalTax)}`,
      calculation: ''
    });

    return { total: totalTax, steps };
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
