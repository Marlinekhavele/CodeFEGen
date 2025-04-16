import type { InitializationResponse } from "@/types";
import { BaseService } from "./base-service";

class InitializationService extends BaseService {
  constructor() {
    super("/project-url");
  }

  public async endpointInitialization(
    projectName: string,
    language: string,
    framework: string
  ) {
    const res = await this.post<InitializationResponse, { project_name: string; language: string; framework: string }>(
      "",
      {
        project_name: projectName,
        language,
        framework,
      }
    );
    return res.data;
  }

  public async downloadZipFile(projectName: string) {
    return await this.get<string>(`/download-file`, {
      project_name: projectName,
    });
  }
}

export default InitializationService;
