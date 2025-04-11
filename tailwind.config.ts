import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontSize: {
      'display-2xl': ['4.5rem', '4.5rem'],
      'display-xl': ['3.75rem', '4.5rem'],
      'display-lg': ['3rem', '3.75rem'],
      'display-md': ['2.25rem', '2.75rem'],
      'display-sm': ['1.875rem', '2.375rem'],
      'display-xs': ['1.5rem', '2rem'],
      xl: ['1.25rem', '1.875rem'],
      lg: ['1.125rem', '1.75rem'],
      md: ['1rem', '1.5rem'],
      sm: ['0.875rem', '1.25rem'],
      xs: ['0.75rem', '1.125rem'],
    },
    colors: {
      secondary: {
        '50': 'hsl(var(--secondary-green-50)/ <alpha-value>)',
        '100': 'hsl(var(--secondary-green-100)/ <alpha-value>)',
        '200': 'hsl(var(--secondary-green-200)/ <alpha-value>)',
        '300': 'hsl(var(--secondary-green-300)/ <alpha-value>)',
        '400': 'hsl(var(--secondary-green-400)/ <alpha-value>)',
        '500': 'hsl(var(--secondary-green-500)/ <alpha-value>)',
        '600': 'hsl(var(--secondary-green-600)/ <alpha-value>)',
        '700': 'hsl(var(--secondary-green-700)/ <alpha-value>)',
        '800': 'hsl(var(--secondary-green-800)/ <alpha-value>)',
        '900': 'hsl(var(--secondary-green-900)/ <alpha-value>)',
      },
      neutral: {
        50: 'hsl(var(--neutral-charcoal-50) / <alpha-value>)',
        75: 'hsla(var(--neutral-charcoal-75) / <alpha-value>)',
        100: 'hsl(var(--neutral-charcoal-100)/ <alpha-value>)',
        200: 'hsl(var(--neutral-charcoal-200)/ <alpha-value>)',
        300: 'hsl(var(--neutral-charcoal-300)/ <alpha-value>)',
        400: 'hsl(var(--neutral-charcoal-400)/ <alpha-value>)',
        500: 'hsl(var(--neutral-charcoal-500)/ <alpha-value>)',
        600: 'hsl(var(--neutral-charcoal-600)/ <alpha-value>)',
        700: 'hsl(var(--neutral-charcoal-700)/ <alpha-value>)',
        800: 'hsl(var(--neutral-charcoal-800)/ <alpha-value>)',
        900: 'hsl(var(--neutral-charcoal-900)/ <alpha-value>)',
      },
      error: {
        '100': 'hsl(var(--error-red-100)/ <alpha-value>)',
        '300': 'hsl(var(--error-red-300)/ <alpha-value>)',
        '600': 'hsl(var(--error-red-600)/ <alpha-value>)',
      },
      warning: {
        '100': 'hsl(var(--warning-carrot-100)/ <alpha-value>)',
        '400': 'hsl(var(--warning-carrot-400)/ <alpha-value>)',
        '500': 'hsl(var(--warning-carrot-500)/ <alpha-value>)',
      },
      success: {
        100: 'hsla(var(--success-grass-100)/ <alpha-value>)',
        300: 'hsl(var(--success-grass-300)/ <alpha-value>)',
        600: 'hsl(var(--success-grass-600)/ <alpha-value>)',
      },
      'dark-blue': 'hsl(var(--dark-blue)/ <alpha-value>)',
      white: 'hsl(0 0% 100% / <alpha-value>)',
      black: 'hsl(0 0% 0% / <alpha-value>)',
      'breadcrumb-page': 'hsl(var(--breadcrumb-page)/ <alpha-value>)',
      transparent: 'transparent',
      current: 'currentColor',
    },
    extend: {
      backgroundImage: {
        hero: "url('/HeroBg.webp')",
        rightIcons: "url('/RightHeroIcons.png')",
        leftIcons: "url('/LeftHeroIcons.png')",
        everythingBg: "url('/Everythingbg.webp')",
        softwareEngineer: "url('/SoftwareHeroImage.webp')",
        dust: "url('/Dustbackground.png')",
        codeSnippet: "url('/home/codeSnippet.png')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2lg': 'calc(var(--radius) + 8px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },

        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(50px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.7s ease-out forwards',
      },
      screens: {
        custom: '830px',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')],
}
export default config
