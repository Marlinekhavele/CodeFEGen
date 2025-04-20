'use server'

import { revalidatePath } from 'next/cache'

export const revalidatePaths = async (projectId: string) => {
  revalidatePath(`/create-backend/backend-editor/${projectId}`)
}
