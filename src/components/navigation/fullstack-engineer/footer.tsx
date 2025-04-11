'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CodeBEgenLogo } from '~/components/logo/logo'
import PaddingContainer from '~/components/shared/inline-padding'
import { cn } from '~/utils'
import { ENGINEER_FOOTER_LINKS } from '../engineer-footer-links'

const ExternalFooter = () => {
  const pathname = usePathname()

  return (
    <footer
      style={{ backgroundImage: "url('/footerBgDark.svg')" }}
      className="relative bg-cover bg-center bg-no-repeat px-3 py-[63px] text-[#C9C9CB] after:absolute after:left-0 after:top-0 after:-z-20 after:h-full after:w-full after:bg-black lg:px-0"
    >
      <PaddingContainer>
        <div className="max:gap-16 mx-auto flex max-w-[1200px] flex-col gap-8 lg:gap-16">
          {/* Logo Section */}
          <CodeBEgenLogo className="mr-10 text-[#9098A0]" />
          <div className="flex flex-col justify-between gap-10 lg:flex-row">
            <div className="flex max-w-lg flex-col gap-8 sm:flex-row sm:justify-between lg:w-fit lg:gap-12 xl:gap-[70px]">
              {ENGINEER_FOOTER_LINKS.map((footer, index) => {
                return (
                  <div
                    className="flex flex-col gap-6 text-sm"
                    key={`${footer.title}-${index}`}
                  >
                    <h3 className="font-medium">{footer.title}</h3>
                    <ul className="space-y-2">
                      {footer.routes.map((route, index) => (
                        <>
                          <li key={index}>
                            <Link
                              href={route.link}
                              className={cn(
                                'hover:font-bold hover:text-secondary-300',
                                {
                                  'font-bold text-secondary-300':
                                    pathname === route.link,
                                }
                              )}
                            >
                              {route.route}
                            </Link>
                          </li>
                        </>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
            <div className="flex max-w-[296px] flex-col gap-[34px] max-sm:max-w-[200px]">
              <p className="text-md font-medium text-[#E2E2EC] md:text-lg lg:text-display-xs">
                Ready to generate Backend?
              </p>
              <div className="flex flex-col gap-6">
                <Link
                  href="/create-backend"
                  className="rounded-lg border border-neutral-500 bg-neutral-600 py-3 text-center text-white hover:bg-neutral-600 hover:text-[#C0C0C1]"
                >
                  Generate Backend
                </Link>
                <Link
                  href="#"
                  className="rounded-lg border border-neutral-700 py-3 text-center hover:bg-primary hover:text-white"
                >
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PaddingContainer>
    </footer>
  )
}

export default ExternalFooter
