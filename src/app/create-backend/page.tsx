import CreateBackendForm from '~/components/create-backend/form'

export default function CreateBackend() {
  return (
    <main className="relative flex h-full flex-col justify-center gap-4 px-3 py-20 md:gap-9 lg:items-center">
      <h2 className="text-center text-xl font-medium lg:text-display-xs">
        Configure your Backend Setup
      </h2>
      <CreateBackendForm />
    </main>
  )
}
