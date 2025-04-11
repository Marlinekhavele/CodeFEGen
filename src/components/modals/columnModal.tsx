'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
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
import Logger from '~/utils/logger'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Input } from '../ui/input'

interface NewColumnProps {
  title: string
  description: string
}

const ColumnFormSchema = z.object({
  column_name: z
    .string()
    .min(1, { message: 'Column name is required.' })
    .min(2, { message: 'Column name must be at least 2 characters' }),
  foreign_key: z
    .string()
    .min(1, { message: 'Column name is required.' })
    .min(2, { message: 'Column name must be at least 2 characters' }),
  data_type: z.enum(['User ID', 'Order ID', 'Product ID'], {
    errorMap: () => ({ message: 'Please select a type.' }),
  }),
  constraint_type: z.enum(['User ID', 'Order ID', 'Product ID'], {
    errorMap: () => ({ message: 'Please select a constraint.' }),
  }),
})

const Column = ({ description }: NewColumnProps) => {
  const [open, setOpen] = useState(true)
  const width = useWindowWidth()

  const handleSubmit = async (values: z.infer<typeof ColumnFormSchema>) => {
    Logger.log('is dirty...', isDirty)
    Logger.log(values)
  }

  const form = useForm<z.infer<typeof ColumnFormSchema>>({
    resolver: zodResolver(ColumnFormSchema),
    defaultValues: {
      column_name: '',
      foreign_key: '',
      data_type: undefined,
      constraint_type: undefined,
    },
  })

  const { isDirty, isSubmitting } = form.formState
  if (width > 640)
    return (
      <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
        <DialogTrigger className="rounded-sm border-neutral-200 p-1 transition-all duration-300 ease-in-out hover:border-[0.3px] hover:bg-neutral-100">
          <Plus className="h-4 w-4" />
        </DialogTrigger>
        <DialogContent
          className="mx-auto max-w-[640px] !rounded-lg pb-10"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <DialogHeader className="mb-2 !text-start">
            <DialogTitle
              id="modal-title"
              className="border-b border-[#C0C0C1] pb-4"
            >
              Create a column
            </DialogTitle>
            <DialogDescription id="modal-description">
              {description}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="rounded-x flex w-full flex-col gap-6"
            >
              <FormField
                name="column_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="text-[16px] font-medium">
                      Column Name <span className="text-warning-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder='e.g "ID", "Email"'
                        className="rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[592px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col">
                <DropdownMenu>
                  <DropdownMenuLabel className="mb-1">
                    Data Type <span className="text-warning-500">*</span>
                  </DropdownMenuLabel>
                  <DropdownMenuTrigger asChild>
                    <div
                      className={`text-gray-700 flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[592px] ${
                        form.watch('data_type')
                          ? 'font-normal text-neutral-400'
                          : 'text-neutral-400'
                      }`}
                    >
                      {form.watch('data_type') || 'Select a type'}
                      <ChevronDownIcon className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="lg:w-[592px]">
                    <DropdownMenuItem
                      onSelect={() => form.setValue('data_type', 'User ID')}
                    >
                      User ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => form.setValue('data_type', 'Order ID')}
                    >
                      Order ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => form.setValue('data_type', 'Product ID')}
                    >
                      Product ID
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuLabel className="mb-1 mt-5">
                    Constraints{' '}
                    <span className="text-sm font-medium text-neutral-500">
                      (Optional)
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuTrigger asChild>
                    <div
                      className={`text-gray-700 flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[592px] ${
                        form.watch('data_type')
                          ? 'font-normal text-neutral-400'
                          : 'text-neutral-400'
                      }`}
                    >
                      {form.watch('constraint_type') || 'Select a constraint'}
                      <ChevronDownIcon className="h-4 w-4" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="lg:w-[592px]">
                    <DropdownMenuItem
                      onSelect={() =>
                        form.setValue('constraint_type', 'User ID')
                      }
                    >
                      User ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        form.setValue('constraint_type', 'Order ID')
                      }
                    >
                      Order ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() =>
                        form.setValue('constraint_type', 'Product ID')
                      }
                    >
                      Product ID
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <FormField
                name="foreign_key"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <FormLabel className="text-[16px] font-medium">
                      Foreign Key{' '}
                      <span className="text-sm font-medium text-neutral-500">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter Column Name"
                        className="rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[592px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <p className="text-sm font-normal text-black">
                  Ensure the column it refers to contains data
                </p>
              </div>
              <DialogFooter>
                <div className="grid w-full items-center justify-center gap-2 sm:grid-cols-2 sm:flex-row">
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm hover:bg-[rgba(31,21,46,0.05)]"
                    >
                      Cancel
                    </button>
                  </DialogClose>
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={!isDirty}
                    isLoading={isSubmitting}
                  >
                    {isSubmitting ? 'Saving' : 'Save'}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
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
        aria-describedby="modal-description "
      >
        <DrawerHeader className="mb-2 !text-start">
          <DrawerTitle
            id="modal-title"
            className="border-b border-[#C0C0C1] pb-4"
          >
            Create a column
          </DrawerTitle>
          <DrawerDescription id="modal-description">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="rounded-x flex w-full flex-col gap-6"
          >
            <FormField
              name="column_name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="text-[16px] font-medium">
                    Column Name <span className="text-warning-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder='e.g "ID", "Email"'
                      className="rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[592px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <DropdownMenu>
                <DropdownMenuLabel className="mb-1">
                  Data Type <span className="text-warning-500">*</span>
                </DropdownMenuLabel>
                <DropdownMenuTrigger asChild>
                  <div
                    className={`text-gray-700 flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[592px] ${
                      form.watch('data_type')
                        ? 'font-normal text-neutral-400'
                        : 'text-neutral-400'
                    }`}
                  >
                    {form.watch('data_type') || 'Select a type'}
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[360px] lg:w-[592px]">
                  <DropdownMenuItem
                    onSelect={() => form.setValue('data_type', 'User ID')}
                  >
                    User ID
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => form.setValue('data_type', 'Order ID')}
                  >
                    Order ID
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => form.setValue('data_type', 'Product ID')}
                  >
                    Product ID
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuLabel className="mb-1 mt-5">
                  Constraints{' '}
                  <span className="text-sm font-medium text-neutral-500">
                    (Optional)
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuTrigger asChild>
                  <div
                    className={`text-gray-700 flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[592px] ${
                      form.watch('constraint_type')
                        ? 'font-normal text-neutral-400'
                        : 'text-neutral-400'
                    }`}
                  >
                    {form.watch('constraint_type') || 'Select a constraint'}
                    <ChevronDownIcon className="h-4 w-4" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[360px] lg:w-[592px]">
                  <DropdownMenuItem
                    onSelect={() => form.setValue('constraint_type', 'User ID')}
                  >
                    User ID
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      form.setValue('constraint_type', 'Order ID')
                    }
                  >
                    Order ID
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      form.setValue('constraint_type', 'Product ID')
                    }
                  >
                    Product ID
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <FormField
              name="foreign_key"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel className="text-[16px] font-medium">
                    Foreign Key{' '}
                    <span className="text-sm font-medium text-neutral-500">
                      (Optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter Column Name"
                      className="rounded-[8px] border border-[#C0C0C1] bg-transparent px-[14px] py-[10px] text-[16px] placeholder:text-[#667085] focus:outline-none lg:w-[592px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex">
              <p className="text-sm font-normal text-black">
                Ensure the column it refers to contains data
              </p>
            </div>
            <DrawerFooter>
              <div className="grid w-full items-center justify-center gap-2 sm:grid-cols-2 sm:flex-row">
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="border-gray-300 w-[327px] rounded-md border border-neutral-100 bg-white px-4 py-2 text-sm hover:bg-[rgba(31,21,46,0.05)]"
                  >
                    Cancel
                  </button>
                </DrawerClose>
                <Button
                  type="submit"
                  variant="primary"
                  className="w-[327px] lg:w-[290px]"
                  disabled={!isDirty}
                  isLoading={isSubmitting}
                >
                  {isSubmitting ? 'Saving' : 'Save'}
                </Button>
              </div>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}

export default Column
