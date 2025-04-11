'use client'

import { useParams } from 'next/navigation'
import type React from 'react'
import type { ReactNode } from 'react'
import { FcGoogle } from 'react-icons/fc'
import { getBackendGoogleAuthUrl } from '~/utils'

interface GoogleAuthButtonProps {
  text: string | ReactNode
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ text }) => {
  const { projectId } = useParams() as { projectId: string }

  const registerUser = () => {
    window.location.assign(getBackendGoogleAuthUrl(projectId))
  }

  return (
    <button
      type="submit"
      onClick={registerUser}
      name="action"
      value="google"
      aria-label="auth-button"
      className="flex w-full items-center justify-center gap-3 rounded-md border border-neutral-100 px-4 py-2.5 font-medium leading-6 shadow-md transition-all hover:bg-primary hover:text-white hover:shadow-md dark:border-neutral-800 dark:bg-primary dark:text-white dark:hover:bg-neutral-700"
    >
      <FcGoogle className="size-6" />
      {text}
    </button>
  )
}

export default GoogleAuthButton
