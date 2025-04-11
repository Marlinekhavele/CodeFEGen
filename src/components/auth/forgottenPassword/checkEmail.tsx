'use client'
import { useEffect, useState } from 'react'
import { GmailSVG } from '~/components/logo/logo'
import Logger from '~/utils/logger'

const CheckEmail: React.FC = () => {
  const [email, setEmail] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(150) // 2 min 30 sec (150 seconds)
  const [resendDisabled, setResendDisabled] = useState(true)

  useEffect(() => {
    // Option 1: Get email from local storage
    const storedEmail = localStorage.getItem('userEmail')
    // const auth = getAuth();
    // const user = auth.currentUser;
    // const storedEmail = user?.email || null;

    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      Logger.warn('No email found in storage!')
    }
  }, [])

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setResendDisabled(false)
    }
  }, [timeLeft])

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
  }

  const handleResend = () => {
    setTimeLeft(150)
    setResendDisabled(true)
    Logger.log('Resending email to:', email)
    // actual email resend logic here
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 text-center">
        <div className="flex justify-center">
          <GmailSVG />
        </div>
        <h2 className="text-2xl mt-3 font-bold">Check your email</h2>
        {email ? (
          <p className="mt-2 text-sm text-[#5C5C5E]">
            Please check the email address <strong>{email}</strong> for
            instructions to reset your password.
          </p>
        ) : (
          <p className="text-red-500 mt-2 text-sm">No email found!</p>
        )}
        <button
          onClick={handleResend}
          disabled={resendDisabled}
          className={`mt-4 w-full rounded-md p-2 ${
            resendDisabled
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:opacity-90'
          }`}
        >
          {resendDisabled ? (
            <>
              Resend Mail <span className="text-blue-500">{formatTime()}</span>
            </>
          ) : (
            'Resend Mail'
          )}
        </button>
      </div>
    </div>
  )
}

export default CheckEmail
