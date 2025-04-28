"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type * as z from "zod"
import InitializationService from "@/app/api/services/initialization-service"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CreateBackendFormSchema } from "@/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { languages, frameworks } from "./options"

interface ProjectInitFormProps {
  onProjectInitialized?: (projectName: string, urlFriendlyName: string, language: string, framework: string) => void
}

export function ProjectInitForm({ onProjectInitialized }: ProjectInitFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof CreateBackendFormSchema>>({
    resolver: zodResolver(CreateBackendFormSchema),
    defaultValues: {
      project_name: "",
      language: "python",
      framework: "fastapi",
    },
  })

  const selectedLanguage = form.watch("language")

  const { isDirty, isSubmitting } = form.formState

  const handleSubmit = async (values: z.infer<typeof CreateBackendFormSchema>) => {
    setError(null)
    setIsLoading(true)
    const projectInitialization = new InitializationService()

    try {
      const response = await projectInitialization.endpointInitialization(
        values.project_name,
        values.language,
        values.framework,
      )

      if (response) {
        const projectId = response.project_id

        if (onProjectInitialized) {
          onProjectInitialized(values.project_name, projectId, values.language, values.framework)
        } else {
          router.push(
            `/create-backend?name=${encodeURIComponent(values.project_name)}&url=${encodeURIComponent(projectId)}&language=${encodeURIComponent(values.language)}&framework=${encodeURIComponent(values.framework)}`,
          )
        }
      }
    } catch (err) {
      console.error("Error initializing project:", err)
      setError("Error while initializing project. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 rounded-lg border border-border bg-background p-6 shadow-lg">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Create Backend Project</h1>
        <p className="mt-2 text-sm text-muted-foreground">Fill in the details below to initialize your backend project.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            name="project_name"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter Project Name"
                    className="focus:border-[#7dff00] focus:ring-[#7dff00]/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="language"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Language</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="text-white focus:border-[#7dff00] focus:ring-[#7dff00]/20">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language.value} value={language.value} className="text-white">
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            name="framework"
            control={form.control}
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Framework</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={!selectedLanguage}
                >
                  <FormControl>
                    <SelectTrigger className="text-white focus:border-[#7dff00] focus:ring-[#7dff00]/20">
                      <SelectValue placeholder="Select a framework" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedLanguage && frameworks[selectedLanguage as keyof typeof frameworks].map((framework) => (
                      <SelectItem key={framework.value} value={framework.value} className="text-white">
                        {framework.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full bg-[#7dff00] text-black hover:bg-[#9aff33]"
              disabled={!isDirty || isSubmitting || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Backend"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}