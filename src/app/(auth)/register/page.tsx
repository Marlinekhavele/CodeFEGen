'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'
import Autherrorbanner from '~/components/auth/Autherrorbanner'
import AuthTestimonials from '~/components/auth/AuthTestimonials'
import { CodeBEgenLogo } from '~/components/logo/logo'
import AnimatedSection from '~/components/shared/AnimatedSection'
import { Button } from '~/components/ui/button'
import { getBackendGoogleAuthUrl } from '~/utils'

const Register = () => {
  const showErrorBanner = useSearchParams().get('showError')
  const registerUser = () => {
    window.location.assign(getBackendGoogleAuthUrl())
  }
  return (
    <>
      <Autherrorbanner
        show={showErrorBanner === 'true'}
        showClose={false}
        duration={3000}
      />
      <div className="relative flex h-screen">
        <AuthTestimonials />
        <div className="absolute left-0 top-0 p-4">
          <CodeBEgenLogo className="text-white" />
        </div>

        <div className="relative flex flex-1 flex-col-reverse items-center justify-end p-5 lg:justify-center">
          <p className="right-0 top-0 p-4 lg:absolute">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-secondary-400 underline"
            >
              Log in
            </Link>
          </p>
          <AnimatedSection>
            <div className="flex flex-col items-center gap-8 max-lg:mt-24">
              <div className="flex flex-col items-center gap-4 sm:max-w-[530px]">
                <h1 className="text-center text-display-md font-medium leading-[44px] tracking-[-0.72px]">
                  Sign Up -{' '}
                  <span className="text-secondary-500">
                    Build smarter backends in no time.
                  </span>
                </h1>
                <p className="text-center text-lg leading-[28px] text-neutral-500">
                Smarter backend code, faster development. Join now and supercharge your workflow!
                </p>
              </div>
              <Button
                name="action"
                variant="secondary"
                icon={FcGoogle}
                iconSize={24}
                className="w-full hover:shadow-md"
                onClick={registerUser}
                containerClass="w-full"
              >
                Sign up with Google
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </>
  )
}

export default Register
