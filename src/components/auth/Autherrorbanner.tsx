'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface AuthErrorBannerProps {
  show: boolean
  onClose?: () => void
  duration?: number
  showClose?: boolean
}

const Autherrorbanner: React.FC<AuthErrorBannerProps> = ({
  show,
  onClose,
  duration = 3000,
  showClose,
}) => {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, onClose, duration])

  if (!visible) return null

  return (
    <div className="fixed left-0 top-0 z-50 flex h-[65px] w-full flex-shrink-0 items-center justify-center gap-2.5 bg-error-300 p-2.5 text-white">
      <p>Failed to authorise! Please try again later</p>
      {showClose && (
        <button
          onClick={() => {
            setVisible(false)
            onClose?.()
          }}
          className="hover:text-gray-200 text-white"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

export default Autherrorbanner
