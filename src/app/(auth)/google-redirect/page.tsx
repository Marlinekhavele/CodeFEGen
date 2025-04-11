import { redirect } from 'next/navigation'
import RedirectSpinner from '~/components/auth/RedirectSpinner'
import { URLParameters } from '~/utils/constant'

export default async function GoogleRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId: string | null }>
}) {
  const projectId = (await searchParams).projectId
  if (!projectId || projectId === 'null') {
    redirect(`/${URLParameters.CREATE_PROJECT}`)
  }
  if (projectId) {
    redirect(`/${URLParameters.DASHBOARD}/${projectId}/login.post`)
  }
  return <RedirectSpinner />
}
