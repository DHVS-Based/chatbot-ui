import { ChatbotUIContext } from "@/context/context"
import { updateAssistant } from "@/db/assistants"
import { updateChat } from "@/db/chats"
import { updateCollection } from "@/db/collections"
import { updateFile } from "@/db/files"
import { updatePreset } from "@/db/presets"
import { updatePrompt } from "@/db/prompts"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { ContentType, DataItemType, DataListType } from "@/types"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { AssistantItem } from "./items/assistants/assistant-item"
import { ChatItem } from "./items/chat/chat-item"
import { CollectionItem } from "./items/collections/collection-item"
import { FileItem } from "./items/files/file-item"
import { Folder } from "./items/folders/folder-item"
import { PresetItem } from "./items/presets/preset-item"
import { PromptItem } from "./items/prompts/prompt-item"
import { FolderList } from "./items/folders/folder-list"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "../ui/collapsible"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"

interface SidebarDataListProps {
  contentType: ContentType
  data: DataListType
  folders: Tables<"folders">[]
}

export const SidebarDataList: FC<SidebarDataListProps> = ({
  contentType,
  data,
  folders
}) => {
  const {
    setChats,
    setPresets,
    setPrompts,
    setFiles,
    setCollections,
    setAssistants
  } = useContext(ChatbotUIContext)

  const divRef = useRef<HTMLDivElement>(null)

  const [isOverflowing, setIsOverflowing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)

  const getDataListComponent = (
    contentType: ContentType,
    item: DataItemType
  ) => {
    switch (contentType) {
      case "chats":
        return <ChatItem key={item.id} chat={item as Tables<"chats">} />

      case "presets":
        return <PresetItem key={item.id} preset={item as Tables<"presets">} />

      case "prompts":
        return <PromptItem key={item.id} prompt={item as Tables<"prompts">} />

      case "files":
        return <FileItem key={item.id} file={item as Tables<"files">} />

      case "collections":
        return (
          <CollectionItem
            key={item.id}
            collection={item as Tables<"collections">}
          />
        )

      case "assistants":
        return (
          <AssistantItem
            key={item.id}
            assistant={item as Tables<"assistants">}
          />
        )

      default:
        return null
    }
  }

  const updateFunctions = {
    chats: updateChat,
    presets: updatePreset,
    prompts: updatePrompt,
    files: updateFile,
    collections: updateCollection,
    assistants: updateAssistant
  }

  const stateUpdateFunctions = {
    chats: setChats,
    presets: setPresets,
    prompts: setPrompts,
    files: setFiles,
    collections: setCollections,
    assistants: setAssistants
  }

  const updateFolder = async (itemId: string, folderId: string | null) => {
    const item: any = data.find(item => item.id === itemId)

    if (!item) return null

    const updateFunction = updateFunctions[contentType]
    const setStateFunction = stateUpdateFunctions[contentType]

    if (!updateFunction || !setStateFunction) return

    const updatedItem = await updateFunction(item.id, {
      folder_id: folderId
    })

    setStateFunction((items: any) =>
      items.map((item: any) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    )
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    const target = e.target as Element

    if (!target.closest("#folder")) {
      const itemId = e.dataTransfer.getData("text/plain")
      updateFolder(itemId, null)
    }

    setIsDragOver(false)
  }

  useEffect(() => {
    if (divRef.current) {
      setIsOverflowing(
        divRef.current.scrollHeight > divRef.current.clientHeight
      )
    }
  }, [data])

  const dataWithFolders = data.filter(item => item.folder_id)

  const dataWithoutFolders = data.filter(item => item.folder_id === null)

  return (
    <>
      <div
        ref={divRef}
        className="flex h-full grow flex-col overflow-hidden"
        onDrop={handleDrop}
      >
        {data.length === 0 && (
          <div className="flex grow flex-col items-center justify-center">
            <div className=" text-centertext-muted-foreground p-8 text-lg italic">
              No {contentType}.
            </div>
          </div>
        )}

        {(dataWithFolders.length > 0 || dataWithoutFolders.length > 0) && (
          <div
            className={`h-full ${
              isOverflowing
                ? "flex w-[calc(100%-8px)] flex-col"
                : "flex w-full flex-col"
            } gap-2 ${isOverflowing ? "mr-2" : ""}`}
          >
            <FolderList contentType={contentType}>
              {folders.map(folder => (
                <Folder
                  key={folder.id}
                  folder={folder}
                  onUpdateFolder={updateFolder}
                >
                  {dataWithFolders
                    .filter(item => item.folder_id === folder.id)
                    .map(item => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={e => handleDragStart(e, item.id)}
                      >
                        {getDataListComponent(contentType, item)}
                      </div>
                    ))}
                </Folder>
              ))}
            </FolderList>

            <Collapsible
              className={"flex grow flex-col gap-2 overflow-hidden"}
              open={isExpanded}
              onOpenChange={setIsExpanded}
              onDrop={handleDrop}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
            >
              <CollapsibleTrigger asChild>
                <div className="group inline-flex cursor-pointer items-center gap-2 self-stretch px-2 py-1.5">
                  {isExpanded ? <IconChevronDown /> : <IconChevronRight />}

                  <div className="flex-1">
                    {contentType.charAt(0).toUpperCase() +
                      contentType.slice(1, contentType.length - 1)}
                    s
                  </div>
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent
                className={cn("overflow-auto", isDragOver && "bg-accent")}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
              >
                {dataWithoutFolders.map(item => {
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={e => handleDragStart(e, item.id)}
                    >
                      {getDataListComponent(contentType, item)}
                    </div>
                  )
                })}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    </>
  )
}
