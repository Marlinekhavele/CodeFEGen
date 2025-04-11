import React from 'react'
import TermsList from './terms-list'

const TermsAndConditions = () => {
  return (
    <section className="w-full bg-white py-20 dark:bg-[#03001A] dark:text-white">
      <div className="mx-auto h-auto w-full max-w-[1440px] px-5 md:px-5 lg:px-2">
        <p className="mx-auto w-fit rounded-full bg-[#F9F5FF] px-4 py-2 text-center text-sm font-medium text-secondary-400 dark:border md:text-md">
          Terms and Conditions
        </p>
        <div className="mx-auto mt-10">
          <h2 className="mx-auto w-full text-center text-display-sm font-semibold text-black dark:bg-gradient-to-t dark:from-white dark:to-neutral-400 dark:bg-clip-text dark:text-transparent md:text-display-md lg:w-1/2 lg:text-display-lg">
            Terms and Conditions
          </h2>
          <p className="mx-auto mt-5 w-full text-center text-sm text-neutral-500 dark:text-white md:text-md lg:w-1/3 lg:text-lg">
            Effective - 11/04/2025
          </p>
        </div>
      </div>
      <div className="mt-20 pb-10 dark:bg-gradient-to-b dark:from-[#0B0723] dark:via-[#07041f] dark:to-[#03001A]">
        <div className="mx-auto h-full w-[90%] pt-16 lg:w-[80%]">
          <h2 className="mb-10 text-[1.8rem] font-semibold">
            Hey!! Welcome to CodeBEGen!
          </h2>

          <div className="mb-5 flex flex-col gap-3">
            <h3 className="text-[1.5rem] font-medium">Acceptance of terms</h3>
            <p className="text-[1.5rem] text-neutral-400 dark:text-neutral-200">
              By accessing or using our website and services,Do you agree to be
              bound by these Terms and Conditions? . If you do not agree with
              any part of these Terms, you must not use our Services.
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-3">
            <h3 className="text-[1.5rem] font-medium">
              Description of Services{' '}
            </h3>
            <p className="text-[1.5rem] text-neutral-300 dark:text-neutral-400">
              CodeBEGen is your AI-powered backend companion—generating code from your specs, automating testing, and streamlining deployment.
              Unlock advanced features with secure payments powered by Stripe.
            </p>
          </div>
          <TermsList />
          <div className="mb-8 flex flex-col gap-3">
            <h3 className="text-[1.5rem] font-medium">Indemnification </h3>
            <p className="text-[1.5rem] text-neutral-300 dark:text-neutral-400">
              You agree to indemnify and hold us harmless from any claims,
              damages, or expenses arising out of your use of our Services or
              your violation of these Terms.
            </p>
          </div>
          <div className="mb-8 flex flex-col gap-3">
            <h3 className="text-[1.5rem] font-medium">
              Modifications to Terms
            </h3>
            <p className="text-[1.5rem] text-neutral-300 dark:text-neutral-400">
              We reserve the right to modify these Terms at any time. We will
              provide notice of any changes by posting the updated Terms on our
              website. Your continued use of our Services after the posting of
              changes constitutes your acceptance of the new Terms.
            </p>
          </div>
          <div className="mb-8 flex flex-col gap-3">
            <h3 className="text-[1.5rem] font-medium">Governing Law</h3>
            <p className="pl-0 text-[1.5rem] text-neutral-300 dark:text-neutral-400">
              These Terms shall be governed by and construed in accordance with
              the laws of your Jurisdiction.
            </p>
          </div>
          <div className="mb-8 flex flex-col gap-3">
            <h3 className="text-[1.5rem] font-medium">Dispute Resolution</h3>
            <p className="text-[1.5rem] text-neutral-300 dark:text-neutral-400">
              Any disputes arising out of these Terms shall be resolved through
              Arbitration/Mediation/Court in Your Jurisdiction.
            </p>
          </div>
          <div className="mb-8 flex flex-col gap-3">
            <h3 className="text-[1.5rem] font-medium">Stripe Integration</h3>
            <p className="text-[1.5rem] text-neutral-300 dark:text-neutral-400">
              You agree to be bound by Stripe’s Services Agreement{' '}
              <a
                href="https://stripe.com/privacy"
                className="text-secondary-600 underline"
              >
                https://stripe.com/privacy
              </a>{' '}
              for payment processing. We are not responsible for any issues
              related to Stripe&apos;s services.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="text-[1.5rem] font-medium">Contact Us </h3>
            <p className="text-[1.5rem] text-neutral-300 dark:text-neutral-400">
              If you have any questions about these Terms, please contact us at
              <a
                href="mailto:backendim.team@gmail.com."
                className="text-secondary-600 underline"
              >
                {' '}
                codebegen.team@gmail.com.
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TermsAndConditions
