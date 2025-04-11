'use client'

import { useEffect, useState } from 'react'

const RedirectSpinner = () => {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : '.'))
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white">
      {/* SVG Spinner */}
      <svg
        width="150"
        height="150"
        viewBox="-60 -75 125 125"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform="translate(50,50)">
          <line
            x1="0"
            y1="-40"
            x2="0"
            y2="-20"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="1"
          />
          <line
            x1="0"
            y1="-40"
            x2="0"
            y2="-20"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.85"
            transform="rotate(45)"
          />
          <line
            x1="0"
            y1="-40"
            x2="0"
            y2="-20"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.7"
            transform="rotate(90)"
          />
          <line
            x1="0"
            y1="-40"
            x2="0"
            y2="-20"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.55"
            transform="rotate(135)"
          />
          <line
            x1="0"
            y1="-40"
            x2="0"
            y2="-20"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.4"
            transform="rotate(180)"
          />
          <line
            x1="0"
            y1="-40"
            x2="0"
            y2="-20"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.25"
            transform="rotate(225)"
          />
          <line
            x1="0"
            y1="-40"
            x2="0"
            y2="-20"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.1"
            transform="rotate(270)"
          />
          <line
            x1="0"
            y1="-40"
            x2="0"
            y2="-20"
            stroke="black"
            strokeWidth="10"
            strokeLinecap="round"
            strokeOpacity="0.05"
            transform="rotate(315)"
          />

          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0"
            to="360"
            dur="1s"
            repeatCount="indefinite"
          />
        </g>
      </svg>

      <p className="text-gray-600 mt-4 text-lg font-medium">
        Redirecting{dots}
      </p>
    </div>
  )
}

export default RedirectSpinner
