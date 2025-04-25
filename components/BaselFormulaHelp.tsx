"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HelpCircleIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

export default function BaselFormulaHelp() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-8">
      <CardHeader
        className="flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center">
          <HelpCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
          Basel 3.1 Formula Reference
        </CardTitle>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="text-sm">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">CET1 Ratio Calculation</h3>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="font-mono">CET1 Ratio = CET1 Capital / Total RWA</p>
              </div>
              <p className="mt-2 text-muted-foreground">
                The CET1 ratio is a measure of a bank's core equity capital compared to its risk-weighted assets. Basel
                III requires banks to maintain a minimum CET1 ratio of 4.5%, with additional buffers.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Risk-Weighted Assets (RWA) Calculation</h3>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="font-mono">RWA = K × 12.5 × EAD</p>
                <p className="font-mono mt-2">where K = PD × LGD (simplified)</p>
              </div>
              <p className="mt-2 text-muted-foreground">
                In this simplified model, K represents the capital requirement factor, which is calculated as the
                product of Probability of Default (PD) and Loss Given Default (LGD). The factor 12.5 is used to convert
                the capital requirement to a risk-weighted asset amount (it's the reciprocal of the 8% minimum capital
                requirement).
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Full Basel 3.1 Formula for K</h3>
              <div className="bg-gray-100 p-3 rounded-md overflow-x-auto">
                <p className="font-mono">
                  K = LGD × N[(1 - R)^(-0.5) × G(PD) + (R / (1 - R))^(0.5) × G(0.999)] - PD × LGD
                </p>
                <p className="font-mono mt-2">where:</p>
                <ul className="list-disc pl-6 mt-1 font-mono">
                  <li>N = Cumulative distribution function of standard normal distribution</li>
                  <li>G = Inverse cumulative distribution function of standard normal distribution</li>
                  <li>R = Asset correlation, typically a function of PD</li>
                </ul>
              </div>
              <p className="mt-2 text-muted-foreground">
                The full Basel formula for K is more complex and includes correlation factors and statistical
                distributions. In Basel 3.1, there are additional adjustments for maturity, size of the counterparty,
                and other factors. For simplicity, this application uses the approximation K = PD × LGD.
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                Note: This is a simplified implementation for educational purposes. Real Basel 3.1 calculations involve
                additional parameters and adjustments. Always refer to official Basel Committee on Banking Supervision
                documentation for regulatory compliance.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
