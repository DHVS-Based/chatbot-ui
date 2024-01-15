import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
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

  const handleCreateFolder = async (e: React.MouseEvent<HTMLDivElement>) => {
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
      className="flex flex-col self-stretch"
      open={isExpanded}
      onOpenChange={setIsExpanded}
    >
      <CollapsibleTrigger asChild>
        <div className="group inline-flex cursor-pointer items-start gap-2 self-stretch px-2 py-1.5">
          {isExpanded ? (
            <IconChevronDown stroke={3} />
          ) : (
            <IconChevronRight stroke={3} />
          )}

          <div className="flex-1">
            {contentType.charAt(0).toUpperCase() +
              contentType.slice(1, contentType.length - 1)}{" "}
            Folders
          </div>

          <div className="inline-flex" onClick={handleCreateFolder}>
            <IconPlus stroke={2} />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="flex flex-col gap-2 self-stretch">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
