"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackendEditorClient from "./backend-editor-client";
import { ProjectInitForm } from "@/components/create-backend/project-init-form";
import { Loader2 } from "lucide-react";

interface SanitizedParams {
  [key: string]: string;
}

interface Props {}

const sanitizeUrl = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

const CreateBackendPage: React.FC<Props> = () => {
  const [projectName, setProjectName] = useState<string>("");
  const [urlFriendlyName, setUrlFriendlyName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showInitForm, setShowInitForm] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  //Sanitize params from URL
  const sanitizeParams = useCallback((params: { [key: string]: string | undefined }): SanitizedParams => {
    const sanitizedParams: SanitizedParams = {};
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        sanitizedParams[key] = String(value).replace(/[^a-zA-Z0-9]/g, '');
      }
    }
    return sanitizedParams;
  }, []);

  const handleProjectInitialized = useCallback(
    (name: string, url: string, language: string, framework: string) => {
      // Sanitize the parameters before pushing to the router
      const sanitizedParams = sanitizeParams({
        name: name,
        url: url,
        language: language,
        framework: framework,
      });

      // After project initialization, redirect to template selection with sanitized parameters
      router.push(`/create-backend?${new URLSearchParams(sanitizedParams).toString()}`);
    },
    [router, sanitizeParams]
  );

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        if (!searchParams) {
          console.warn("searchParams not available");
          setShowInitForm(true);
          return;
        }

        const nameFromUrl = searchParams.get("name") || "";
        const urlFromUrl = searchParams.get("url") || "";
        const templateFromUrl = searchParams.get("template") || "";
        const languageFromUrl = searchParams.get("language") || "python";
        const frameworkFromUrl = searchParams.get("framework") || "flask";

        // Sanitize parameters
       const sanitizedName = sanitizeParams({ nameFromUrl });
        const sanitizedUrl = sanitizeParams({ urlFromUrl });
        const sanitizedTemplate = sanitizeParams({ templateFromUrl });
        const sanitizedLanguage = sanitizeParams({ languageFromUrl });
        const sanitizedFramework = sanitizeParams({ frameworkFromUrl });

        if (nameFromUrl && urlFromUrl && templateFromUrl) {
          setProjectName(nameFromUrl);
          setUrlFriendlyName(urlFromUrl);
          setShowInitForm(false);
        } else if (nameFromUrl && urlFromUrl) {
          // Ensure languageFromUrl and frameworkFromUrl have default values if they are null
          const sanitizedParams = sanitizeParams({
            name: nameFromUrl,
            url: urlFromUrl,
            language: languageFromUrl,
            framework: frameworkFromUrl,
          });
          router.push(`/create-backend?${new URLSearchParams(sanitizedParams).toString()}`);
          return;
        } else {
          setShowInitForm(true);
        }
      } catch (error) {
        console.error("Error initializing component:", error);
      } finally {
        setLoading(false);
      }
    };

    if (searchParams) {
      initialize();
    }
  }, [searchParams, router, sanitizeParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-[#7dff00] animate-spin" />
          <p className="text-zinc-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (showInitForm) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900 p-4">
        <div className="w-full max-w-md">
          <ProjectInitForm onProjectInitialized={handleProjectInitialized} />
        </div>
      </div>
    );
  }

  return (
    <BackendEditorClient
      projectName={projectName}
      urlFriendlyName={urlFriendlyName}
      templateId={searchParams.get("template") || ""}
      projectLanguage={searchParams.get("language") || "python"}
      projectFramework={searchParams.get("framework") || "flask"}
    />
  );
};

export default CreateBackendPage;
