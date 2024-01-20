import { ContentType } from "@/types"
import { FC } from "react"
import { Input } from "../ui/input"
import { IconSearch } from "@tabler/icons-react"

interface SidebarSearchProps {
  contentType: ContentType
  searchTerm: string
  setSearchTerm: Function
}

export const SidebarSearch: FC<SidebarSearchProps> = ({
  contentType,
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="flex h-9 items-center gap-2 overflow-hidden rounded-md border border-slate-300 px-2 dark:border-slate-800">
      <IconSearch />

      <Input
        className="border-none p-0 text-base font-normal"
        placeholder={`Search ${contentType}...`}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
    </div>
  )
}
