export class BaseService {
    protected baseUrl: string
  
    constructor(baseUrl: string) {
      this.baseUrl = baseUrl
    }
  
    protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<{ data: T }> {
      const url = new URL(`${this.baseUrl}${endpoint}`)
  
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value))
        })
      }
  
      const response = await fetch(url.toString())
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
  
      const data = await response.json()
      return { data }
    }
  
    protected async post<T, U>(endpoint: string, body: U): Promise<{ data: T }> {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
  
      const data = await response.json()
      return { data }
    }
  }
  