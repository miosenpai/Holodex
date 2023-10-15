import {
  usePlaylistInclude,
  usePlaylistVideoMutation,
} from "@/services/playlist.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface VideoMenuProps extends Pick<VideoBase, "id" | "type" | "status"> {
  children: ReactNode;
}

export function VideoMenu({
  children,
  id: videoId,
  type,
  status,
}: VideoMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { data, isLoading } = usePlaylistInclude(videoId, { enabled: isOpen });
  const { mutate } = usePlaylistVideoMutation();

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={-60}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem asChild>
          <Link
            className="flex gap-2"
            to={`https://youtu.be/${videoId}`}
            target="_blank"
          >
            <div className="i-mdi:youtube" />
            {t("Open on YouTube")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className="flex gap-2" to={`/watch/${videoId}/edit`}>
            <div className="i-heroicons:pencil" />
            {t("Edit")}
          </Link>
        </DropdownMenuItem>
        {type !== "clip" && (
          <DropdownMenuItem asChild>
            <Link
              className="flex gap-2"
              to={`/multiview/AAUY${videoId}%2cUAEYchat`}
            >
              <div className="i-heroicons:rectangle-group" />
              {t("MultiView")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex gap-2">
              <div className="i-heroicons:queue-list" />
              {t("Playlist")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {data?.map(({ name, id }) => (
                  <DropdownMenuItem
                    key={id}
                    onClick={() => mutate({ id, videoId })}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
                {isLoading && (
                  <DropdownMenuItem className="justify-center" disabled>
                    <div className="leading-none i-lucide:loader-2 animate-spin" />
                  </DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuItem className="flex gap-2">
          <div className="i-heroicons:link" />
          {t("Copy Holodex link")}
        </DropdownMenuItem>
        {status === "upcoming" && (
          <DropdownMenuItem className="flex gap-2">
            <div className="i-heroicons:calendar" />
            {t("Add to Google calendar")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="flex gap-2">
          <div className="i-heroicons:newspaper" />
          {t("Open TL client")}
        </DropdownMenuItem>
        {status === "past" && (
          <DropdownMenuItem className="flex gap-2">
            <div className="i-heroicons:document-arrow-up" />
            {t("Upload TL Script")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="flex gap-2">
          <div className="i-heroicons:flag" />
          Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}