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
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { WorkspaceSettings } from "../workspace/workspace-settings"
import { Avatar, AvatarFallback } from "../ui/avatar"

interface WorkspaceSwitcherProps {}

export const WorkspaceSwitcher: FC<WorkspaceSwitcherProps> = ({}) => {
  useHotkey(";", () => setOpen(prevState => !prevState))

  const { workspaces, selectedWorkspace, setSelectedWorkspace, setWorkspaces } =
    useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()

  const triggerRef = useRef<HTMLButtonElement>(null)

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
        className="flex h-[36px]
        w-full cursor-pointer items-center justify-between rounded-md border-[1.5px] border-slate-300 bg-gray-50
        bg-gradient-to-t from-slate-300/20 to-slate-300/0 px-2 py-1 hover:bg-gray-50/90 hover:from-slate-300/10 hover:to-slate-300/0
        dark:border-slate-800 dark:bg-slate-900/50 dark:bg-gradient-to-t dark:from-slate-800/20 dark:to-slate-800/0 dark:hover:from-slate-800/50 dark:hover:to-slate-800/0"
        ref={triggerRef}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedWorkspace?.is_home ? (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-base">
                <IconHome size={16} />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-sm">
                {getWorkspaceName(value)?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {getWorkspaceName(value) || "Select workspace..."}
        </div>

        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent
        className="border-[1.5px] bg-gray-50/80 bg-gradient-to-t from-slate-300/0 to-slate-300/20 p-0 shadow-lg backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/50 dark:bg-gradient-to-t dark:from-slate-800/10 dark:to-slate-800/0"
        style={{
          width: triggerRef.current?.offsetWidth
        }}
      >
        <div className="flex flex-col self-stretch">
          <div className="border-b border-slate-200 p-1.5 dark:border-slate-800/60">
            <div className="flex items-center gap-2 px-2">
              <IconSearch />

              <Input
                className="border-none bg-inherit px-0 py-1.5 text-base font-normal placeholder:text-slate-400"
                placeholder="Search workspaces..."
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col border-b border-slate-200 p-1.5 dark:border-slate-800/60">
            {workspaces
              .filter(workspace => workspace.is_home)
              .map(workspace => (
                <Button
                  key={workspace.id}
                  className="flex items-center justify-start gap-2 px-2 py-1.5 text-base font-normal hover:bg-slate-100/50 dark:hover:bg-slate-900/70"
                  variant="ghost"
                  onClick={() => handleSelect(workspace.id)}
                >
                  <IconHome />

                  <div className="text-base font-normal">{workspace.name}</div>
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
                  className="flex justify-start gap-2 truncate px-2 py-1.5 text-base font-normal hover:bg-slate-100/50 dark:hover:bg-slate-900/70"
                  variant="ghost"
                  onClick={() => handleSelect(workspace.id)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-base">
                      {workspace.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-base font-normal">{workspace.name}</div>
                </Button>
              ))}
          </div>
        </div>

        <div className="flex flex-col border-b border-slate-200 p-1.5 dark:border-slate-800/60">
          <WorkspaceSettings />
        </div>

        <div className="flex flex-col p-1.5">
          <Button
            className="flex w-full justify-start space-x-2 px-2 py-1.5 text-base font-normal hover:bg-slate-100/50 dark:hover:bg-slate-900/70"
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
