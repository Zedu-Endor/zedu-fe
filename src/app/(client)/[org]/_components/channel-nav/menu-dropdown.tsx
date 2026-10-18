"use client";

import ChannelDetailsDialog from "../channel-details-dialog";
import ChannelExportModal from "../channel-export/channel-export-modal";
import { useParams, useRouter } from "next/navigation";
import {
  useState,
  useRef,
  useEffect,
  useContext,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { cn } from "~/lib/utils";
import NotificationSettingsModal from "../notification-modal";
import { ACTIONS } from "~/store/Actions";
import { DataContext } from "~/store/GlobalState";
import { PostRequest } from "~/utils/new-request";
import { useRBAC } from "~/hooks/useRBAC";
import { LeaveChannelDialog } from "../channel-details-dialog/leave-channel-dialog";

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuDropdown = ({ isOpen, onClose }: MenuDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useContext(DataContext);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { hasPermission } = useRBAC();
  const canManageChannels = hasPermission("manage:channels");
  // channelDetails can still hold the previous channel while the new one loads,
  // so only use it when it belongs to the channel in the URL.
  const detailsMatch =
    String(state?.channelDetails?.channels_id || "") === String(id || "");
  const leaveChannelName = detailsMatch
    ? state?.channelDetails?.name || state?.channelName
    : state?.channelName;
  const leaveIsPrivate = detailsMatch
    ? Boolean(state?.channelDetails?.is_private)
    : undefined;

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isInsideDialog = (event.target as Element).closest(
        '[role="dialog"]'
      );
      if (isInsideDialog) return;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const menuItemClass =
    "px-4 py-[10px] text-[15px] text-[#101828] hover:bg-[#F1F1FE] flex items-center justify-between cursor-pointer";
  const dividerClass = "h-px bg-[#E6EAEF]";

  const handleLeave = async () => {
    setButtonLoading(true);

    const res = await PostRequest(`/channels/${id}/leave`, {});
    if (res?.status === 200 || res?.status === 201) {
      dispatch({
        type: ACTIONS.LEAVE_CALLBACK,
        payload: !state?.leaveCallback,
      });
      setLeaveOpen(false);
    }
    setButtonLoading(false);
  };

  const handleOpenLeave = (event: ReactMouseEvent) => {
    event.stopPropagation();
    setLeaveOpen(true);
    onClose();
  };

  const handleOpenExport = (event: ReactMouseEvent) => {
    event.stopPropagation();
    setExportOpen(true);
    onClose();
  };

  return (
    <>
      {isOpen ? (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 w-[220px] mt-2.5 bg-white rounded-[7px] shadow-lg border border-[#E6EAEF] z-20"
          onClick={() =>
            dispatch({ type: ACTIONS.ACTIVE_TAB, payload: "about" })
          }
        >
          <div>
            <ChannelDetailsDialog className={cn(menuItemClass, "w-full")}>
              Open channel details
            </ChannelDetailsDialog>

            <NotificationSettingsModal />

            <div className={menuItemClass} onClick={handleOpenExport}>
              Export
            </div>

            <div
              className={menuItemClass}
              onClick={() => {
                dispatch({
                  type: ACTIONS.CONVERSATION_SEARCH_OPEN,
                  payload: true,
                });
                onClose();
              }}
            >
              Search
            </div>

            {canManageChannels ? (
              <div
                className={menuItemClass}
                onClick={() => {
                  onClose();
                  router.push(
                    `/${state?.orgSlug}/home/channels/${id}/settings`
                  );
                }}
              >
                Channel settings
              </div>
            ) : null}

            <div className={dividerClass} />

            <div
              className={`${menuItemClass} text-[#B00E03]`}
              onClick={handleOpenLeave}
            >
              Leave channel
            </div>
          </div>
        </div>
      ) : null}

      <ChannelExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        channelId={id}
      />

      <LeaveChannelDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        channelName={leaveChannelName}
        isPrivate={leaveIsPrivate}
        loading={buttonLoading}
        onConfirm={handleLeave}
      />
    </>
  );
};

export default MenuDropdown;
