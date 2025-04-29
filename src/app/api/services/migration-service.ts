import { BaseService } from "./base-service"
import createAxiosInstance from "./axiosInstance"

class MigrationService extends BaseService {
  constructor() {
    super("/migration")
  }

  /**
   * Run migrations for a project
   * @param projectId The project ID to run migrations for
   * @returns A promise that resolves to the migration result
   */
  public async runMigrations(projectId: string): Promise<any> {
    try {
      console.log(`Running migrations for project: ${projectId}`)
      const axiosInstance = createAxiosInstance(`/migration/${projectId}/run`, "v1")
      const response = await axiosInstance.post("")
      return response.data
    } catch (error) {
      console.error("Error running migrations:", error)
      throw error
    }
  }

  /**
   * Check if a project has pending migrations
   * @param projectId The project ID to check
   * @returns A promise that resolves to true if there are pending migrations
   */
  public async checkPendingMigrations(projectId: string): Promise<boolean> {
    try {
      console.log(`Checking pending migrations for project: ${projectId}`)
      const axiosInstance = createAxiosInstance(`/migration/${projectId}/status`, "v1")
      const response = await axiosInstance.get("")
      return response.data?.data?.pending_migrations > 0
    } catch (error) {
      console.error("Error checking pending migrations:", error)
      return false
    }
  }
}

export default MigrationService
