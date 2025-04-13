import type { Metadata } from "next"
import BackendEditorClient from "./backend-editor-client"

export const metadata: Metadata = {
  title: "Backend Editor - CodeBEGen",
  description: "Edit and manage your generated backend code",
}

export default function BackendEditor() {
  return <BackendEditorClient />
}
