import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Checkbox } from '../ui/checkbox'
import { Button } from '../ui/button'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  tableName: string
  schemaData: {
    name: string
    lastUpdated: string
  }[]
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  tableName,
  schemaData,
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false)

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Delete Table</DialogTitle>
          <DialogDescription>
            The following columns and all the data associated with{' '}
            <strong>{tableName}</strong> will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 max-h-60 overflow-hidden rounded border border-[#E9EAEB] md:rounded-none">
          <div className="overflow-hidden rounded-md border">
            <div className="grid grid-cols-2 gap-3 bg-neutral-50 px-4 py-3 text-xs font-medium uppercase text-primary">
              <div>Name</div>
              <div className="text-right md:text-left">Last Updated</div>
            </div>
            {schemaData.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-3 border-t px-4 py-3 text-sm"
              >
                <div>{item.name}</div>
                <div className="text-right md:text-left">
                  {item.lastUpdated}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          Once deleted, this schema and its columns cannot be restored. This
          action is irreversible.
        </p>

        <div className="flex items-center gap-2 py-2">
          <Checkbox
            id="confirm-delete"
            checked={isConfirmed}
            onCheckedChange={(checked) => setIsConfirmed(!!checked)}
          />
          <label htmlFor="confirm-delete" className="text-sm text-neutral-500">
            I understand and confirm
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={!isConfirmed}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteModal
