'use client'

import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '~/components/ui/dialog'
import { Button } from '~/components/ui/button'

interface LogoutConfirmationProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
  error: string
}

export function LogoutConfirmation({
  open,
  onClose,
  onConfirm,
  isLoading,
  error,
}: LogoutConfirmationProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-lg bg-white p-6 shadow-lg">
        <DialogHeader className="flex justify-between">
          <DialogTitle className="flex items-center text-lg font-medium">
            <AlertTriangle className="mr-2 h-6 w-6 text-error-300" />
            Do you want to logout?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="mt-2 flex flex-col gap-2 text-sm text-neutral-400">
          You&#39;ll need to login again to continue. Make sure your work is
          saved.
          <span className="mt-2 text-xs font-medium text-error-300">
            {error && 'Sorry! unable to logout, please retry later?'}
          </span>
        </DialogDescription>
        <Button
          onClick={onConfirm}
          variant="outline"
          className="w-full border-error-300 text-error-300 hover:bg-error-300 hover:text-white"
          isLoading={isLoading}
        >
          {!isLoading ? 'Logout' : 'Logging out'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
