export interface GSTBreakdown {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
}

export interface GSTCalculationInput {
  amount: number;
  gstRate: number;
  type: 'inclusive' | 'exclusive';
}

/**
 * Calculate GST for inclusive pricing
 * Formula: GST Amount = (Total Price × GST Rate) / (100 + GST Rate)
 */
export const calculateGSTInclusive = (totalAmount: number, gstRate: number): GSTBreakdown => {
  const gstAmount = (totalAmount * gstRate) / (100 + gstRate);
  const baseAmount = totalAmount - gstAmount;
  
  return {
    baseAmount: Number(baseAmount.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2))
  };
};

/**
 * Calculate GST for exclusive pricing
 * Formula: GST Amount = Base Price × (GST Rate / 100)
 */
export const calculateGSTExclusive = (baseAmount: number, gstRate: number): GSTBreakdown => {
  const gstAmount = baseAmount * (gstRate / 100);
  const totalAmount = baseAmount + gstAmount;
  
  return {
    baseAmount: Number(baseAmount.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2))
  };
};

/**
 * Get GST breakdown based on input parameters
 */
export const getGSTBreakdown = (input: GSTCalculationInput): GSTBreakdown => {
  if (input.type === 'inclusive') {
    return calculateGSTInclusive(input.amount, input.gstRate);
  } else {
    return calculateGSTExclusive(input.amount, input.gstRate);
  }
};

/**
 * Validate GST rate
 */
export const validateGSTRate = (rate: number): boolean => {
  return rate >= 0 && rate <= 28 && Number.isFinite(rate);
};

/**
 * Common GST rates in India
 */
export const GST_RATES = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 12, label: '12%' },
  { value: 18, label: '18%' },
  { value: 28, label: '28%' }
];

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};