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
      const axiosInstance = createAxiosInstance(`/migration/${projectId}/status`, "v1")
      const response = await axiosInstance.get("")
      return response.data?.data?.pending_migrations > 0
    } catch (error) {
      return false
    }
  }
  // New method to stream logs
  streamMigrationLogs(
    projectId: string, 
    onLogReceived: (logEntry: { timestamp: string; message: string; level: string; completed?: boolean }) => void,
    onError: (error: string) => void
  ): () => void {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://codebegen.canadacentral.cloudapp.azure.com";
    const eventSourceUrl = `${baseUrl}/api/v1/migration/${projectId}/logs`;
    const eventSource = new EventSource(eventSourceUrl);
    
    console.log(`Establishing EventSource connection to: ${eventSourceUrl}`);
    
    // Handle connection open
    eventSource.onopen = () => {
      console.log("Migration log stream connection established");
      onLogReceived({
        timestamp: new Date().toLocaleTimeString(),
        message: "Connection to migration service established",
        level: "info"
      });
    };
    
    // Handle incoming messages
    eventSource.onmessage = (event) => {
      console.log("Received migration log event:", event.data);
      try {
        const logEntry = JSON.parse(event.data);
        
        // Enhanced debugging for table creation events
        if (logEntry.message && 
            (logEntry.message.toLowerCase().includes("table") || 
             logEntry.message.toLowerCase().includes("migration"))) {
          console.log("Table-related event detected:", logEntry);
        }
        
        onLogReceived(logEntry);
        
        // Close the connection if we receive a completion message
        if (logEntry.completed) {
          console.log("Received completion message, closing connection");
          eventSource.close();
        }
      } catch (error) {
        console.error("Error parsing log message:", error, "Raw data:", event.data);
        onLogReceived({
          timestamp: new Date().toLocaleTimeString(),
          message: `Error parsing log: ${error instanceof Error ? error.message : String(error)}`,
          level: "error"
        });
      }
    };
    
    // Handle connection errors
    eventSource.onerror = (error) => {
      console.error("Error in log stream connection:", error);
      onError("Connection to migration service interrupted");
      eventSource.close();
    };
    
    // Return a function to close the connection
    return () => {
      console.log("Manually closing migration log stream");
      eventSource.close();
    };
  }

}

export default MigrationService
