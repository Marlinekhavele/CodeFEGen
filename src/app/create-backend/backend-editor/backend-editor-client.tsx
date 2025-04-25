"use client";

import { useState, useEffect } from "react";
import AIChat from "@/components/ai-chat";
import { toast } from "@/components/ui/use-toast";
import {
  GeneratedFileType,
  FileType,
  GeneratedDataType,
  EndpointListContent,
  MethodType,
  EndpointDetails,
} from "@/types";
import { ProjectHeader } from "@/components/project-header";
import { ProjectFiles } from "@/components/project-files";
import { FileContent } from "@/components/file-content";
import { useTheme } from "@/components/theme-provider";
import EndPointService from "@/app/api/services/endpoint-service";
import createAxiosInstance from "@/app/api/services/axiosInstance";

interface BackendEditorClientProps {
  projectName: string;
  urlFriendlyName?: string;
  templateId?: string;
  projectLanguage?: string;
  projectFramework?: string;
}

export default function BackendEditorClient({
  projectName,
  urlFriendlyName = "",
  templateId = "",
  projectLanguage = "python",
  projectFramework = "flask",
}: BackendEditorClientProps) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedDataType | null>(
    null
  );
  const { theme } = useTheme();

  // Add a state to track streaming code
  const [streamingCode, setStreamingCode] = useState("");

  const [endpointDetails, setEndpointDetails] =
    useState<EndpointDetails | null>(null);

  useEffect(() => {
    const fetchEndpoints = async () => {
      const endpointService = new EndPointService();

      try {
        console.log("Fetching endpoints for project:", urlFriendlyName);

        // Fetch endpoints
        const endpointResult = await endpointService.getEndpointList(
          urlFriendlyName
        );
        console.log("Endpoint list response:", endpointResult);

        // Fetch docs
        const docsResult = await endpointService.getDocList(urlFriendlyName);
        console.log("Docs list response:", docsResult);

        let allFiles: FileType[] = [];

        // Process endpoints
        if (endpointResult && endpointResult.length > 0) {
          const endpointFiles = await Promise.all(
            endpointResult.map(async (ep: EndpointListContent) => {
              try {
                const endpointAxios = createAxiosInstance("/endpoint", "v1");
                const resp = await endpointAxios.get("", {
                  params: {
                    project_id: urlFriendlyName,
                    endpoint_path: ep.path,
                    method: ep.method,
                  },
                });
                const fileResult = resp.data?.data;
                const code = fileResult?.content_base64
                  ? atob(fileResult.content_base64)
                  : "";

                let fileName = ep.path.split("/").pop() || ep.path;
                fileName = fileName.replace(/^(GET|POST|PUT|DELETE)_/i, "");

                return {
                  id: `endpoint-${ep.path}`,
                  name: fileName,
                  path: ep.path,
                  type: "endpoint" as const,
                  code,
                  method: ep.method as MethodType,
                };
              } catch (error) {
                console.error(
                  `Error fetching code for endpoint ${ep.path}:`,
                  error
                );
                let fileName = ep.path.split("/").pop() || ep.path;
                fileName = fileName.replace(/^(GET|POST|PUT|DELETE)_/i, "");
                return {
                  id: `endpoint-${ep.path}`,
                  name: fileName,
                  path: ep.path,
                  type: "endpoint" as const,
                  code: "",
                  method: ep.method as MethodType,
                };
              }
            })
          );
          allFiles = [...allFiles, ...endpointFiles];
        }

        // Process docs
        if (docsResult && docsResult.length > 0) {
          const docsFiles = await Promise.all(
            docsResult.map(async (doc: any) => {
              try {
                const docAxios = createAxiosInstance(
                  `/projects/${urlFriendlyName}/docs/${doc.name}/content`,
                  "v1"
                );
                const resp = await docAxios.get("");
                const fileResult = resp.data?.data;
                const code = fileResult?.content_base64
                  ? atob(fileResult.content_base64)
                  : "";

                return {
                  id: `docs-${doc.name}`,
                  name: doc.name,
                  path: doc.path || `/docs/${doc.name}`,
                  type: "docs" as const,
                  code,
                };
              } catch (error) {
                console.error(`Error fetching code for docs ${doc.name}:`, error);
                return {
                  id: `docs-${doc.name}`,
                  name: doc.name,
                  path: doc.path || `/docs/${doc.name}`,
                  type: "docs" as const,
                  code: "",
                };
              }
            })
          );
          allFiles = [...allFiles, ...docsFiles];
        }

        console.log("All processed files:", allFiles);
        setFiles(allFiles);

        if (allFiles.length > 0) {
          setSelectedFile(allFiles[0].id);
          setCurrentCode(allFiles[0].code);
        } else {
          console.log("No files found for project");
          toast({
            title: "No files found",
            description: "This project doesn't have any files yet. Try creating one!",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error fetching files:", error);
        toast({
          title: "Error fetching files",
          description:
            error instanceof Error ? error.message : "Failed to fetch files",
          variant: "destructive",
        });
      }
    };
    if (urlFriendlyName) {
      fetchEndpoints();
    }
  }, [urlFriendlyName]);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <ProjectHeader
        projectName={projectName}
        urlFriendlyName={urlFriendlyName}
        templateId={templateId}
        isGenerating={isGenerating}
        onCopyCode={() => {}}
        onDeleteFile={() => {}}
        onSaveFile={() => {}}
        onDownloadFile={() => {}}
      />

      <main className="flex-1">
        <div className="container py-6">
          <div
            className="grid grid-cols-[280px_1fr_300px] gap-6"
            style={{ height: "calc(100vh - 200px)" }}
          >
            <ProjectFiles
              files={files}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              generatedData={generatedData}
              onGenerateAdditionalCode={async () => {
                return Promise.resolve();
              }}
              onSelectGeneratedFile={() => {}}
              onEndpointDetailsSubmit={() => {}}
              isGenerating={isGenerating}
              onCreateEndpoint={async (data: { endpointPath: string; httpMethod: string; description: string; }) => {
                console.log("Creating endpoint with data:", data);
                return Promise.resolve();
              }}
              projectLanguage={projectLanguage}
              projectFramework={projectFramework}
            />

            <FileContent
              selectedFile={selectedFile}
              currentCode={currentCode}
              files={files}
              onCodeChange={setCurrentCode}
              theme={theme}
              streamingCode={streamingCode}
            />

            <div className="h-full">
              <AIChat
                projectId={urlFriendlyName || projectName}
                onFileGenerated={() => {}}
                endpointDetails={endpointDetails}
                projectLanguage={projectLanguage}
                projectFramework={projectFramework}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
