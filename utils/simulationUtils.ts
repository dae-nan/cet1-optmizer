import type { Counterparty } from "@/types"
import { calculateRwa } from "./calculationUtils"

// Generate a random number between min and max
export const randomInRange = (min: number, max: number): number => {
  return min + Math.random() * (max - min)
}

// Generate a random counterparty
export const generateCounterparty = (id: number): Counterparty => {
  // Generate random values
  const pd = randomInRange(0.001, 0.05) // 0.1% to 5%
  const lgd = randomInRange(0.3, 0.7) // 30% to 70%
  const ead = Math.round(randomInRange(1000000, 10000000)) // $1M to $10M

  // Calculate RWA
  const rwa = calculateRwa(pd, lgd, ead)

  return {
    id: id.toString(),
    name: `Counterparty ${id}`,
    pd,
    lgd,
    ead,
    rwa,
  }
}

// Generate multiple counterparties
export const generateCounterparties = (count: number): Counterparty[] => {
  return Array.from({ length: count }, (_, i) => generateCounterparty(i + 1))
}

// Adjust counterparties to achieve target CET1 ratio
export const adjustCounterpartiesToTargetCet1 = (
  counterparties: Counterparty[],
  cet1Capital: number,
  targetCet1Ratio: number,
): Counterparty[] => {
  // Sort counterparties by PD (highest first)
  const sortedCounterparties = [...counterparties].sort((a, b) => b.pd - a.pd)

  // Calculate current total RWA
  const currentTotalRwa = sortedCounterparties.reduce((sum, cp) => sum + cp.rwa, 0)

  // Calculate target total RWA
  const targetTotalRwa = cet1Capital / targetCet1Ratio

  // If current RWA is already at or below target, no adjustment needed
  if (currentTotalRwa <= targetTotalRwa) {
    return counterparties
  }

  // Calculate how much RWA needs to be reduced
  const rwaToReduce = currentTotalRwa - targetTotalRwa

  // Adjust EAD for counterparties with highest PD first
  let remainingRwaToReduce = rwaToReduce
  const adjustedCounterparties = counterparties.map((cp) => ({ ...cp }))

  for (const cp of sortedCounterparties) {
    if (remainingRwaToReduce <= 0) break

    const originalCp = adjustedCounterparties.find((c) => c.id === cp.id)!

    // Calculate how much EAD to reduce
    const k = originalCp.lgd * originalCp.pd
    const rwaPer1Ead = k * 12.5
    const maxEadReduction = originalCp.ead * 0.5 // Limit reduction to 50% of original EAD
    const eadToReduce = Math.min(remainingRwaToReduce / rwaPer1Ead, maxEadReduction)

    // Update the counterparty
    originalCp.ead -= eadToReduce
    originalCp.rwa = calculateRwa(originalCp.pd, originalCp.lgd, originalCp.ead)

    // Update remaining RWA to reduce
    remainingRwaToReduce -= eadToReduce * rwaPer1Ead
  }

  return adjustedCounterparties
}
