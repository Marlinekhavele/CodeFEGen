import {
  DropdownMenu,
  DropdownMenuContent,
} from '~/components/ui/dropdown-menu'
import { USE_CASES } from './links'
import Link from 'next/link'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { cn } from '~/utils'
import { useState } from 'react'

const UseCaseDropdown = ({
  pathname,
  setIsModalOpen,
}: {
  pathname: string
  setIsModalOpen: (value: boolean) => void
}) => {
  const [open, setOpen] = useState(false)
  return (
    <DropdownMenu open={open} onOpenChange={(value) => setOpen(value)}>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-black focus:outline-none dark:text-white">
        <span>Use cases</span>
        <ChevronDown
          className={cn(
            'transition-translate size-4 duration-300 ease-in-out',
            { '-rotate-180': open }
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-md border border-neutral-300 bg-white px-2 shadow-md dark:bg-dark-blue">
        <ul className="flex flex-col gap-2">
          {USE_CASES.map(({ user, link }, index) => {
            return (
              <Link
                className={cn(
                  'py-1 text-sm text-black hover:text-secondary-700 dark:text-white dark:hover:text-secondary-500',
                  {
                    'font-bold text-secondary-700': pathname === link,
                  }
                )}
                key={`${link}-${index}`}
                href={link}
                onClick={() => {
                  setIsModalOpen(false)
                  setOpen(false)
                }}
              >
                {user}
              </Link>
            )
          })}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UseCaseDropdown
