'use client'
import { useState } from 'react'
import { IoIosArrowForward } from 'react-icons/io'
import { IoIosArrowBack } from 'react-icons/io'
import Image from 'next/image'

interface Item {
  img: string
  author: string
  role: string
  quote: string
}

const testimonials: Item[] = [
  {
    img: '/images/auth/wafa.png',
    author: 'Faith Moore',
    role: 'Frontend Developer',
    quote:
      'CodeBEGen took the complexity out of backend development! I went from zero to a working API in minutes-no backend expertise needed.',
  },
  {
    img: '/images/auth/emerson.png',
    author: 'Emerson Annies',
    role: 'Startup Founder',
    quote:
      'As a startup founder, I needed a fast and reliable backend. CodeBEGen generated, tested, and deployed everything seamlessly-huge time-saver!',
  },
  {
    img: '/images/auth/gretchen.png',
    author: 'Henrietta Onoge',
    role: 'Full-Stack Developer',
    quote:
      'The AI-driven backend generation and auto-testing blew my mind! I focus on frontend while CodeBEGen handles the heavy lifting. Lovely job it does!',
  },
  {
    img: '/images/auth/livia.png',
    author: 'Livia Marline',
    role: 'Software Engineer',
    quote:
      'CodeBEGen simplifies backend creation, making it efforless to generate, test, and deploy APIs. The automated debugging and seamless workflow save me hours of work!',
  },
]

const AuthTestimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  const handlePrev = () => {
    setCurrentIndex(
      (currentIndex + testimonials.length - 1) % testimonials.length
    )
  }

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % testimonials.length)
  }

  return (
    <div className="flex h-screen flex-col items-baseline rounded-br-[30px] rounded-tr-[30px] bg-secondary-500 p-4 text-center text-white max-lg:hidden lg:max-w-[546px]">
      <div className="mx-auto flex h-full flex-col items-center justify-center gap-6">
        <div className="flex flex-col items-center">
          <Image
            src={testimonials[currentIndex].img}
            width="64"
            height="64"
            alt={testimonials[currentIndex].author}
            className=""
          />
          <p className="text-xl leading-[30px]">
            {testimonials[currentIndex].author}
          </p>
          <p className="text-lg leading-[28px]">
            {testimonials[currentIndex].role}
          </p>
        </div>
        <p className="text-display-xs leading-[32px]">
          {testimonials[currentIndex].quote}
        </p>
        <div className="flex items-center justify-center gap-16">
          <button onClick={handlePrev} className="h-9 w-9 text-neutral-50">
            <IoIosArrowBack />
          </button>
          <div className="flex gap-4">
            {testimonials.map((item, index) => (
              <div
                key={item.author}
                className={`inline-block h-2.5 w-2.5 rounded-full bg-[#D9D9D9] opacity-[0.5] ${
                  currentIndex === index && 'opacity-[1]'
                }`}
              ></div>
            ))}
          </div>
          <button onClick={handleNext} className="h-9 w-9 text-neutral-50">
            <IoIosArrowForward />
          </button>
        </div>
      </div>
      <div className="flex w-full justify-between pb-4">
        <div className="inline-flex items-center gap-1 pl-2">
          <Image
            src="/images/auth/copyright.svg"
            width="20"
            height="20"
            alt="copyright logo"
          />
          <p>CodeBEGen 2025</p>
        </div>
      </div>
    </div>
  )
}

export default AuthTestimonials
