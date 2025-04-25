"use client"

import { usePortfolioStore } from "@/store/usePortfolioStore"
import { formatPercentage, formatCurrency } from "@/utils/calculationUtils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircleIcon, CheckCircleIcon, LightbulbIcon } from "lucide-react"

export default function OptimizationPanel() {
  const {
    optimizeEadValues,
    applyOptimizedValues,
    clearOptimizedValues,
    getCurrentCet1Ratio,
    getSuggestedCet1Ratio,
    targetCet1Ratio,
    counterparties,
    optimizationApplied,
  } = usePortfolioStore()

  const currentCet1Ratio = getCurrentCet1Ratio()
  const suggestedCet1Ratio = getSuggestedCet1Ratio()
  const hasSuggestions = counterparties.some((cp) => cp.suggestedEad !== undefined)
  const isTargetMet = currentCet1Ratio <= targetCet1Ratio && currentCet1Ratio >= targetCet1Ratio * 0.95

  // Calculate total EAD reduction from suggestions
  const totalEadReduction = counterparties.reduce((sum, cp) => {
    if (cp.suggestedEad !== undefined) {
      return sum + (cp.ead - cp.suggestedEad)
    }
    return sum
  }, 0)

  // Calculate total RWA reduction from suggestions
  const totalRwaReduction = counterparties.reduce((sum, cp) => {
    if (cp.suggestedRwa !== undefined) {
      return sum + (cp.rwa - cp.suggestedRwa)
    }
    return sum
  }, 0)

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <LightbulbIcon className="h-5 w-5 mr-2 text-amber-500" />
              EAD Optimization
            </CardTitle>
            <CardDescription>
              Optimize EAD values to reach target CET1 ratio of {formatPercentage(targetCet1Ratio)}
            </CardDescription>
          </div>
          {isTargetMet && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Target CET1 Ratio Met</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!isTargetMet && !hasSuggestions && !optimizationApplied && (
          <div className="flex items-start p-4 bg-amber-50 border border-amber-200 rounded-md">
            <AlertCircleIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">CET1 Ratio Adjustment Needed</h4>
              <p className="text-sm text-amber-700 mt-1">
                Your current CET1 ratio is {formatPercentage(currentCet1Ratio)}, which is above the target of{" "}
                {formatPercentage(targetCet1Ratio)}. Click "Generate Recommendations" to get suggested EAD reductions
                prioritized by counterparties with higher PD values.
              </p>
            </div>
          </div>
        )}

        {hasSuggestions && (
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-md">
              <LightbulbIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800">Optimization Recommendations</h4>
                <p className="text-sm text-blue-700 mt-1">
                  We've generated recommendations to reduce your EAD by {formatCurrency(totalEadReduction)}, which would
                  reduce RWA by {formatCurrency(totalRwaReduction)} and bring your CET1 ratio to{" "}
                  {formatPercentage(suggestedCet1Ratio)}.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Recommendations prioritize reducing exposure to counterparties with higher PD values first.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Total EAD Reduction</div>
                <div className="text-xl font-semibold text-green-600">-{formatCurrency(totalEadReduction)}</div>
              </div>
              <div className="bg-background p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Total RWA Reduction</div>
                <div className="text-xl font-semibold text-green-600">-{formatCurrency(totalRwaReduction)}</div>
              </div>
              <div className="bg-background p-4 rounded-md border">
                <div className="text-sm text-muted-foreground">Suggested CET1 Ratio</div>
                <div className="text-xl font-semibold">{formatPercentage(suggestedCet1Ratio)}</div>
              </div>
            </div>
          </div>
        )}

        {optimizationApplied && (
          <div className="flex items-start p-4 bg-green-50 border border-green-200 rounded-md">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-green-800">Optimization Applied</h4>
              <p className="text-sm text-green-700 mt-1">
                The recommended EAD adjustments have been applied. Your current CET1 ratio is now{" "}
                {formatPercentage(currentCet1Ratio)}.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {!hasSuggestions && !optimizationApplied && (
          <Button onClick={optimizeEadValues}>Generate Recommendations</Button>
        )}
        {hasSuggestions && (
          <>
            <Button variant="outline" onClick={clearOptimizedValues}>
              Clear Recommendations
            </Button>
            <Button onClick={applyOptimizedValues}>Apply Recommendations</Button>
          </>
        )}
      </CardFooter>
    </Card>
  )
}
