export interface Counterparty {
  id: string
  name: string
  pd: number // Probability of Default (0-1)
  lgd: number // Loss Given Default (0-1)
  ead: number // Exposure at Default (in currency units)
  originalEad?: number // To track original EAD value
  rwa: number // Risk-Weighted Assets (calculated)
  originalRwa?: number // To track original RWA value
  suggestedEad?: number // Suggested EAD after optimization
  suggestedRwa?: number // Suggested RWA after optimization
}

export interface PortfolioState {
  counterparties: Counterparty[]
  cet1Capital: number
  targetCet1Ratio: number
  initialCet1Ratio: number
  optimizationApplied: boolean
}
