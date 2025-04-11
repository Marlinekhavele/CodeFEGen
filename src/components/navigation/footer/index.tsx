'use client'

import React from 'react'
import { CodeBEgenLogo } from '~/components/logo/logo'
import Link from 'next/link'
import Image from 'next/image'
import { FOOTER_LINKS } from './links'
import { usePathname } from 'next/navigation'
import { cn } from '~/utils'
import { URLParameters } from '~/utils/constant'

const Footer = () => {
  const pathname = usePathname()

  return (
    <footer className="bg-primary py-10">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-0 md:px-4 xl:px-24">
        <div className="grid text-neutral-400 lg:grid-cols-2">
          <div className="space-y-6">
            <CodeBEgenLogo className="mr-10 text-white" />

            <p className="text-md md:w-3/5">
              CodeBEGen helps developers generate and manage backend code with
              the power of AI, making development faster and more efficient.
            </p>

            <div className="space-x-4">
              <Link target="_blank" href={URLParameters.LINKEDIN}>
                <Image
                  src="/home/linkedIn.svg"
                  width={24}
                  height={24}
                  alt="CodeBEGen LinkedIn"
                  className="inline-block"
                />
              </Link>
              <Link target="_blank" href={URLParameters.YOUTUBE}>
                <Image
                  src="/home/youtube.svg"
                  width={28}
                  height={28}
                  alt="CodeBEGen Youtube"
                  className="inline-block"
                />
              </Link>
              <Link target="_blank" href={URLParameters.TIKTOK}>
                <Image
                  src="/home/tiktok.svg"
                  width={24}
                  height={24}
                  alt="CodeBEGen Tiktok"
                  className="inline-block"
                />
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-10 sm:mt-6 lg:flex-row lg:gap-24 lg:justify-self-end">
            {FOOTER_LINKS.map((links, index) => (
              <div className="space-y-5" key={`${links.title}-${index}`}>
                <h3 className="mb-2 text-lg font-medium text-white">
                  {links.title}
                </h3>
                <ul className="space-y-2 text-sm text-neutral-400">
                  {links.routes.map((route, index) => (
                    <li key={`${route.link}-${index}`}>
                      <Link
                        href={route.link}
                        className={cn('hover:text-secondary-400', {
                          'text-secondary-400': pathname === route.link,
                        })}
                      >
                        {route.route}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <hr className="mt-6 text-neutral-400" />

        <div className="mt-4">
          <h4 className="text-left text-sm font-normal text-neutral-400 lg:text-center">
            {' '}
            &copy; 2025 CodeBEGen. All rights reserved.
          </h4>
        </div>
      </div>
    </footer>
  )
}

export default Footer
