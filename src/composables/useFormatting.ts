export function useFormatting() {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat(navigator.language, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat(navigator.language, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  return {
    formatCurrency,
    formatNumber
  };
}
