export const URLParameters = {
  CREATE_PROJECT: 'create-backend',
  DATABASE: 'database',
  DASHBOARD: 'create-backend',
  // DEPLOYMENT: 'api/v1/ws/deploy',
}

export const autoHeaders = [
  {
    key: 'Cache-Control',
    value: 'no-cache',
    checked: true,
    disabled: true,
  },
  {
    key: 'Content-Length',
    value: 0,
    checked: true,
    disabled: false,
  },
  {
    key: 'Host',
    value: '<calculated when request is sent>',
    checked: true,
    disabled: false,
  },
  {
    key: 'User-Agent',
    value: 'CodebegenRuntime/7.43.0',
    checked: true,
    disabled: false,
  },
  {
    key: 'Accept',
    value: '*/*',
    checked: true,
    disabled: false,
  },
]



// export const DEPLOYMENT_CONFIG = {
//   COMMIT_HASH: 'HEAD',
//   START_COMMAND: 'uvicorn main:app --host 0.0.0.0 --port $DEPLOY_PORT',
//   PROJECT_TYPE: 'fastapi',
// }

export const BACKEND_WS_URL = process.env.NEXT_PUBLIC_API_BASE_URL

