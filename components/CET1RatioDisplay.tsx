import { usePortfolioStore } from "@/store/usePortfolioStore"
import { formatPercentage, formatCurrency } from "@/utils/calculationUtils"
import { Progress } from "@/components/ui/progress"

export default function CET1RatioDisplay() {
  const { cet1Capital, getTotalRwa, getCurrentCet1Ratio, initialCet1Ratio, targetCet1Ratio, counterparties } =
    usePortfolioStore()

  const totalRwa = getTotalRwa()
  const currentCet1Ratio = getCurrentCet1Ratio()

  // Calculate original RWA for comparison
  const originalTotalRwa = counterparties.reduce((sum, cp) => sum + (cp.originalRwa || cp.rwa), 0)
  const originalCet1Ratio = originalTotalRwa > 0 ? cet1Capital / originalTotalRwa : initialCet1Ratio

  // Calculate changes
  const rwaChange = totalRwa - originalTotalRwa
  const ratioChange = currentCet1Ratio - originalCet1Ratio

  // Calculate progress percentage for the progress bar
  const progressPercentage = Math.min(100, Math.max(0, (currentCet1Ratio / initialCet1Ratio) * 100))

  // Determine color based on ratio compared to target
  const getStatusColor = () => {
    if (currentCet1Ratio >= initialCet1Ratio) return "bg-green-500"
    if (currentCet1Ratio >= targetCet1Ratio) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">CET1 Ratio</h2>
          <p className="text-muted-foreground">Capital adequacy measurement</p>
        </div>
        <div className="mt-2 md:mt-0 text-right">
          <div className="flex items-center justify-end">
            <div className="text-4xl font-bold">{formatPercentage(currentCet1Ratio)}</div>
            {ratioChange !== 0 && (
              <span className={`ml-2 text-sm ${ratioChange > 0 ? "text-green-600" : "text-red-600"}`}>
                ({ratioChange > 0 ? "+" : ""}
                {formatPercentage(ratioChange)})
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Target: {formatPercentage(targetCet1Ratio)} | Initial: {formatPercentage(initialCet1Ratio)}
          </div>
        </div>
      </div>

      <Progress value={progressPercentage} className="h-2 mb-4" indicatorClassName={getStatusColor()} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-background p-4 rounded-md">
          <div className="text-sm text-muted-foreground">CET1 Capital</div>
          <div className="text-xl font-semibold">{formatCurrency(cet1Capital)}</div>
        </div>
        <div className="bg-background p-4 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total RWA</div>
            {rwaChange !== 0 && (
              <span className={`text-xs ${rwaChange < 0 ? "text-green-600" : "text-red-600"}`}>
                {rwaChange < 0 ? "-" : "+"}
                {formatCurrency(Math.abs(rwaChange))}
              </span>
            )}
          </div>
          <div className="text-xl font-semibold">{formatCurrency(totalRwa)}</div>
        </div>
      </div>
    </div>
  )
}
