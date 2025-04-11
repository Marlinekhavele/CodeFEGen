'use client'
import { AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import UserProfileCard from '~/components/dashboard/UserProfileCard'
import { CodeBEgenLogo, Menu_bar } from '~/components/logo/logo'
import { ThemeToggle } from '~/components/shared/theme-toggle'
import { POSTHOG_EVENT_NAMES, sendPosthogEvent } from '~/lib/posthog'
import { useAuth } from '~/providers/user-auth'
import { cn } from '~/utils'
import { URLParameters } from '~/utils/constant'
import { NAV_LINKS } from './links'
import UseCaseDropdown from './use-case-dropdown'

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <>
      <nav className="bg-white py-5 dark:border-b dark:border-neutral-700 dark:bg-dark-blue">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-5">
          <div className="flex items-center justify-center gap-10">
            <CodeBEgenLogo className="text-black dark:text-white" />
            {pathname !== `/${URLParameters.CREATE_PROJECT}` && (
              <div className="text-base hidden space-x-10 text-black dark:text-white custom:flex">
                {NAV_LINKS.map((navItem, index) => {
                  return (
                    <Link
                      href={navItem.link}
                      key={index}
                      className={cn(
                        'text-sm text-black hover:text-secondary-400 dark:text-white',
                        {
                          'text-secondary-500': pathname === navItem.link,
                        }
                      )}
                      onClick={() => setIsModalOpen(false)}
                    >
                      {navItem.route}
                    </Link>
                  )
                })}
                <UseCaseDropdown
                  pathname={pathname}
                  setIsModalOpen={setIsModalOpen}
                />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="max-md:hidden">
                <UserProfileCard />
              </div>
            ) : (
              pathname !== `/${URLParameters.CREATE_PROJECT}` && (
                <div className="hidden items-center justify-center gap-5 font-medium md:flex">
                  <Link
                    href={URLParameters.WAITLIST}
                    className="rounded-lg border-2 border-secondary-500 px-6 py-2 text-sm text-secondary-500 transition-all duration-300 dark:border-white dark:text-white"
                    onClick={() =>
                      sendPosthogEvent(
                        POSTHOG_EVENT_NAMES.JOIN_WAITLIST_NAV_CLICK,
                        null
                      )
                    }
                  >
                    Join Now
                  </Link>
                </div>
              )
            )}
            {/* Mobile Menu Button */}
            {pathname !== `/${URLParameters.CREATE_PROJECT}` && (
              <div className="md:hidden" onClick={() => setIsModalOpen(true)}>
                <Menu_bar color="text-black dark:text-white" />
              </div>
            )}
          </div>
        </div>
      </nav>
      <AnimatePresence>
        <div
          className={`fixed top-0 z-50 h-full w-full max-w-[500px] overflow-auto border-r border-[#C0C0C1] bg-white px-8 py-7 text-black transition-all duration-1000 ease-in-out dark:bg-dark-blue dark:text-white sm:p-10 lg:hidden ${
            isModalOpen ? 'left-0' : 'left-[-100%]'
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <CodeBEgenLogo className="text-black dark:text-white" />
            <X
              size={20}
              className="transition-transform duration-300 ease-in-out hover:scale-110"
              onClick={() => setIsModalOpen(false)}
            />
          </div>

          {!user && (
            <div className="flex w-full flex-col gap-5 font-medium">
              <Link
                href={URLParameters.WAITLIST}
                className="max-sm:text-s rounded-lg border border-secondary-500 px-4 py-2.5 text-center text-secondary-500 transition-all duration-300 hover:shadow-lg dark:border-white dark:text-white max-sm:text-sm"
                onClick={() =>
                  sendPosthogEvent(
                    POSTHOG_EVENT_NAMES.JOIN_WAITLIST_NAV_CLICK,
                    null
                  )
                }
              >
                Join Now
              </Link>
            </div>
          )}

          {/* user details */}
          {user && (
            <div className="mt-5">
              <p>{user?.email}</p>
            </div>
          )}

          <div className="mt-5">
            <ul className="mb-5 flex flex-col gap-5 text-lg">
              {NAV_LINKS.map((navItem, index) => {
                return (
                  <li key={index}>
                    <Link
                      href={navItem.link}
                      className={cn(
                        'text-sm hover:text-secondary-600 md:text-md lg:text-lg',
                        {
                          'text-secondary-600': pathname === navItem.link,
                        }
                      )}
                      onClick={() => setIsModalOpen(false)}
                    >
                      {navItem.route}
                    </Link>
                  </li>
                )
              })}
            </ul>
            <UseCaseDropdown
              pathname={pathname}
              setIsModalOpen={setIsModalOpen}
            />
          </div>
          {user && <UserProfileCard />}
        </div>
      </AnimatePresence>
    </>
  )
}

export default Navbar
