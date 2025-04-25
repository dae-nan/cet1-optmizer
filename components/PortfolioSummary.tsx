import { usePortfolioStore } from "@/store/usePortfolioStore"
import { formatPercentage, formatCurrency } from "@/utils/calculationUtils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PortfolioSummary() {
  const { counterparties, getTotalRwa } = usePortfolioStore()

  const totalRwa = getTotalRwa()
  const totalEad = counterparties.reduce((sum, cp) => sum + cp.ead, 0)
  const averagePd = counterparties.reduce((sum, cp) => sum + cp.pd, 0) / counterparties.length
  const averageLgd = counterparties.reduce((sum, cp) => sum + cp.lgd, 0) / counterparties.length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Exposure (EAD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalEad)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total RWA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalRwa)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average PD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(averagePd)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average LGD</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPercentage(averageLgd)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
