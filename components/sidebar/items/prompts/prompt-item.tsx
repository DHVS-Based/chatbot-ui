import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { PROMPT_NAME_MAX } from "@/db/limits"
import { Tables } from "@/supabase/types"
import { IconPencil } from "@tabler/icons-react"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"

interface PromptItemProps {
  prompt: Tables<"prompts">
}

export const PromptItem: FC<PromptItemProps> = ({ prompt }) => {
  const [name, setName] = useState(prompt.name)
  const [content, setContent] = useState(prompt.content)

  return (
    <SidebarItem
      item={prompt}
      contentType="prompts"
      icon={<IconPencil size={24} />}
      updateState={{ name, content }}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Prompt name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={PROMPT_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Prompt</Label>

            <TextareaAutosize
              placeholder="Prompt..."
              value={content}
              onValueChange={setContent}
              minRows={6}
              maxRows={20}
            />
          </div>
        </>
      )}
    />
  )
}
