"use client"

import { useEffect } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import CounterpartyTable from "@/components/CounterpartyTable"
import PortfolioSummary from "@/components/PortfolioSummary"
import CET1RatioDisplay from "@/components/CET1RatioDisplay"
import OptimizationPanel from "@/components/OptimizationPanel"
import CET1ImpactComparison from "@/components/CET1ImpactComparison"
import ResetSimulationButton from "@/components/ResetSimulationButton"
import BaselFormulaHelp from "@/components/BaselFormulaHelp"

export default function Dashboard() {
  const { initializePortfolio, counterparties } = usePortfolioStore()

  useEffect(() => {
    // Initialize portfolio on component mount
    initializePortfolio()
  }, [initializePortfolio])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">CET1 Optimizer</h1>
        <ResetSimulationButton />
      </div>

      {/* Add the CET1 Ratio Display at the top */}
      <CET1RatioDisplay />

      {/* Add the Optimization Panel */}
      <OptimizationPanel />

      {/* Add the CET1 Impact Comparison */}
      <CET1ImpactComparison />

      {/* Add Basel Formula Help */}
      <BaselFormulaHelp />

      <div className="mb-8">
        <PortfolioSummary />
      </div>

      <div>
        <CounterpartyTable counterparties={counterparties} />
      </div>
    </div>
  )
}
