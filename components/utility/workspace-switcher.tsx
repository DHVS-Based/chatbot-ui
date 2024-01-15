"use client"

import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { ChatbotUIContext } from "@/context/context"
import { createWorkspace } from "@/db/workspaces"
import useHotkey from "@/lib/hooks/use-hotkey"
import { IconHome, IconPlus, IconSearch } from "@tabler/icons-react"
import { ChevronsUpDown } from "lucide-react"
import { FC, useContext, useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { WorkspaceSettings } from "../workspace/workspace-settings"

interface WorkspaceSwitcherProps {}

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({}) => {
  useHotkey(";", () => setOpen(prevState => !prevState))

  const { workspaces, selectedWorkspace, setSelectedWorkspace, setWorkspaces } =
    useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [search, setSearch] = useState("")

  const handleCreateWorkspace = async () => {
    if (!selectedWorkspace) return

    const createdWorkspace = await createWorkspace({
      user_id: selectedWorkspace.user_id,
      default_context_length: selectedWorkspace.default_context_length,
      default_model: selectedWorkspace.default_model,
      default_prompt: selectedWorkspace.default_prompt,
      default_temperature: selectedWorkspace.default_temperature,
      description: "",
      embeddings_provider: "openai",
      include_profile_context: selectedWorkspace.include_profile_context,
      include_workspace_instructions:
        selectedWorkspace.include_workspace_instructions,
      instructions: selectedWorkspace.instructions,
      is_home: false,
      name: "New Workspace"
    })

    setWorkspaces([...workspaces, createdWorkspace])
    setSelectedWorkspace(createdWorkspace)
    setOpen(false)

    handleNewChat()
  }

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(workspace => workspace.id === workspaceId)

    if (!workspace) return

    return workspace.name
  }

  const handleSelect = (workspaceId: string) => {
    const workspace = workspaces.find(workspace => workspace.id === workspaceId)

    if (!workspace) return

    setSelectedWorkspace(workspace)
    setOpen(false)
  }

  useEffect(() => {
    if (!selectedWorkspace) return

    setValue(selectedWorkspace.id)
  }, [selectedWorkspace])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="border-input flex h-[36px]
        w-full cursor-pointer items-center justify-between rounded-md border px-2 py-1 hover:opacity-50"
      >
        <div className="flex items-center truncate">
          {selectedWorkspace?.is_home && (
            <IconHome className="mb-0.5 mr-2" size={16} />
          )}

          {getWorkspaceName(value) || "Select workspace..."}
        </div>

        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent className="p-0">
        <div className="flex flex-col self-stretch">
          <div className="border-b p-1.5">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <IconSearch />

              <Input
                className="border-none p-0"
                placeholder="Search workspaces..."
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col border-b p-1.5">
            {workspaces
              .filter(workspace => workspace.is_home)
              .map(workspace => (
                <Button
                  key={workspace.id}
                  className="flex items-center justify-start"
                  variant="ghost"
                  onClick={() => handleSelect(workspace.id)}
                >
                  <IconHome className="mr-2" size={20} />
                  <div className="text-lg">{workspace.name}</div>
                </Button>
              ))}

            {workspaces
              .filter(
                workspace =>
                  !workspace.is_home &&
                  workspace.name.toLowerCase().includes(search.toLowerCase())
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(workspace => (
                <Button
                  key={workspace.id}
                  className="flex justify-start truncate"
                  variant="ghost"
                  onClick={() => handleSelect(workspace.id)}
                >
                  <div className="text-lg">{workspace.name}</div>
                </Button>
              ))}
          </div>
        </div>

        <div className="flex flex-col border-b p-1.5">
          <WorkspaceSettings />
        </div>

        <div className="flex flex-col border-b p-1.5">
          <Button
            className="flex w-full justify-start space-x-2 px-2 py-1.5"
            size="sm"
            variant="ghost"
            onClick={handleCreateWorkspace}
          >
            <IconPlus />
            <div className="ml-2">New Workspace</div>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
