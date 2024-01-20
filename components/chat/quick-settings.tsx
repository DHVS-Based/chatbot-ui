import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { LLMID } from "@/types"
import { IconChevronDown, IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { ModelIcon } from "../models/model-icon"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { QuickSettingOption } from "./quick-setting-option"

interface QuickSettingsProps {}

export const QuickSettings: FC<QuickSettingsProps> = ({}) => {
  const {
    presets,
    assistants,
    selectedAssistant,
    selectedPreset,
    chatSettings,
    setSelectedPreset,
    setSelectedAssistant,
    setChatSettings,
    assistantImages
  } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleSelectQuickSetting = (
    item: Tables<"presets"> | Tables<"assistants">,
    contentType: "presets" | "assistants"
  ) => {
    if (contentType === "assistants") {
      setSelectedAssistant(item as Tables<"assistants">)
      setSelectedPreset(null)
    } else if (contentType === "presets") {
      setSelectedPreset(item as Tables<"presets">)
      setSelectedAssistant(null)
    }

    setChatSettings({
      model: item.model as LLMID,
      prompt: item.prompt,
      temperature: item.temperature,
      contextLength: item.context_length,
      includeProfileContext: item.include_profile_context,
      includeWorkspaceInstructions: item.include_workspace_instructions,
      embeddingsProvider: item.embeddings_provider as "openai" | "local"
    })
  }

  const checkIfModified = () => {
    if (!chatSettings) return false

    if (selectedPreset) {
      if (
        selectedPreset.include_profile_context !==
          chatSettings.includeProfileContext ||
        selectedPreset.include_workspace_instructions !==
          chatSettings.includeWorkspaceInstructions ||
        selectedPreset.context_length !== chatSettings.contextLength ||
        selectedPreset.model !== chatSettings.model ||
        selectedPreset.prompt !== chatSettings.prompt ||
        selectedPreset.temperature !== chatSettings.temperature
      ) {
        return true
      }
    } else if (selectedAssistant) {
      if (
        selectedAssistant.include_profile_context !==
          chatSettings.includeProfileContext ||
        selectedAssistant.include_workspace_instructions !==
          chatSettings.includeWorkspaceInstructions ||
        selectedAssistant.context_length !== chatSettings.contextLength ||
        selectedAssistant.model !== chatSettings.model ||
        selectedAssistant.prompt !== chatSettings.prompt ||
        selectedAssistant.temperature !== chatSettings.temperature
      ) {
        return true
      }
    }

    return false
  }

  const isModified = checkIfModified()

  const items = [
    ...presets.map(preset => ({ ...preset, contentType: "presets" })),
    ...assistants.map(assistant => ({
      ...assistant,
      contentType: "assistants"
    }))
  ]

  const selectedAssistantImage = selectedPreset
    ? ""
    : assistantImages.find(
        image => image.path === selectedAssistant?.image_path
      )?.base64 || ""

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger
        className="w-full justify-start border-[1.5px] border-slate-300 bg-gray-50 bg-gradient-to-t from-slate-300/20 to-slate-300/0 px-3 py-5 hover:bg-gray-50/90 hover:from-slate-300/10 hover:to-slate-300/0
        dark:border-slate-800 dark:bg-slate-900/50 dark:bg-gradient-to-t dark:from-slate-800/20 dark:to-slate-800/0 dark:hover:from-slate-800/50 dark:hover:to-slate-800/0"
        asChild
      >
        <Button
          ref={triggerRef}
          className="flex items-center justify-between"
          variant="ghost"
        >
          <div className="flex items-center gap-2">
            {selectedPreset && (
              <ModelIcon
                modelId={selectedPreset.model}
                width={26}
                height={26}
              />
            )}

            {selectedAssistant &&
              (selectedAssistantImage ? (
                <Image
                  className="rounded"
                  src={selectedAssistantImage}
                  alt="Assistant"
                  width={32}
                  height={32}
                />
              ) : (
                <IconRobotFace
                  className="bg-primary text-secondary border-primary rounded border-[1px] p-1"
                  size={32}
                />
              ))}

            <div className="overflow-hidden text-ellipsis">
              {isModified &&
                (selectedPreset || selectedAssistant) &&
                "Modified "}

              {selectedPreset?.name ||
                selectedAssistant?.name ||
                "Load a Preset"}
            </div>
          </div>

          <IconChevronDown className="ml-1" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="space-y-4"
        style={{ width: triggerRef.current?.offsetWidth }}
        align="start"
      >
        {presets.length === 0 && assistants.length === 0 ? (
          <div className="p-8 text-center">No items found.</div>
        ) : (
          <>
            <Input
              ref={inputRef}
              className="w-full"
              placeholder="Search presets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
            />

            {!!(selectedPreset || selectedAssistant) && (
              <QuickSettingOption
                contentType={selectedPreset ? "presets" : "assistants"}
                isSelected={true}
                item={
                  selectedPreset ||
                  (selectedAssistant as
                    | Tables<"presets">
                    | Tables<"assistants">)
                }
                onSelect={() => {
                  setSelectedPreset(null)
                  setSelectedAssistant(null)
                }}
                image={selectedPreset ? "" : selectedAssistantImage}
              />
            )}

            {items
              .filter(
                item =>
                  item.name.toLowerCase().includes(search.toLowerCase()) &&
                  item.id !== selectedPreset?.id &&
                  item.id !== selectedAssistant?.id
              )
              .map(({ contentType, ...item }) => (
                <QuickSettingOption
                  key={item.id}
                  contentType={contentType as "presets" | "assistants"}
                  isSelected={false}
                  item={item}
                  onSelect={() =>
                    handleSelectQuickSetting(
                      item,
                      contentType as "presets" | "assistants"
                    )
                  }
                  image={
                    contentType === "assistants"
                      ? assistantImages.find(
                          image =>
                            image.path ===
                            (item as Tables<"assistants">).image_path
                        )?.base64 || ""
                      : ""
                  }
                />
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
