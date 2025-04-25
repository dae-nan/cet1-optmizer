"use client"

import { useEffect, useState } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { formatPercentage, formatCurrency } from "@/utils/calculationUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface SnapshotData {
  cet1Ratio: number
  totalRwa: number
  totalEad: number
}

export default function CET1ImpactComparison() {
  const { counterparties, cet1Capital, getCurrentCet1Ratio, getTotalRwa, optimizationApplied } = usePortfolioStore()
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  // Current values
  const currentCet1Ratio = getCurrentCet1Ratio()
  const currentTotalRwa = getTotalRwa()
  const currentTotalEad = counterparties.reduce((sum, cp) => sum + cp.ead, 0)

  // Take a snapshot of the initial state
  useEffect(() => {
    if (!snapshot && counterparties.length > 0) {
      setSnapshot({
        cet1Ratio: currentCet1Ratio,
        totalRwa: currentTotalRwa,
        totalEad: currentTotalEad,
      })
    }
  }, [counterparties.length, currentCet1Ratio, currentTotalRwa, currentTotalEad, snapshot])

  // Show comparison when there are changes or optimization is applied
  useEffect(() => {
    if (snapshot) {
      const hasChanges =
        Math.abs(snapshot.cet1Ratio - currentCet1Ratio) > 0.0001 ||
        Math.abs(snapshot.totalRwa - currentTotalRwa) > 1 ||
        Math.abs(snapshot.totalEad - currentTotalEad) > 1

      setShowComparison(hasChanges || optimizationApplied)
    }
  }, [snapshot, currentCet1Ratio, currentTotalRwa, currentTotalEad, optimizationApplied])

  // If no snapshot or no changes, don't show the component
  if (!snapshot || !showComparison) {
    return null
  }

  // Calculate changes
  const cet1RatioChange = currentCet1Ratio - snapshot.cet1Ratio
  const rwaChange = currentTotalRwa - snapshot.totalRwa
  const eadChange = currentTotalEad - snapshot.totalEad

  // Calculate percentages for the progress bars
  const beforeRatioPercentage = snapshot.cet1Ratio * 100
  const afterRatioPercentage = currentCet1Ratio * 100

  // Determine if changes are positive or negative (from a risk perspective)
  const isRatioImproved = cet1RatioChange > 0
  const isRwaReduced = rwaChange < 0
  const isEadReduced = eadChange < 0

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUpIcon className="h-5 w-5 mr-2 text-blue-500" />
          CET1 Impact Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CET1 Ratio Comparison */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">CET1 Ratio</h3>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{formatPercentage(snapshot.cet1Ratio)}</div>
              <ArrowRightIcon className="h-4 w-4 mx-2 text-muted-foreground" />
              <div className="text-lg font-semibold flex items-center">
                {formatPercentage(currentCet1Ratio)}
                <span className={`ml-2 text-xs ${isRatioImproved ? "text-green-600" : "text-red-600"}`}>
                  ({cet1RatioChange > 0 ? "+" : ""}
                  {formatPercentage(cet1RatioChange)})
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Before</span>
                <span>After</span>
              </div>
              <div className="relative h-2">
                <Progress value={beforeRatioPercentage} className="h-2 bg-gray-200" indicatorClassName="bg-gray-400" />
                <Progress
                  value={afterRatioPercentage}
                  className="h-2 absolute top-0 left-0 bg-transparent"
                  indicatorClassName={isRatioImproved ? "bg-green-500" : "bg-red-500"}
                />
              </div>
            </div>
          </div>

          {/* RWA Comparison */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Total RWA</h3>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{formatCurrency(snapshot.totalRwa)}</div>
              <ArrowRightIcon className="h-4 w-4 mx-2 text-muted-foreground" />
              <div className="text-lg font-semibold flex items-center">
                {formatCurrency(currentTotalRwa)}
                <span className={`ml-2 text-xs ${isRwaReduced ? "text-green-600" : "text-red-600"}`}>
                  ({rwaChange > 0 ? "+" : ""}
                  {formatCurrency(rwaChange)})
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              {isRwaReduced ? (
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingDownIcon className="h-4 w-4 mr-1" />
                  <span>Reduced by {formatPercentage(Math.abs(rwaChange / snapshot.totalRwa))}</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 text-sm">
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  <span>Increased by {formatPercentage(Math.abs(rwaChange / snapshot.totalRwa))}</span>
                </div>
              )}
            </div>
          </div>

          {/* EAD Comparison */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Total EAD</h3>
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">{formatCurrency(snapshot.totalEad)}</div>
              <ArrowRightIcon className="h-4 w-4 mx-2 text-muted-foreground" />
              <div className="text-lg font-semibold flex items-center">
                {formatCurrency(currentTotalEad)}
                <span className={`ml-2 text-xs ${isEadReduced ? "text-green-600" : "text-red-600"}`}>
                  ({eadChange > 0 ? "+" : ""}
                  {formatCurrency(eadChange)})
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              {isEadReduced ? (
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingDownIcon className="h-4 w-4 mr-1" />
                  <span>Reduced by {formatPercentage(Math.abs(eadChange / snapshot.totalEad))}</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 text-sm">
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  <span>Increased by {formatPercentage(Math.abs(eadChange / snapshot.totalEad))}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
          <p>
            This comparison shows the impact of your EAD adjustments on the CET1 ratio and risk-weighted assets.
            {isRatioImproved && " Your changes have improved the CET1 ratio."}
            {!isRatioImproved && " Your changes have decreased the CET1 ratio."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
