'use client'
import { useEffect } from 'react'

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
    }

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[350px] rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Delete endpoint?</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-600 mb-4 text-sm">
          Are you sure you want to delete this endpoint?
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-700 hover:bg-gray-100 rounded-md border px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="hover:bg-gray-800 rounded-md bg-black px-4 py-2 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
