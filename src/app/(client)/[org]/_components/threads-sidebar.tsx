"use client";
import React, { useContext } from "react";
import { DataContext } from "~/store/GlobalState";
import { ACTIONS } from "~/store/Actions";
import MessageBox from "./message-box";
import { ArrowUpDown, X } from "lucide-react";
import ReplyMessage from "./reply-message";
import ReplyConnection from "~/components/layout/centrifugo/reply-connection";
import { useThreadOrder } from "~/hooks/use-conversation-order";

export const THREADS_SIDEBAR_WIDTH_PX = 440;

export const threadsSidebarPanelClassName =
  "h-full w-full max-w-[100vw] sm:w-[440px] sm:max-w-[440px] bg-white border-l border-[#E6EAEF] " +
  "max-sm:fixed max-sm:inset-x-0 max-sm:top-[60px] max-sm:bottom-0 max-sm:z-50";

export function getThreadsSidebarLayoutWidth(
  replyOpen: boolean,
  isSmUp: boolean
): number {
  if (!replyOpen) return 0;
  return isSmUp ? THREADS_SIDEBAR_WIDTH_PX : 0;
}

const ThreadsSidebar = ({ handleSendMessage, fetchMoreData, hasMore }: any) => {
  const { state, dispatch } = useContext(DataContext);
  const { isNewestAtTop, toggleOrder } = useThreadOrder();

  const onClose = () => {
    dispatch({ type: ACTIONS.REPLY, payload: false });
    dispatch({ type: ACTIONS.IS_EDIT_REPLY, payload: false });
    dispatch({ type: ACTIONS.LOAD_THREAD, payload: !state.loadThread });
  };

  return (
    <div className="relative h-[calc(100vh-80px)] w-full overflow-y-auto">
      <ReplyConnection />

      <div className="relative flex min-h-[56px] shrink-0 items-center justify-between border-b px-4 font-bold text-base sm:min-h-[70px] sm:px-5 lg:text-lg">
        <div className="flex items-center gap-2">
          <span>Thread</span>
          <button
            type="button"
            onClick={toggleOrder}
            className="flex items-center gap-1 rounded-md border border-[#E6EAEF] px-2 py-0.5 text-xs font-normal text-[#475467] hover:bg-[#F9FAFB] transition-colors"
            title={
              isNewestAtTop
                ? "Showing newest replies at top. Click for oldest first."
                : "Showing oldest replies first. Click for newest at top."
            }
            aria-label="Toggle reply sort order"
          >
            <ArrowUpDown className="size-3 text-[#667085]" />
            <span>{isNewestAtTop ? "Newest at top" : "Oldest first"}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-[0.3125rem] border border-input p-1 text-[#344054]"
          aria-label="Close thread"
        >
          <X className="size-5 text-[#344054]" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ReplyMessage
          fetchMoreData={fetchMoreData}
          hasMore={hasMore}
          isNewestAtTop={isNewestAtTop}
        />
      </div>

      <div className="shrink-0 bg-white pb-[env(safe-area-inset-bottom)]">
        <MessageBox
          subscription={state?.replySubscription}
          sendMessage={handleSendMessage}
          show={false}
          showTyping={false}
          draftKey={`thread:${state?.thread?.thread_id || "open"}`}
        />
      </div>
    </div>
  );
};

export default ThreadsSidebar;
