import { exportLocalStorageAsJSON } from "@/lib/export-old-data"
import { ContentType } from "@/types"
import {
  IconAdjustmentsHorizontal,
  IconFile,
  IconFileDownload,
  IconMessage,
  IconPencil
} from "@tabler/icons-react"
import { FC } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  return (
    <div className="flex flex-col justify-between border-r-2 px-1 pb-8 pt-3">
      <TabsList className="bg-background flex flex-1 flex-col items-center justify-start gap-4 p-0">
        <SidebarSwitchItem
          icon={<IconMessage size={SIDEBAR_ICON_SIZE} />}
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />}
          contentType="presets"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconPencil size={SIDEBAR_ICON_SIZE} />}
          contentType="prompts"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
          contentType="files"
          onContentTypeChange={onContentTypeChange}
        />

        {/* TODO */}
        {/* <SidebarSwitchItem
          icon={<IconBooks size={SIDEBAR_ICON_SIZE} />}
          contentType="collections"
          onContentTypeChange={onContentTypeChange}
        /> */}

        {/* TODO */}
        {/* <SidebarSwitchItem
          icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} />}
          contentType="assistants"
          onContentTypeChange={onContentTypeChange}
        /> */}
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        {/* TODO */}
        {/* <WithTooltip display={<div>Import</div>} trigger={<Import />} /> */}

        {/* TODO */}
        {/* <Alerts /> */}

        <WithTooltip
          display={
            <div>Download Chatbot UI 1.0 data as JSON. Import coming soon!</div>
          }
          trigger={
            <IconFileDownload size={32} onClick={exportLocalStorageAsJSON} />
          }
        />

        <WithTooltip
          display={<div>Profile Settings</div>}
          trigger={<ProfileSettings />}
        />
      </div>
    </div>
  )
}
