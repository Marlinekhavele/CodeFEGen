'use client'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { CodeBEgenLogo, Menu_bar } from '~/components/logo/logo'
import PaddingContainer from '~/components/shared/inline-padding'
import { X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { URLParameters } from '~/utils/constant'
import { generateUserInitials } from '~/utils'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { useAuth } from '~/providers/user-auth'

const ExternalNavbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <>
      <PaddingContainer>
        <nav className="shadow- mad-md:shadow-[0px_2px_4px_0px_rgba(211,211,211,0.5)] mx-auto my-[18px] flex w-full max-w-[1200px] items-center justify-between">
          <div className="flex items-center justify-center gap-10">
            <CodeBEgenLogo />
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Avatar className="flex cursor-pointer items-center justify-center bg-secondary-100">
                <AvatarFallback className="bg-secondary-100">
                  {user && generateUserInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              pathname !== `/${URLParameters.CREATE_PROJECT}` && (
                <div className="hidden items-center justify-center gap-4 font-semibold md:flex">
                  <Link href="/login">
                    <Button
                      variant="secondary"
                      className="w-[100px] border-primary px-5 py-1.5"
                      containerClass="w-fit"
                    >
                      <span>Login</span>
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      variant="primary"
                      className="w-[100px] px-5 py-1.5"
                      containerClass="w-fit"
                    >
                      <span>Signup</span>
                    </Button>
                  </Link>
                </div>
              )
            )}
            {/* Mobile Menu Button */}
            {pathname !== `/${URLParameters.CREATE_PROJECT}` && (
              <div className="md:hidden" onClick={() => setIsModalOpen(true)}>
                <Menu_bar />
              </div>
            )}
          </div>
        </nav>
      </PaddingContainer>
      <AnimatePresence>
        <div
          className={`fixed top-0 z-50 h-full w-full max-w-[500px] overflow-auto border-r border-[#C0C0C1] bg-white px-8 py-7 text-[#16161A] transition-all duration-1000 ease-in-out sm:p-10 lg:hidden ${
            isModalOpen ? 'left-0' : 'left-[-100%]'
          }`}
        >
          <div className="mb-10 flex items-center justify-between">
            <CodeBEgenLogo />
            <X
              size={20}
              className="transition-transform duration-300 ease-in-out hover:scale-110"
              onClick={() => setIsModalOpen(false)}
            />
          </div>
          <div className="flex flex-col gap-4 font-semibold md:hidden">
            <Link href="/login">
              <Button
                variant="secondary"
                className="w-[100px] border-primary px-5 py-1.5"
                containerClass="w-fit"
              >
                <span>Login</span>
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="primary"
                className="w-[100px] px-5 py-1.5"
                containerClass="w-fit"
              >
                <span>Signup</span>
              </Button>
            </Link>
          </div>
        </div>
      </AnimatePresence>
    </>
  )
}

export default ExternalNavbar
