'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer'
import useWindowWidth from '~/hooks/dashboard/useWindowWidth'
import { POSTHOG_EVENT_NAMES, sendPosthogEvent } from '~/lib/posthog'
import { useTabStore } from '~/stores/tabs-store'
import { DEPLOYMENT_CONFIG } from '~/utils/constant'
import { useDeployment } from '../dashboard/deploy/deploy-provider-two'
import { Button } from '../ui/button'

interface NewBackendProjectProps {
  title: string
  showDeploymentModal: boolean
  setShowDeploymentModal: (value: boolean) => void
  projectId: string
}

const DeploymentModal = ({
  title,
  showDeploymentModal,
  setShowDeploymentModal,
  projectId,
}: NewBackendProjectProps) => {
  const [open, setOpen] = useState(true)
  const width = useWindowWidth()
  const { startDeployment } = useDeployment()
  const { handleActiveTab } = useTabStore()

  const handleDeployment = async (): Promise<void> => {
    sendPosthogEvent(POSTHOG_EVENT_NAMES.DEPLOY_CLICK, null)
    handleActiveTab('deploy')
    startDeployment(
      projectId,
      DEPLOYMENT_CONFIG.COMMIT_HASH,
      DEPLOYMENT_CONFIG.START_COMMAND
    )
    setShowDeploymentModal(false)
    setOpen(false)
  }

  if (width > 640)
    return (
      <Dialog
        open={open || showDeploymentModal}
        onOpenChange={(value) => {
          setOpen(value)
          if (!value && setShowDeploymentModal) setShowDeploymentModal(false)
        }}
      >
        <DialogContent
          className="mx-auto max-w-[640px] !rounded-lg p-6"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <DialogHeader className="!text-start">
            <DialogTitle id="modal-title" className="text-display-md">
              {title}
            </DialogTitle>
          </DialogHeader>
          <p className="my-8 text-lg text-neutral-400">
            Your code needs to be deployed before you can run tests.
          </p>
          <div className="flex w-full gap-3">
            <Button
              variant="secondary"
              className="w-full flex-1 py-6"
              onClick={() => {
                setOpen(false)
                if (setShowDeploymentModal) setShowDeploymentModal(false)
              }}
              containerClass="w-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeployment}
              variant="primary"
              className="w-full flex-1 py-6"
              containerClass="w-full"
            >
              Deploy now
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )

  return (
    <Drawer open={open} onOpenChange={(value: boolean) => setOpen(value)}>
      <DrawerTrigger className="rounded-sm border-neutral-200 p-1 transition-all duration-300 ease-in-out hover:border-[0.3px] hover:bg-neutral-100">
        <Plus className="h-4 w-4" />
      </DrawerTrigger>
      <DrawerContent
        className="mx-auto px-4 pb-10"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <DrawerHeader className="px-0 pb-0 pt-4 !text-start">
          <DrawerTitle id="modal-title">{title}</DrawerTitle>
        </DrawerHeader>
        <p className="my-8 text-sm text-neutral-400">
          Your code needs to be deployed before you can run tests.
        </p>
        <div className="flex w-full flex-col-reverse gap-3">
          <Button
            variant="secondary"
            className="w-full flex-1 py-6"
            onClick={() => {
              setOpen(false)
              if (setShowDeploymentModal) setShowDeploymentModal(false)
            }}
            containerClass="w-full"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeployment}
            variant="primary"
            className="w-full flex-1 py-6"
            containerClass="w-full"
          >
            Deploy now
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default DeploymentModal
