"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MigrationButtonProps {
  onRunMigrations: () => void
  hasPendingMigrations: boolean
  isLoading?: boolean
}

export function MigrationButton({ onRunMigrations, hasPendingMigrations, isLoading = false }: MigrationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  if (!hasPendingMigrations) {
    return null
  }

  const handleConfirm = () => {
    setIsDialogOpen(false)
    onRunMigrations()
  }

  return (
    <>
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          size="lg"
          onClick={() => setIsDialogOpen(true)}
          className="rounded-full h-14 w-14 bg-[#7dff00] text-black hover:bg-[#9aff33] shadow-lg flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-black border-t-transparent" />
          ) : (
            <Database className="h-6 w-6" />
          )}
        </Button>
        {hasPendingMigrations && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            !
          </span>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Run Database Migrations
            </DialogTitle>
            <DialogDescription>
              This will apply all pending database migrations to your project. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-md text-sm">
            <p className="text-amber-800 dark:text-amber-300">
              Running migrations will modify your database schema. Make sure you have a backup of your data before
              proceeding.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-[#7dff00] text-black hover:bg-[#9aff33]" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  Running...
                </>
              ) : (
                "Run Migrations"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
