'use client'
import { useState } from 'react'
import { FaEnvelope } from 'react-icons/fa'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [buttonText, setButtonText] = useState('Reset Password')

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    setButtonText(value ? 'Send reset instructions' : 'Reset Password')

    if (!value) {
      setError('Input Your Email')
    } else if (!validateEmail(value)) {
      setError('Enter a valid email address')
    } else {
      setError('')
    }
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email before submitting.')
      return
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md bg-white p-6">
        <h2 className="text-2xl text-center font-medium">Forgot Password</h2>
        <p className="mt-1 text-center text-sm font-normal text-[#5C5C5E]">
          Please enter your email address to reset your password
        </p>
        <form onSubmit={handleResetPassword} className="mt-4">
          <label className="block text-sm font-medium">Email</label>
          <div className="relative mt-1">
            <FaEnvelope className="text-gray-400 absolute left-3 top-3" />
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Your email address"
              className={`w-full rounded-md border p-2 pl-10 outline-none focus:ring ${
                error ? 'border-red-500' : 'border-gray-200'
              }`}
              required
            />
          </div>
          {error && <p className="text-red-500 mt-1 text-xs">{error}</p>}
          <button
            type="submit"
            className={`mt-4 w-full rounded-md p-2 ${
              error || !email
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:opacity-90'
            }`}
            disabled={!!error || !email}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
