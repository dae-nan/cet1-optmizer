// Calculate K (capital requirement)
export const calculateK = (pd: number, lgd: number): number => {
  // For simplicity, we're using K = LGD × PD as mentioned in the requirements
  // In a real Basel 3.1 implementation, this would be more complex
  return lgd * pd
}

// Calculate RWA for a counterparty
export const calculateRwa = (pd: number, lgd: number, ead: number): number => {
  const k = calculateK(pd, lgd)
  return k * 12.5 * ead
}

// Calculate CET1 ratio
export const calculateCet1Ratio = (cet1Capital: number, totalRwa: number): number => {
  return totalRwa > 0 ? cet1Capital / totalRwa : 0
}

// Format number as percentage
export const formatPercentage = (value: number): string => {
  return (value * 100).toFixed(2) + "%"
}

// Format number as currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}
