import { PostHog } from 'posthog-node'
import APP_CONFIG from '~/config'

export default function PostHogClient() {
  if (APP_CONFIG.APP_ENV.IS_PROD) {
    const posthogClient = new PostHog(APP_CONFIG.POSTHOG.API_KEY, {
      host: 'https://us.i.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    })
    return posthogClient
  }
}
