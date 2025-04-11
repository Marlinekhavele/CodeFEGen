'use client'
import React, { ReactNode } from 'react'
import AnimatedSection from '../shared/AnimatedSection'

interface TermsSectionProps {
  number: string
  title: string
  children: ReactNode
}

interface BulletListProps {
  items: string[]
}

interface SectionContent {
  number: string
  title: string
  content: ReactNode
}

const TermsSection = ({ number, title, children }: TermsSectionProps) => (
  <section className="mb-6">
    <h2 className="mb-2 text-lg font-bold md:text-xl">
      {number}. {title}
    </h2>
    {children}
  </section>
)

const BulletList = ({ items }: BulletListProps) => (
  <ul className="list-disc pl-6">
    {items.map((item, index) => (
      <li key={index} className="mb-1 text-lg text-neutral-500">
        {item}
      </li>
    ))}
  </ul>
)

const PolicyPage = () => {
  const sections: SectionContent[] = [
    {
      number: '1',
      title: 'Acceptance of Terms',
      content: (
        <p className="text-lg text-neutral-500">
          By using our website and services, you agree to these Terms and
          Conditions, along with our Privacy Policy. We reserve the right to
          modify these terms at any time, and your continued use of our services
          constitutes your acceptance of any changes.
        </p>
      ),
    },
    {
      number: '2',
      title: 'User Responsibilities',
      content: (
        <BulletList
          items={[
            'You agree to provide accurate and complete information during account registration.',
            'You are responsible for maintaining the confidentiality of your account credentials.',
          ]}
        />
      ),
    },
    {
      number: '3',
      title: 'Prohibited Activities',
      content: (
        <>
          <p className="mb-2 text-lg text-neutral-500">
            When using our services, you must not:
          </p>
          <BulletList
            items={[
              'Engage in any unlawful or fraudulent activities.',
              'Distribute spam, viruses, or any harmful software.',
              "Gain unauthorized access to our systems or other users' data.",
            ]}
          />
        </>
      ),
    },
    {
      number: '4',
      title: 'Intellectual Property',
      content: (
        <p className="text-lg text-neutral-500">
          All content, trademarks, and intellectual property displayed on our
          website are owned by or licensed to Backend.IM. You may not use, copy,
          or distribute any content without our express written permission.
        </p>
      ),
    },
    {
      number: '5',
      title: 'Termination of Use',
      content: (
        <p className="text-lg text-neutral-500">
          We reserve the right to suspend or terminate your access to our
          services if you violate these Terms and Conditions or engage in
          prohibited activities.
        </p>
      ),
    },
    {
      number: '6',
      title: 'Limitation of Liability',
      content: (
        <p className="text-lg text-neutral-500">
          CodeBEGen will not be liable for any direct, indirect, incidental, or
          consequential damages resulting from your use of our services.
        </p>
      ),
    },
    {
      number: '7',
      title: 'Changes to These Terms',
      content: (
        <p className="text-lg text-neutral-500">
          We may update these Terms and Conditions at any time. Changes will be
          posted on this page.
        </p>
      ),
    },
  ]

  /* 
       style={{
                backgroundSize: '150% 130%',
              }}
              className="relative flex flex-col items-center gap-10 overflow-hidden bg-gradient-radial from-secondary-200/40 via-white to-white bg-center p-5"
  */
  return (
    <div className="mb-40 items-center bg-white pt-16 md:pt-20">
      <div
        style={{
          backgroundSize: '150% 130%',
        }}
        className="relative flex flex-col items-center gap-y-5 overflow-hidden bg-gradient-radial from-secondary-200/40 via-white to-white bg-center p-5 md:min-h-[350px]"
      >
        <div className="z-30 mx-auto mb-8 w-fit animate-fade-in-up rounded-full bg-secondary-100 bg-opacity-50 lg:mx-auto lg:mb-8 lg:flex lg:w-fit lg:items-center lg:justify-center lg:gap-3 lg:rounded-[100px] lg:bg-secondary-50 lg:px-2 lg:py-1">
          <p className="px-3.5 py-2.5 text-center text-md font-medium text-secondary-600">
            Terms and Conditions
          </p>
        </div>
        <h1 className="w-4/5 animate-fade-in-up text-center text-[25px] opacity-0 delay-200 sm:text-display-md md:text-display-lg">
          Review the guidelines and policies for using CodeBEGen.
        </h1>
        <svg
          // right-[-40%] top-[10%] lg:right-[-5%] lg:top-[-1%]
          className="absolute lg:right-[-13%]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Styling responsible for the drawing animation of the svg. */}
          <style>
            {`
      @keyframes drawRect {
        0% {
          stroke-dashoffset: 10000;
        }
        100% {
          stroke-dashoffset: 0;
        }
      }
      
      .rect-path {
        stroke: hsla(240, 1%, 25%, 0.16);
        stroke-width: 1;
        fill: none;
        stroke-dasharray: 10000;
        stroke-dashoffset: 10000;
      }
      
      .rect-1 {
        animation: drawRect 15s ease 0.08s forwards;
      }
      
      .rect-2 {
        animation: drawRect 15s ease 0.1s forwards;
      }
      
      .rect-3 {
        animation: drawRect 15s ease 0.12s forwards;
      }
      
      .rect-4 {
        animation: drawRect 15s ease 0.04s forwards;
      }
      
      .rect-5 {
        animation: drawRect 15s ease forwards; 
      }
    `}
          </style>
          {/* 
            5-1, 4-2,3-5,2-4,1-3
          
          */}

          <g fill="none">
            <rect
              className="rect-path rect-1"
              x="23.75%"
              y="38.33%"
              width="87.38%"
              height="116.67%"
              rx="8.75%"
              ry="11.67%"
              transform="rotate(65.73 400 300)"
            />

            <rect
              className="rect-path rect-2"
              x="16.25%"
              y="35%"
              width="82.13%"
              height="115.17%"
              rx="6.25%"
              ry="8.33%"
              transform="rotate(61.7 400 300)"
            />

            <rect
              className="rect-path rect-3"
              x="11.25%"
              y="29.17%"
              width="82.13%"
              height="115.23%"
              rx="8.75%"
              ry="11.67%"
              transform="rotate(55.9 400 300)"
            />

            <rect
              className="rect-path rect-4"
              x="27.5%"
              y="41.67%"
              width="79.25%"
              height="105.83%"
              rx="6.25%"
              ry="8.33%"
              transform="rotate(68.01 400 300)"
            />

            <rect
              className="rect-path rect-5"
              x="28.75%"
              y="48.33%"
              width="79.5%"
              height="105.33%"
              rx="5%"
              ry="6.67%"
              transform="rotate(65.01 400 300)"
            />
          </g>
        </svg>
      </div>

      <AnimatedSection>
        <div className="mx-auto max-w-3xl p-6">
          <p className="mb-4 text-lg text-neutral-500">
            Last Updated: Feb 15, 2025
          </p>
          <div className="mb-6">
            <p className="mb-4 text-lg text-neutral-500">
              Welcome to CodeBEGen! By accessing or using our website,
              products, and services, you agree to comply with and be bound by
              the following terms and conditions. If you do not agree, please do
              not use our services.
            </p>
          </div>

          {sections.map((section) => (
            <TermsSection
              key={section.number}
              number={section.number}
              title={section.title}
            >
              {section.content}
            </TermsSection>
          ))}

          <section>
            <h2 className="mb-2 text-xl font-bold">Contact Us</h2>
            <p className="text-lg text-neutral-500">
              If you have any questions or concerns about these Terms and
              Conditions, please contact us at info@codebegen.com.
            </p>
            <p className="mt-2 text-xl text-neutral-500">
              By using our services, you acknowledge that you have read,
              understood, and agreed to these Terms and Conditions.
            </p>
          </section>
        </div>
      </AnimatedSection>
    </div>
  )
}

export default PolicyPage
