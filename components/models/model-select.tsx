import { ChatbotUIContext } from "@/context/context"
import { isModelLocked } from "@/lib/is-model-locked"
import { LLM, LLMID } from "@/types"
import { IconCheck, IconChevronDown, IconLock } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ModelIcon } from "./model-icon"
import { ModelOption } from "./model-option"

interface ModelSelectProps {
  hostedModelOptions: LLM[]
  localModelOptions: LLM[]
  selectedModelId: string
  onSelectModel: (modelId: LLMID) => void
}

export const ModelSelect: FC<ModelSelectProps> = ({
  hostedModelOptions,
  localModelOptions,
  selectedModelId,
  onSelectModel
}) => {
  const { profile } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"hosted" | "local">("hosted")

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleSelectModel = (modelId: LLMID) => {
    onSelectModel(modelId)
    setIsOpen(false)
  }

  const ALL_MODELS = [...hostedModelOptions, ...localModelOptions]

  const groupedModels = ALL_MODELS.reduce<Record<string, LLM[]>>(
    (groups, model) => {
      const key = model.provider
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(model)
      return groups
    },
    {}
  )

  const SELECTED_MODEL = ALL_MODELS.find(
    model => model.modelId === selectedModelId
  )

  if (!SELECTED_MODEL) return null
  if (!profile) return null

  const isLocked = isModelLocked(SELECTED_MODEL.provider, profile)

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger
        className="bg-gray-50hover:from-slate-300/10 w-full justify-start border-[1.5px] border-slate-300 bg-gradient-to-t from-slate-300/20 to-slate-300/0 px-3 py-5 hover:bg-gray-50/90 hover:to-slate-300/0
        dark:border-slate-800 dark:bg-slate-900/50 dark:bg-gradient-to-t dark:from-slate-800/20 dark:to-slate-800/0 dark:hover:from-slate-800/50 dark:hover:to-slate-800/0"
        asChild
      >
        <Button
          ref={triggerRef}
          className="flex items-center justify-between"
          variant="ghost"
        >
          <div className="flex items-center">
            {isLocked ? (
              <WithTooltip
                display={
                  <div>
                    Save {SELECTED_MODEL.provider} API key in profile settings
                    to unlock.
                  </div>
                }
                trigger={<IconLock className="mr-2" size={26} />}
              />
            ) : (
              <ModelIcon
                modelId={SELECTED_MODEL.modelId as LLMID}
                width={26}
                height={26}
              />
            )}

            <div className="ml-2 flex items-center">
              {SELECTED_MODEL.modelName}
            </div>
          </div>

          <IconChevronDown />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="space-y-2 overflow-auto p-2"
        style={{ width: triggerRef.current?.offsetWidth }}
        align="start"
      >
        <Tabs value={tab} onValueChange={(value: any) => setTab(value)}>
          <TabsList defaultValue="hosted" className="grid grid-cols-2">
            <TabsTrigger value="hosted">Hosted</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
          </TabsList>
        </Tabs>

        <Input
          ref={inputRef}
          className="w-full"
          placeholder="Search models..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="max-h-[300px] overflow-auto">
          {Object.entries(groupedModels).map(([provider, models]) => {
            const filteredModels = models
              .filter(model => {
                if (tab === "hosted") return model.provider !== "ollama"
                if (tab === "local") return model.provider === "ollama"
              })
              .filter(model =>
                model.modelName.toLowerCase().includes(search.toLowerCase())
              )
              .sort((a, b) => a.provider.localeCompare(b.provider))

            if (filteredModels.length === 0) return null

            return (
              <div key={provider}>
                <div className="mb-1 ml-2 text-xs font-bold tracking-wide opacity-50">
                  {provider === "openai" && profile.use_azure_openai
                    ? "AZURE OPENAI"
                    : provider.toLocaleUpperCase()}
                </div>

                <div className="mb-4">
                  {filteredModels.map(model => {
                    return (
                      <div
                        key={model.modelId}
                        className="flex items-center space-x-1"
                      >
                        {selectedModelId === model.modelId && (
                          <IconCheck className="ml-2" size={32} />
                        )}

                        <ModelOption
                          key={model.modelId}
                          model={model}
                          onSelect={() => handleSelectModel(model.modelId)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
