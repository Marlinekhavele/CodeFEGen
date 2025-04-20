import posthog from 'posthog-js'
import APP_CONFIG from '@/config'

// Posthog best practices for naming.
// https://posthog.com/docs/product-analytics/best-practices
export const POSTHOG_EVENT_NAMES = {
  
  DEPLOY_CLICK: 'dashboard_page:deploy_button_click',
  RETRY_DEPLOY_CLICK: 'dashboard_page:retry_deploy_button_click',
  CREATE_BACKEND_SUBMIT: 'create_backend_page:create_backend_form_submit',
  ADD_ENDPOINT_VIEW: 'dashboard_page:add_endpoint_view',
  ADD_ENDPOINT_SUBMIT: 'dashboard_page:add_endpoint_form_submit',
  TEST_ENDPOINT_VIEW: 'dashboard_page:test_endpoint_view',
  TEST_ENDPOINT_SUBMIT: 'dashboard_page:test_endpoint_submit',
  ADD_PROJECT_VIEW: 'dashboard_page:add_project_view',
  ADD_PROJECT_SUBMIT: 'dashboard_page:add_project_form_submit',
  EXPORT_PROJECT_VIEW: 'dashboard_page:export_project_view',
  EXPORT_PROJECT_CLICK:
    'dashboard_page:export_project_confirmation_button_click',
  EXPORT_PROJECT_DOWNLOAD_CLICK:
    'dashboard_page:export_project_download_button_click',
  UPGRADE_PROJECT_CLICK: 'dashboard_page:upgrade_button_click',
}

export const sendPosthogEvent = (
  eventName: string,
  data: Record<string, unknown> | null
) => {
  if (APP_CONFIG.APP_ENV.IS_PROD) {
    posthog.capture(eventName, data)
  }
}
