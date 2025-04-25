"use client"

import type React from "react"

import { useState } from "react"
import type { Counterparty } from "@/types"
import { formatPercentage, formatCurrency } from "@/utils/calculationUtils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { ArrowDownIcon, ArrowUpIcon, UndoIcon, ArrowRightIcon, CheckIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CounterpartyTableProps {
  counterparties: Counterparty[]
  showSuggestions?: boolean
}

export default function CounterpartyTable({ counterparties, showSuggestions = true }: CounterpartyTableProps) {
  const { updateCounterpartyEad, resetCounterparty, resetAllCounterparties, sortCounterpartiesByPd } =
    usePortfolioStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState<string>("")
  const [sortByPd, setSortByPd] = useState<boolean>(false)

  // Get sorted counterparties if needed
  const displayCounterparties = sortByPd ? sortCounterpartiesByPd() : counterparties

  const handleSliderChange = (id: string, values: number[]) => {
    const newEad = values[0]
    updateCounterpartyEad(id, newEad)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = (id: string) => {
    const newEad = Number.parseFloat(inputValue)
    if (!isNaN(newEad) && newEad >= 0) {
      updateCounterpartyEad(id, newEad)
    }
    setEditingId(null)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter") {
      handleInputBlur(id)
    } else if (e.key === "Escape") {
      setEditingId(null)
    }
  }

  const startEditing = (id: string, currentEad: number) => {
    setEditingId(id)
    setInputValue(currentEad.toString())
  }

  const getEadChangePercentage = (current: number, original: number | undefined) => {
    if (!original || original === 0) return 0
    return ((current - original) / original) * 100
  }

  const toggleSortByPd = () => {
    setSortByPd(!sortByPd)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Counterparty Portfolio</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={toggleSortByPd}>
            {sortByPd ? "Default Sort" : "Sort by PD (High to Low)"}
          </Button>
          <Button variant="outline" size="sm" onClick={resetAllCounterparties}>
            <UndoIcon className="h-4 w-4 mr-2" />
            Reset All EADs
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>PD</TableHead>
              <TableHead>LGD</TableHead>
              <TableHead className="w-[300px]">EAD</TableHead>
              <TableHead>RWA</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayCounterparties.map((counterparty) => {
              const eadChangePercent = getEadChangePercentage(counterparty.ead, counterparty.originalEad)
              const isEadReduced = eadChangePercent < 0
              const isEadIncreased = eadChangePercent > 0
              const maxEad = counterparty.originalEad ? counterparty.originalEad * 2 : counterparty.ead * 2

              // Calculate suggested EAD change percentage
              const suggestedEadChangePercent = counterparty.suggestedEad
                ? getEadChangePercentage(counterparty.suggestedEad, counterparty.ead)
                : 0

              // Determine if this is a high PD counterparty (top 30%)
              const isHighPd = sortCounterpartiesByPd()
                .slice(0, 3)
                .some((cp) => cp.id === counterparty.id)

              return (
                <TableRow key={counterparty.id} className={isHighPd ? "bg-amber-50" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {counterparty.name}
                      {isHighPd && <Badge className="ml-2 bg-amber-500">High PD</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{formatPercentage(counterparty.pd)}</TableCell>
                  <TableCell>{formatPercentage(counterparty.lgd)}</TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {editingId === counterparty.id ? (
                          <Input
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={() => handleInputBlur(counterparty.id)}
                            onKeyDown={(e) => handleInputKeyDown(e, counterparty.id)}
                            className="w-24"
                            autoFocus
                          />
                        ) : (
                          <div
                            className="cursor-pointer hover:underline"
                            onClick={() => startEditing(counterparty.id, counterparty.ead)}
                          >
                            {formatCurrency(counterparty.ead)}
                          </div>
                        )}
                        {counterparty.originalEad !== undefined && counterparty.ead !== counterparty.originalEad && (
                          <div className="flex items-center text-sm">
                            {isEadReduced ? (
                              <span className="text-green-600 flex items-center">
                                <ArrowDownIcon className="h-3 w-3 mr-1" />
                                {Math.abs(eadChangePercent).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-red-600 flex items-center">
                                <ArrowUpIcon className="h-3 w-3 mr-1" />
                                {eadChangePercent.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Show suggested EAD if available */}
                      {showSuggestions && counterparty.suggestedEad !== undefined && (
                        <div className="flex items-center text-sm text-blue-600 mb-1">
                          <ArrowRightIcon className="h-3 w-3 mr-1" />
                          <span>Suggested: {formatCurrency(counterparty.suggestedEad)}</span>
                          <span className="ml-1">({Math.abs(suggestedEadChangePercent).toFixed(1)}% reduction)</span>
                        </div>
                      )}

                      <Slider
                        defaultValue={[counterparty.ead]}
                        min={0}
                        max={maxEad}
                        step={10000}
                        value={[counterparty.ead]}
                        onValueChange={(values) => handleSliderChange(counterparty.id, values)}
                        className="w-full"
                      />
                      {counterparty.originalEad !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          Original: {formatCurrency(counterparty.originalEad)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {formatCurrency(counterparty.rwa)}
                      {counterparty.originalRwa !== undefined && counterparty.rwa !== counterparty.originalRwa && (
                        <div className="text-xs">
                          {counterparty.rwa < counterparty.originalRwa ? (
                            <span className="text-green-600">
                              -{formatCurrency(counterparty.originalRwa - counterparty.rwa)}
                            </span>
                          ) : (
                            <span className="text-red-600">
                              +{formatCurrency(counterparty.rwa - counterparty.originalRwa)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Show suggested RWA if available */}
                      {showSuggestions && counterparty.suggestedRwa !== undefined && (
                        <div className="text-xs text-blue-600">
                          Suggested: {formatCurrency(counterparty.suggestedRwa)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {counterparty.originalEad !== undefined && counterparty.ead !== counterparty.originalEad && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resetCounterparty(counterparty.id)}
                          className="h-8 w-8 p-0"
                        >
                          <UndoIcon className="h-4 w-4" />
                          <span className="sr-only">Reset</span>
                        </Button>
                      )}

                      {showSuggestions && counterparty.suggestedEad !== undefined && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateCounterpartyEad(counterparty.id, counterparty.suggestedEad!)}
                          className="h-8 w-8 p-0 text-blue-600"
                          title="Apply suggested EAD"
                        >
                          <CheckIcon className="h-4 w-4" />
                          <span className="sr-only">Apply suggestion</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
