"use client"

import { useState } from "react"
import { usePortfolioStore } from "@/store/usePortfolioStore"
import { Button } from "@/components/ui/button"
import { RefreshCwIcon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ResetSimulationButton() {
  const { resetSimulation } = usePortfolioStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleReset = () => {
    resetSimulation()
    setIsDialogOpen(false)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="flex items-center">
        <RefreshCwIcon className="h-4 w-4 mr-2" />
        Reset Simulation
      </Button>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Simulation</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new set of random counterparties with fresh PD, LGD, and EAD values. All current
              changes and optimizations will be lost. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
