'use client'
import { useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

const NewPassword: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation checks
  const isValidLength = password.length >= 8
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const passwordsMatch = password === confirmPassword

  const isFormValid = isValidLength && hasSpecialChar && passwordsMatch

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md p-6">
        <h2 className="text-4xl text-center font-medium">Set a new password</h2>

        <div className="mt-4">
          <label
            htmlFor="new-password"
            className="text-gray-700 block font-medium"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus:ring-gray-500 w-full rounded-md border p-2 focus:outline-none focus:ring-2"
              placeholder="Enter your new password"
            />
            <button
              type="button"
              className="text-gray-500 absolute right-3 top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="confirm-password"
            className="text-gray-700 block font-medium"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="focus:ring-gray-500 w-full rounded-md border p-2 focus:outline-none focus:ring-2"
              placeholder="Re-enter your new password"
            />
            <button
              type="button"
              className="text-gray-500 absolute right-3 top-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Password validation messages */}
        <div className="mt-2 text-sm">
          <p className={isValidLength ? 'text-green-600' : 'text-red-500'}>
            ✔ Must be at least 8 characters
          </p>
          <p className={hasSpecialChar ? 'text-green-600' : 'text-red-500'}>
            ✔ Must have a special character
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          className={`mt-6 w-full rounded-md p-3 text-white ${
            isFormValid
              ? 'bg-black hover:opacity-90'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={!isFormValid}
        >
          Verify & Continue
        </button>
      </div>
    </div>
  )
}

export default NewPassword
