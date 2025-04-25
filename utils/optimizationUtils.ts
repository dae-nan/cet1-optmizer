import type { Counterparty } from "@/types"
import { calculateRwa } from "./calculationUtils"

/**
 * Calculates the suggested EAD reductions to reach the target CET1 ratio
 * Prioritizes counterparties with higher PD values
 */
export function optimizeEadForTargetCet1(
  counterparties: Counterparty[],
  cet1Capital: number,
  targetCet1Ratio: number,
): Counterparty[] {
  // Create a deep copy of counterparties to work with
  const optimizedCounterparties = counterparties.map((cp) => ({ ...cp }))

  // Calculate current total RWA
  const totalRwa = optimizedCounterparties.reduce((sum, cp) => sum + cp.rwa, 0)

  // Calculate target total RWA to achieve target CET1 ratio
  const targetTotalRwa = cet1Capital / targetCet1Ratio

  // If current RWA is already at or below target, no optimization needed
  if (totalRwa <= targetTotalRwa) {
    return counterparties.map((cp) => ({
      ...cp,
      suggestedEad: cp.ead,
      suggestedRwa: cp.rwa,
    }))
  }

  // Calculate how much RWA needs to be reduced
  const rwaToReduce = totalRwa - targetTotalRwa

  // Sort counterparties by PD in descending order
  const sortedByPd = [...optimizedCounterparties].sort((a, b) => b.pd - a.pd)

  // Track remaining RWA to reduce
  let remainingRwaToReduce = rwaToReduce

  // Apply reductions to counterparties with highest PD first
  for (const sortedCp of sortedByPd) {
    if (remainingRwaToReduce <= 0) break

    // Find the corresponding counterparty in our working copy
    const cp = optimizedCounterparties.find((c) => c.id === sortedCp.id)!

    // Calculate K factor for this counterparty
    const k = cp.pd * cp.lgd
    const rwaPer1Ead = k * 12.5

    // Calculate maximum EAD reduction (limit to 80% of original EAD)
    const maxEadReduction = cp.ead * 0.8
    const maxRwaReduction = maxEadReduction * rwaPer1Ead

    // Calculate actual RWA reduction for this counterparty
    const rwaReduction = Math.min(remainingRwaToReduce, maxRwaReduction)

    // Calculate corresponding EAD reduction
    const eadReduction = rwaPer1Ead > 0 ? rwaReduction / rwaPer1Ead : 0

    // Calculate suggested values
    const suggestedEad = Math.max(cp.ead - eadReduction, cp.ead * 0.2) // Ensure at least 20% of original EAD remains
    const suggestedRwa = calculateRwa(cp.pd, cp.lgd, suggestedEad)

    // Update the counterparty with suggested values
    cp.suggestedEad = suggestedEad
    cp.suggestedRwa = suggestedRwa

    // Update remaining RWA to reduce
    remainingRwaToReduce -= cp.rwa - suggestedRwa
  }

  return optimizedCounterparties
}

/**
 * Calculates the CET1 ratio that would result from applying the suggested EAD values
 */
export function calculateSuggestedCet1Ratio(counterparties: Counterparty[], cet1Capital: number): number {
  // Calculate total suggested RWA
  const totalSuggestedRwa = counterparties.reduce((sum, cp) => sum + (cp.suggestedRwa || cp.rwa), 0)

  // Calculate suggested CET1 ratio
  return totalSuggestedRwa > 0 ? cet1Capital / totalSuggestedRwa : 0
}
