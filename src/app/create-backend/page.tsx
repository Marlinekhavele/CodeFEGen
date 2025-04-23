"use client";

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from 'next/image'
import { ProjectInitForm } from "@/components/create-backend/project-init-form"
import { ArrowLeft, Loader2, Database, Server, Code, Zap, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { Footer } from "@/components/footer"

interface SanitizedParams {
  [key: string]: string;
}

interface Props {}

const CreateBackendPage: React.FC<Props> = () => {
  const [projectName, setProjectName] = useState<string>("");
  const [urlFriendlyName, setUrlFriendlyName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [showInitForm, setShowInitForm] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [projectLanguage, setProjectLanguage] = useState<string>("python"); 
  const [projectFramework, setProjectFramework] = useState<string>("flask");

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

    const selectTemplate = useCallback(
        (templateId: string) => {
            // Construct the URL using URLSearchParams for safe URL construction
            const params = new URLSearchParams({
                name: projectName,
                url: urlFriendlyName,
                language: projectLanguage,
                framework: projectFramework,
                template: templateId,
            });
            // Sanitize parameters to prevent XSS and other vulnerabilities
            const sanitizedParams = sanitizeParams(Object.fromEntries(params));
            const url = `/create-backend/backend-editor?${new URLSearchParams(sanitizedParams).toString()}`;
            router.push(url);
        },
        [projectName, urlFriendlyName, router, sanitizeParams, projectLanguage, projectFramework]
    );

  const handleProjectInitialized = useCallback(
    (name: string, url: string, language: string, framework: string) => {
        // Sanitize the parameters before pushing to the router
       const sanitizedParams = sanitizeParams({
            name: name,
            url: url,
            language: language,
            framework: framework,
        });

        const urlParams = new URLSearchParams(sanitizedParams);
        // After project initialization, redirect to template selection with sanitized parameters
        router.push(`/create-backend?${urlParams.toString()}`);
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
        const languageFromUrl = searchParams.get("language") || "python";
        const frameworkFromUrl = searchParams.get("framework") || "flask";

        if (nameFromUrl && urlFromUrl) {
          setProjectName(nameFromUrl);
          setUrlFriendlyName(urlFromUrl);
          setShowInitForm(false);
          setProjectLanguage(languageFromUrl);  
          setProjectFramework(frameworkFromUrl);

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
    <div className="flex min-h-screen flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-zinc-100/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
              src="/codeBE-logo.png"
              alt="CodeBEgen Logo"
              width={36}
              height={36}
              />
              <span className="text-xl font-bold text-[#7dff00] dark:text-[#7dff00]">CodeBEGen</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8">
          <Link
            href="/init-project"
            className="inline-flex items-center gap-2 text-zinc-600 hover:text-[#7dff00] dark:text-zinc-400 dark:hover:text-[#7dff00] mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Project Setup
          </Link>
          <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-white">Create a New Backend</h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Backend Template Cards */}
            <div className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)] dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Database className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-zinc-900 group-hover:text-[#7dff00] dark:text:white">
                REST API
              </h3>
              <p className="text-zinc-600 mb-4 dark:text-zinc-400">
                Create a standard REST API with authentication, database models, and CRUD operations.
              </p>
              <Button 
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
                onClick={() => selectTemplate("rest-api")}
              >
                Select Template
              </Button>
            </div>

            <div className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)] dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Server className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-zinc-900 group-hover:text-[#7dff00] dark:text:white">
                GraphQL API
              </h3>
              <p className="text-zinc-600 mb-4 dark:text-zinc-400">
                Build a GraphQL API with schemas, resolvers, and authentication middleware.
              </p>
              <Button 
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
                onClick={() => selectTemplate("graphql-api")}
              >
                Select Template
              </Button>
            </div>

            <div className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)] dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Code className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-zinc-900 group-hover:text-[#7dff00] dark:text:white">
                Serverless Functions
              </h3>
              <p className="text-zinc-600 mb-4 dark:text-zinc-400">
                Deploy individual serverless functions with event-driven architecture.
              </p>
              <Button 
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
                onClick={() => selectTemplate("serverless")}
              >
                Select Template
              </Button>
            </div>

            <div className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)] dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Zap className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-zinc-900 group-hover:text-[#7dff00] dark:text:white">
                Real-time API
              </h3>
              <p className="text-zinc-600 mb-4 dark:text-zinc-400">
                Build a WebSocket-based real-time API for chat, notifications, and live updates.
              </p>
              <Button 
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
                onClick={() => selectTemplate("realtime-api")}
              >
                Select Template
              </Button>
            </div>

            <div className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)] dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Globe className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-zinc-900 group-hover:text-[#7dff00] dark:text:white">
                E-commerce API
              </h3>
              <p className="text-zinc-600 mb-4 dark:text-zinc-400">
                Complete e-commerce backend with products, orders, payments, and user management.
              </p>
              <Button 
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
                onClick={() => selectTemplate("ecommerce-api")}
              >
                Select Template
              </Button>
            </div>

            <div className="group rounded-lg border border-zinc-200 bg-white p-6 transition-all hover:border-[#7dff00]/50 hover:shadow-[0_0_15px_rgba(125,255,0,0.15)] dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 rounded-full bg-[#7dff00]/10 p-3 w-fit">
                <Lock className="h-6 w-6 text-[#7dff00]" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-zinc-900 group-hover:text-[#7dff00] dark:text:white">
                Auth Service
              </h3>
              <p className="text-zinc-600 mb-4 dark:text-zinc-400">
                Authentication and authorization service with OAuth, JWT, and role-based access control.
              </p>
              <Button 
                className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100"
                onClick={() => selectTemplate("auth-service")}
              >
                Select Template
              </Button>
            </div>
          </div>

          <div className="mt-12 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text:white">Create Custom Backend</h2>
            <p className="text-zinc-600 mb-6 dark:text-zinc-400">
              Describe your backend requirements in natural language and our AI will generate the perfect backend for
              you.
            </p>
            <div className="mb-6">
              <textarea
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 px-4 py-3 text-zinc-700 placeholder:text-zinc-500 focus:border-[#7dff00] focus:outline-none min-h-[150px] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                placeholder="Describe your backend requirements... (e.g., 'Create a REST API for a blog with user authentication, posts, comments, and categories')"
                id="custom-requirements"
              ></textarea>
            </div>
            <Button 
              className="bg-[#7dff00] text-black hover:bg-[#9aff33] dark:bg-[#7dff00] dark:text-black dark:hover:bg-[#9aff33]"
              disabled={!projectName || !urlFriendlyName}
              onClick={() => {
                if (!projectName || !urlFriendlyName) return;
                const customRequirementsElement = document.getElementById("custom-requirements");
                const customRequirements = customRequirementsElement ? (customRequirementsElement as HTMLTextAreaElement).value : "";
                router.push(`/create-backend/backend-editor?name=${projectName}&url=${urlFriendlyName}&template=custom&requirements=${encodeURIComponent(customRequirements)}&language=${projectLanguage}&framework=${projectFramework}`);
              }}
            >
              Generate Backend
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CreateBackendPage;
