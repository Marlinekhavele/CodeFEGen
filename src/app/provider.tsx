'use client'

import { AppProgressProvider as ProgressProvider } from '@bprogress/next'
import {
  QueryClient,
  QueryClientProvider,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactLenis } from 'lenis/react'
import { DeploymentProvider } from '~/components/dashboard/deploy/deploy-provider-two'
import { PostHogProvider } from '~/providers/posthog-provider'
import { ThemeProvider } from '~/providers/theme-provider'
import { Toaster as Sonner } from '~ui/sonner'

const MINUTE = 1000 * 60

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 10 * MINUTE,
        staleTime: 1 * MINUTE,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider>
        <DeploymentProvider>
          <ThemeProvider>
            <ProgressProvider
              height="5px"
              color="#5B4CCC"
              options={{ showSpinner: false }}
              shallowRouting
            >
              <ReactLenis root>{children}</ReactLenis>
            </ProgressProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <Sonner richColors expand={true} position="top-right" />
          </ThemeProvider>
        </DeploymentProvider>
      </PostHogProvider>
    </QueryClientProvider>
  )
}
