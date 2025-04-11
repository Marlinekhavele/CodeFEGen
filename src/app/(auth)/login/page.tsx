'use client'

import Image from 'next/image'
import { FcGoogle } from 'react-icons/fc'
import { CodeBEgenLogo } from '~/components/logo/logo'
import AnimatedSection from '~/components/shared/AnimatedSection'
import { Button } from '~/components/ui/button'
import { getBackendGoogleAuthUrl } from '~/utils'

const Login = () => {
  const loginUser = () => {
    window.location.assign(getBackendGoogleAuthUrl())
  }

  return (
    <div className="flex h-screen">
      <div className="relative flex max-h-screen max-lg:hidden">
        <Image
          src="/images/auth/login-illustration.jpg"
          className="flex flex-shrink"
          alt="login illustration"
          height={1200}
          width={600}
        />
        <div className="absolute bottom-6 flex w-full justify-between p-8 pb-4 text-white">
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
      <div className="relative flex flex-1 flex-col items-center p-5 lg:justify-center">
        <div className="absolute top-0 p-4 max-lg:left-0 lg:right-0">
          <CodeBEgenLogo className="max-lg:hidden" />
        </div>

        <AnimatedSection>
          <div className="flex flex-col items-center gap-8 max-lg:mt-24">
            <div className="flex max-w-[530px] flex-col items-center gap-4 sm:w-[530px]">
              <h1 className="text-center text-display-md font-medium leading-[44px] tracking-[-0.72px]">
                Welcome Back!
              </h1>
              <p className="text-center text-lg leading-[28px] text-neutral-500">
                Jump back into your backend projects! Log in to build, 
                manage, and scale your APIs—effortlessly
              </p>
            </div>
            <Button
              name="action"
              variant="secondary"
              icon={FcGoogle}
              iconSize={24}
              className="w-full hover:shadow-md"
              onClick={loginUser}
              containerClass="w-full"
            >
              Login with Google
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}

export default Login
