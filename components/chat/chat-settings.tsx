import { ChatbotUIContext } from "@/context/context"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { IconAdjustmentsHorizontal } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { ChatSettingsForm } from "../ui/chat-settings-form"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface ChatSettingsProps {}

export const ChatSettings: FC<ChatSettingsProps> = ({}) => {
  useHotkey("i", () => handleClick())

  const { chatSettings, setChatSettings } = useContext(ChatbotUIContext)

  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = () => {
    if (buttonRef.current) {
      buttonRef.current.click()
    }
  }

  useEffect(() => {
    if (!chatSettings) return

    setChatSettings({
      ...chatSettings,
      temperature: Math.min(
        chatSettings.temperature,
        CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_TEMPERATURE || 1
      ),
      contextLength: Math.min(
        chatSettings.contextLength,
        CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_CONTEXT_LENGTH || 4096
      )
    })
  }, [chatSettings?.model])

  if (!chatSettings) return null

  const fullModel = LLM_LIST.find(llm => llm.modelId === chatSettings.model)

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          ref={buttonRef}
          className="flex items-center gap-2 bg-transparent px-3"
          variant="outline"
        >
          {fullModel?.modelName || chatSettings.model}

          <IconAdjustmentsHorizontal />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="relative flex max-h-[calc(100vh-60px)] w-[300px] flex-col space-y-4 overflow-auto rounded-lg p-6 sm:w-[400px] md:w-[500px] lg:w-[600px]"
        align="center"
      >
        <ChatSettingsForm
          chatSettings={chatSettings}
          onChangeChatSettings={setChatSettings}
        />
      </PopoverContent>
    </Popover>
  )
}
