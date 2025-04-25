import { create } from "zustand"
import { generateCounterparties } from "@/utils/simulationUtils"
import { calculateRwa } from "@/utils/calculationUtils"
import { optimizeEadForTargetCet1 } from "@/utils/optimizationUtils"
import type { Counterparty, PortfolioState } from "@/types"

interface PortfolioStore extends PortfolioState {
  initializePortfolio: () => void
  resetSimulation: () => void // New function to reset the simulation
  updateCounterparty: (id: string, updates: Partial<Counterparty>) => void
  updateCounterpartyEad: (id: string, newEad: number) => void
  resetCounterparty: (id: string) => void
  resetAllCounterparties: () => void
  optimizeEadValues: () => void
  applyOptimizedValues: () => void
  clearOptimizedValues: () => void
  getTotalRwa: () => number
  getSuggestedTotalRwa: () => number
  getCurrentCet1Ratio: () => number
  getSuggestedCet1Ratio: () => number
  sortCounterpartiesByPd: () => Counterparty[]
}

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  counterparties: [],
  cet1Capital: 0,
  targetCet1Ratio: 0.125, // 12.5%
  initialCet1Ratio: 0.14, // 14%
  optimizationApplied: false,

  initializePortfolio: () => {
    // Generate counterparties with initial values
    const counterparties = generateCounterparties(10)

    // Calculate initial RWA for each counterparty and store original values
    const counterpartiesWithRwa = counterparties.map((cp) => {
      const rwa = calculateRwa(cp.pd, cp.lgd, cp.ead)
      return {
        ...cp,
        rwa,
        originalEad: cp.ead,
        originalRwa: rwa,
      }
    })

    // Calculate total RWA
    const totalRwa = counterpartiesWithRwa.reduce((sum, cp) => sum + cp.rwa, 0)

    // Calculate CET1 capital needed for 14% ratio
    const cet1Capital = totalRwa * 0.14

    set({
      counterparties: counterpartiesWithRwa,
      cet1Capital, // This will remain fixed
      optimizationApplied: false,
    })
  },

  // New function to reset the simulation with fresh random data
  resetSimulation: () => {
    // Simply call initializePortfolio to generate new random data
    get().initializePortfolio()
  },

  updateCounterparty: (id, updates) => {
    set((state) => ({
      counterparties: state.counterparties.map((cp) =>
        cp.id === id
          ? {
              ...cp,
              ...updates,
              // Recalculate RWA if PD, LGD, or EAD changed
              rwa:
                updates.pd !== undefined || updates.lgd !== undefined || updates.ead !== undefined
                  ? calculateRwa(updates.pd ?? cp.pd, updates.lgd ?? cp.lgd, updates.ead ?? cp.ead)
                  : cp.rwa,
            }
          : cp,
      ),
      optimizationApplied: false, // Reset optimization flag when manual changes are made
    }))
  },

  updateCounterpartyEad: (id, newEad) => {
    set((state) => ({
      counterparties: state.counterparties.map((cp) => {
        if (cp.id === id) {
          const newRwa = calculateRwa(cp.pd, cp.lgd, newEad)
          return {
            ...cp,
            ead: newEad,
            rwa: newRwa,
            // Clear suggested values when manually changing EAD
            suggestedEad: undefined,
            suggestedRwa: undefined,
          }
        }
        return cp
      }),
      optimizationApplied: false, // Reset optimization flag when manual changes are made
    }))
  },

  resetCounterparty: (id) => {
    set((state) => ({
      counterparties: state.counterparties.map((cp) => {
        if (cp.id === id && cp.originalEad !== undefined) {
          return {
            ...cp,
            ead: cp.originalEad,
            rwa: cp.originalRwa || calculateRwa(cp.pd, cp.lgd, cp.originalEad),
            // Clear suggested values when resetting
            suggestedEad: undefined,
            suggestedRwa: undefined,
          }
        }
        return cp
      }),
      optimizationApplied: false, // Reset optimization flag when resetting
    }))
  },

  resetAllCounterparties: () => {
    set((state) => ({
      counterparties: state.counterparties.map((cp) => {
        if (cp.originalEad !== undefined) {
          return {
            ...cp,
            ead: cp.originalEad,
            rwa: cp.originalRwa || calculateRwa(cp.pd, cp.lgd, cp.originalEad),
            // Clear suggested values when resetting
            suggestedEad: undefined,
            suggestedRwa: undefined,
          }
        }
        return cp
      }),
      optimizationApplied: false, // Reset optimization flag when resetting all
    }))
  },

  optimizeEadValues: () => {
    const { counterparties, cet1Capital, targetCet1Ratio } = get()
    const optimizedCounterparties = optimizeEadForTargetCet1(counterparties, cet1Capital, targetCet1Ratio)

    set({
      counterparties: optimizedCounterparties,
    })
  },

  applyOptimizedValues: () => {
    set((state) => ({
      counterparties: state.counterparties.map((cp) => {
        if (cp.suggestedEad !== undefined) {
          return {
            ...cp,
            ead: cp.suggestedEad,
            rwa: cp.suggestedRwa || calculateRwa(cp.pd, cp.lgd, cp.suggestedEad),
            suggestedEad: undefined,
            suggestedRwa: undefined,
          }
        }
        return cp
      }),
      optimizationApplied: true, // Set flag when optimization is applied
    }))
  },

  clearOptimizedValues: () => {
    set((state) => ({
      counterparties: state.counterparties.map((cp) => ({
        ...cp,
        suggestedEad: undefined,
        suggestedRwa: undefined,
      })),
    }))
  },

  getTotalRwa: () => {
    return get().counterparties.reduce((sum, cp) => sum + cp.rwa, 0)
  },

  getSuggestedTotalRwa: () => {
    return get().counterparties.reduce((sum, cp) => sum + (cp.suggestedRwa || cp.rwa), 0)
  },

  getCurrentCet1Ratio: () => {
    const totalRwa = get().getTotalRwa()
    return totalRwa > 0 ? get().cet1Capital / totalRwa : 0
  },

  getSuggestedCet1Ratio: () => {
    const totalSuggestedRwa = get().getSuggestedTotalRwa()
    return totalSuggestedRwa > 0 ? get().cet1Capital / totalSuggestedRwa : 0
  },

  sortCounterpartiesByPd: () => {
    return [...get().counterparties].sort((a, b) => b.pd - a.pd)
  },
}))
