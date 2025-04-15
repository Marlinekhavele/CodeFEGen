import axios, { AxiosInstance, RawAxiosRequestHeaders } from 'axios'
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

const createAxiosInstance = (
  clientUrl: string,
  version: 'v1' | 'v2' = 'v1',
  headers?: RawAxiosRequestHeaders
): AxiosInstance => {
  return axios.create({
    timeout: 120000,
    baseURL: `${baseUrl}/api/${version}${clientUrl}/`,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

export default createAxiosInstance
