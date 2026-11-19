"use client";

import {
  useRef,
  useEffect,
  useContext,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ArrowUpDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import { DeleteRequest } from "~/utils/new-request";
import { showSuccess } from "~/components/toast/sonner";
import Loading from "~/components/ui/loading";
import { AddMembersModal } from "./add-members-modal";
import { ViewMembersModal } from "./view-members-modal";
import PinnedMessagesModal from "../pinned-messages/pinned-messages-modal";
import { useRBAC } from "~/hooks/useRBAC";
import { useConversationOrder } from "~/hooks/use-conversation-order";

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  participants?: { user_id?: string | number }[];
}

const MenuDropdown = ({ isOpen, onClose, participants }: MenuDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useContext(DataContext);
  const { orgSlug, orgId: stateOrgId, groupCallback, dms } = state;
  const [buttonLoading, setButtonLoading] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [viewMembersOpen, setViewMembersOpen] = useState(false);
  const [pinsOpen, setPinsOpen] = useState(false);
  const { isNewestAtTop, toggleOrder } = useConversationOrder();
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  const { hasPermission } = useRBAC();
  const canAddMembers =
    hasPermission("manage:members") || hasPermission("invite:members");

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
    "px-4 py-2 text-[15px] text-[#101828] hover:bg-[#F1F1FE] flex items-center justify-between cursor-pointer";
  const dividerClass = "h-px bg-[#E6EAEF]";

  const handleOpenViewMembers = () => {
    setViewMembersOpen(true);
    onClose();
  };

  const handleOpenAddMembers = () => {
    setAddMembersOpen(true);
    onClose();
  };

  const handleOpenPins = (event: ReactMouseEvent) => {
    event.stopPropagation();
    setPinsOpen(true);
    onClose();
  };

  const handleLeave = async () => {
    const orgId =
      stateOrgId ||
      (typeof window !== "undefined"
        ? localStorage.getItem("orgId") || ""
        : "");

    if (!orgId || !channelId) return;

    setButtonLoading(true);

    try {
      const res = await DeleteRequest(
        `/organisations/${orgId}/group-dms/${channelId}/leave`
      );

      if (res?.status === 200 || res?.status === 201) {
        dispatch({ type: ACTIONS.CLEAR_CHATS });
        dispatch({ type: ACTIONS.PARTICIPANTS, payload: [] });
        dispatch({
          type: ACTIONS.DMS,
          payload: (dms || []).filter(
            (dm: { channel_id?: string }) =>
              String(dm.channel_id) !== String(channelId)
          ),
        });
        dispatch({
          type: ACTIONS.GROUP_CALLBACK,
          payload: !groupCallback,
        });

        showSuccess(res?.data?.message || "You left the conversation");
        onClose();
        router.push(`/${orgSlug}/home/people`);
      }
    } finally {
      setButtonLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 w-[220px] mt-2.5 bg-white rounded-[7px] shadow-lg border border-[#E6EAEF] z-20"
        >
          <div>
            <div className={menuItemClass} onClick={handleOpenViewMembers}>
              View members
            </div>

            {canAddMembers ? (
              <div className={menuItemClass} onClick={handleOpenAddMembers}>
                Add members
              </div>
            ) : null}

            <div className={menuItemClass} onClick={handleOpenPins}>
              Pinned Message
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

            <div
              className={menuItemClass}
              onClick={() => {
                toggleOrder();
                onClose();
              }}
            >
              <span>
                {isNewestAtTop ? "Show oldest at top" : "Show newest at top"}
              </span>
              <ArrowUpDown className="w-4 h-4 text-[#667085]" />
            </div>

            <div className={dividerClass} />

            <div
              className={`${menuItemClass} text-[#B00E03]`}
              onClick={handleLeave}
            >
              Leave conversation
              {buttonLoading && (
                <Loading color="red" height="15px" width="15px" />
              )}
            </div>
          </div>
        </div>
      )}

      <ViewMembersModal
        isOpen={viewMembersOpen}
        onClose={() => setViewMembersOpen(false)}
        channelId={channelId}
        participants={participants}
      />

      <AddMembersModal
        isOpen={addMembersOpen}
        onClose={() => setAddMembersOpen(false)}
        channelId={channelId}
        existingParticipants={participants}
      />

      <PinnedMessagesModal
        open={pinsOpen}
        onOpenChange={setPinsOpen}
        channelId={channelId}
        scope="chat"
      />
    </>
  );
};

export default MenuDropdown;
