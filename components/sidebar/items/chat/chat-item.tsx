import { ModelIcon } from "@/components/models/model-icon"
import { ChatbotUIContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { LLM } from "@/types"
import { IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { FC, useContext, useRef } from "react"
import { DeleteChat } from "./delete-chat"
import { UpdateChat } from "./update-chat"

interface ChatItemProps {
  chat: Tables<"chats">
}

export const ChatItem: FC<ChatItemProps> = ({ chat }) => {
  const { selectedChat, availableLocalModels, assistantImages } =
    useContext(ChatbotUIContext)

  const router = useRouter()
  const params = useParams()
  const isActive = params.chatid === chat.id || selectedChat?.id === chat.id

  const itemRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    router.push(`/chat/${chat.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  const MODEL_DATA = [...LLM_LIST, ...availableLocalModels].find(
    llm => llm.modelId === chat.model
  ) as LLM

  const assistantImage = assistantImages.find(
    image => image.assistantId === chat.assistant_id
  )?.base64

  return (
    <div
      ref={itemRef}
      className={cn(
        "hover:bg-accent/50 focus:bg-accent flex w-full cursor-pointer items-center rounded-md p-2 focus:outline-none",
        isActive && "bg-accent"
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    >
      {chat.assistant_id ? (
        assistantImage ? (
          <Image
            className="rounded"
            src={assistantImage}
            alt="Assistant image"
            width={24}
            height={24}
          />
        ) : (
          <IconRobotFace
            className="bg-primary text-secondary border-primary rounded border-[1px] p-1"
            size={24}
          />
        )
      ) : (
        <ModelIcon modelId={MODEL_DATA?.modelId} height={24} width={24} />
      )}

      <div className="ml-3 flex-1 truncate text-base font-normal">
        {chat.name}
      </div>

      {isActive && (
        <div
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className="ml-2 flex space-x-2"
        >
          <UpdateChat chat={chat} />

          <DeleteChat chat={chat} />
        </div>
      )}
    </div>
  )
}
