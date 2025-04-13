import { AppLogLevel } from '~/utils/logger/log-level.const'

const definedLogLevel = process.env.NEXT_PUBLIC_LOG_LEVEL || 'error'
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development'

const APP_CONFIG = {
  LOG_LEVEL:
    definedLogLevel in AppLogLevel
      ? AppLogLevel[definedLogLevel]
      : AppLogLevel.debug,
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  DEPLOYMENT_WS_BASE_URL: process.env.NEXT_PUBLIC_DEPLOYMENT_BASE_WS_URL || '',
  POSTHOG: {
    API_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY!,
  },
  APP_ENV: {
    IS_DEV: appEnv === 'development',
    IS_PROD: appEnv === 'production',
    IS_STAGING: appEnv === 'staging',
  },
}

export default APP_CONFIG
