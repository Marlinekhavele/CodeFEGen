'use client'

import { useRouter } from '@bprogress/next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'
import InitializationService from '~/app/api/services/initialization-service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import useWindowWidth from '~/hooks/dashboard/useWindowWidth'
import { POSTHOG_EVENT_NAMES, sendPosthogEvent } from '~/lib/posthog'
import { getProjectsQueryOpts } from '~/lib/query-options'
import { CreateBackendFormSchema } from '~/schemas'
import { URLParameters } from '~/utils/constant'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

interface NewBackendProjectProps {
  title: string
  description: string
  showBackendModal?: boolean
  setShowBackendModal?: (value: boolean) => void
}

const CreateNewBackend = ({
  title,
  description,
  showBackendModal,
  setShowBackendModal,
}: NewBackendProjectProps) => {
  const [open, setOpen] = useState(true)
  const width = useWindowWidth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const handleSubmit = async (
    values: z.infer<typeof CreateBackendFormSchema>
  ) => {
    setError(null)
    const projectInitialization = new InitializationService()
    try {
      const response = await projectInitialization.endpointInitialization(
        values.project_name
      )
      sendPosthogEvent(POSTHOG_EVENT_NAMES.ADD_PROJECT_SUBMIT, null)
      queryClient.invalidateQueries(getProjectsQueryOpts)

      if (response) {
        router.push(
          `/${URLParameters.DASHBOARD}/${response.project_id}/${URLParameters.LOGIN}.post`
        )
      }
    } catch {
      setError('Error while initializing project')
    }
  }

  const form = useForm<z.infer<typeof CreateBackendFormSchema>>({
    resolver: zodResolver(CreateBackendFormSchema),
    defaultValues: {
      project_name: '',
    },
  })

  // open={isOpen}

  const { isDirty, isSubmitting } = form.formState
  if (width > 640)
    return (
      <Dialog
        open={open || showBackendModal}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value && setShowBackendModal) setShowBackendModal(false)
        }}
      >
        <DialogTrigger
          className="rounded-sm border-neutral-200 p-1 transition-all duration-300 ease-in-out hover:border-[0.3px] hover:bg-neutral-100"
          onClick={() =>
            sendPosthogEvent(POSTHOG_EVENT_NAMES.ADD_PROJECT_VIEW, null)
          }
        >
          <Plus className="h-4 w-4" />
        </DialogTrigger>
        <DialogContent
          className="mx-auto w-[calc(100%-3rem)] !rounded-lg pb-10"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <DialogHeader className="mb-2 !text-start">
            <DialogTitle id="modal-title">{title}</DialogTitle>
            <DialogDescription id="modal-description">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <h1 className="text-display-xs font-medium">
              Configure your backend setup
            </h1>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="rounded-x flex w-full max-w-[498px] flex-col gap-6"
            >
              <FormField
                name="project_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="text-[16px] font-medium">
                      Project Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter Project Name"
                        className="rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[450px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex w-full flex-col gap-1">
                {error && (
                  <span className="mb-1 text-sm text-error-600">{error}</span>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-6"
                  disabled={!isDirty}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Creating' : 'Create a'} backend
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )

  return (
    <Drawer
      open={open || showBackendModal}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value && setShowBackendModal) setShowBackendModal(false)
      }}
    >
      <DrawerTrigger
        className="rounded-sm border-neutral-200 p-1 transition-all duration-300 ease-in-out hover:border-[0.3px] hover:bg-neutral-100"
        onClick={() =>
          sendPosthogEvent(POSTHOG_EVENT_NAMES.ADD_PROJECT_SUBMIT, null)
        }
      >
        {/* <div>{trigger}</div> */}
        <Plus className="h-4 w-4" />
      </DrawerTrigger>
      <DrawerContent
        className="mx-auto px-4 pb-10"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <DrawerHeader className="mb-2 !text-start">
          <DrawerTitle id="modal-title">{title}</DrawerTitle>
          <DrawerDescription id="modal-description">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <div className="mb-6 flex items-center justify-center">
          <h1 className="text-lg font-medium">Configure your backend setup</h1>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="rounded-x flex w-full max-w-[498px] flex-col gap-6"
          >
            <FormField
              name="project_name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="text-[16px] font-medium">
                    Project Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter Project Name"
                      className="rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[450px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex w-full flex-col gap-1">
              {error && (
                <span className="mb-1 text-sm text-error-600">{error}</span>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full py-6"
                disabled={!isDirty}
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'Creating' : 'Create a'} backend
              </Button>
            </div>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}

export default CreateNewBackend
