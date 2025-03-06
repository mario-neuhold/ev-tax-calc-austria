import { computed, Ref } from 'vue';
import { Step, TaxCalculationResult } from '../types';
import { useFormatting } from './useFormatting';

export function useTaxCalculation(leistung: Ref<number>, gewicht: Ref<number>) {
  const { formatNumber, formatCurrency } = useFormatting();

  const calculatePowerTax = (kw: number): TaxCalculationResult => {
    const steps: Step[] = [];
    const reductionKw = 45;
    let total = 0;

    // Mindestens 10 kW
    const effectiveKw = Math.max(kw - reductionKw, 10);
    steps.push({ 
      title: 'Berechnungsgrundlage:', 
      calculation: `${formatNumber(effectiveKw)} kW` 
    });

    // Erste 35 kW
    const first35 = Math.min(effectiveKw, 35);
    const first35Cost = first35 * 0.25;
    total += first35Cost;
    steps.push({ 
      title: 'Erste 35 kW um 0,25 €:', 
      calculation: `${formatNumber(first35)} × 0,25 = ${formatCurrency(first35Cost)}` 
    });

    // Nächste 25 kW
    if (effectiveKw > 35) {
      const next25 = Math.min(effectiveKw - 35, 25);
      const next25Cost = next25 * 0.35;
      total += next25Cost;
      steps.push({ 
        title: 'Nächste 25 kW um 0,35 €:', 
        calculation: `${formatNumber(next25)} × 0,35 = ${formatCurrency(next25Cost)}` 
      });
    } else {
      steps.push({ 
        title: 'Nächste 25 kW um 0,35 €:', 
        calculation: `0 × 0,35 = ${formatCurrency(0)}` 
      });
    }

    // Restliche kW
    if (effectiveKw > 60) {
      const remaining = effectiveKw - 60;
      const remainingCost = remaining * 0.45;
      total += remainingCost;
      steps.push({ 
        title: 'Restliche kW um 0,45 €:', 
        calculation: `${formatNumber(remaining)} × 0,45 = ${formatCurrency(remainingCost)}` 
      });
    } else {
      steps.push({ 
        title: 'Restliche kW um 0,45 €:', 
        calculation: `0 × 0,45 = ${formatCurrency(0)}` 
      });
    }

    steps.push({ 
      title: `Gesamt: ${formatCurrency(total)}`,
      calculation: '', 
    });

    return { total, steps };
  };

  const calculateWeightTax = (weight: number): TaxCalculationResult => {
    const steps: Step[] = [];
    const reductionWeight = 900;
    let total = 0;

    // Mindestens 200 kg
    const effectiveWeight = Math.max(weight - reductionWeight, 200);

    // Erste 500 kg
    const first500 = Math.min(effectiveWeight, 500);
    const first500Cost = first500 * 0.015;
    if (first500 > 0) {
      total += first500Cost;
      steps.push({
        title: 'Erste 500 kg um 0,015 €:',
        calculation: `${formatNumber(first500)} × 0,015 = ${formatCurrency(first500Cost)}`
      });
    }

    // Nächste 700 kg
    if (effectiveWeight > 500) {
      const next700 = Math.min(effectiveWeight - 500, 700);
      const next700Cost = next700 * 0.030;
      total += next700Cost;
      steps.push({
        title: 'Nächste 700 kg um 0,030 €:',
        calculation: `${formatNumber(next700)} × 0,030 = ${formatCurrency(next700Cost)}`
      });
    } else {
      steps.push({
        title: 'Nächste 700 kg um 0,030 €:',
        calculation: `0 × 0,030 = ${formatCurrency(0)}`
      });
    }

    // Restliche kg
    if (effectiveWeight > 1200) {
      const remaining = effectiveWeight - 1200;
      const remainingCost = remaining * 0.045;
      total += remainingCost;
      steps.push({
        title: 'Restliche kg um 0,045 €:',
        calculation: `${formatNumber(remaining)} × 0,045 = ${formatCurrency(remainingCost)}`
      });
    } else {
      steps.push({
        title: 'Restliche kg um 0,045 €:',
        calculation: `0 × 0,045 = ${formatCurrency(0)}`
      });
    }

    steps.push({
      title: `Gesamt: ${formatCurrency(total)}`,
      calculation: ''
    });

    return { total, steps };
  };

  const result = computed(() => {
    const powerCalc = calculatePowerTax(leistung.value);
    const weightCalc = calculateWeightTax(gewicht.value);
    
    const monthlyTotal = powerCalc.total + weightCalc.total;

    return {
      powerSteps: powerCalc.steps,
      weightSteps: weightCalc.steps,
      monthlyTotal: monthlyTotal
    };
  });

  return {
    result,
    formatCurrency
  };
}
