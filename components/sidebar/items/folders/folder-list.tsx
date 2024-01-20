import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChatbotUIContext } from "@/context/context"
import { createFolder } from "@/db/folders"
import { ContentType } from "@/types"
import {
  IconChevronDown,
  IconChevronRight,
  IconPlus
} from "@tabler/icons-react"
import { FC, ReactNode, useContext, useState } from "react"

interface FolderListProps {
  contentType: ContentType
  children: ReactNode
}

export const FolderList: FC<FolderListProps> = ({ contentType, children }) => {
  const { profile, selectedWorkspace, folders, setFolders } =
    useContext(ChatbotUIContext)

  const [isExpanded, setIsExpanded] = useState(false)

  const handleCreateFolder = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()

    if (!profile) return
    if (!selectedWorkspace) return

    const createdFolder = await createFolder({
      user_id: profile.user_id,
      workspace_id: selectedWorkspace.id,
      name: "New Folder",
      description: "",
      type: contentType
    })
    setFolders([...folders, createdFolder])
  }

  return (
    <Collapsible
      className="flex flex-col gap-2 self-stretch"
      open={isExpanded}
      onOpenChange={setIsExpanded}
    >
      <CollapsibleTrigger asChild>
        <div className="group relative inline-flex cursor-pointer items-center gap-2 self-stretch px-2 py-1.5">
          {isExpanded ? <IconChevronDown /> : <IconChevronRight />}

          <div className="flex-1">
            {contentType.charAt(0).toUpperCase() +
              contentType.slice(1, contentType.length - 1)}{" "}
            Folders
          </div>

          <Button
            className="h-6 w-6 p-0"
            variant="ghost"
            onClick={handleCreateFolder}
          >
            <IconPlus />
          </Button>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="flex max-h-56 flex-col gap-2 self-stretch overflow-auto">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
