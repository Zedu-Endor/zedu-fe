"use client";

import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import Loading from "~/components/ui/loading";

interface LeaveChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelName?: string;
  /** Leave undefined when privacy isn't known yet; a neutral message is shown. */
  isPrivate?: boolean;
  loading?: boolean;
  /** Disables "Leave channel" until the details belong to the channel being left. */
  confirmDisabled?: boolean;
  onConfirm: () => void;
}

export const LeaveChannelDialog = ({
  open,
  onOpenChange,
  channelName,
  isPrivate,
  loading,
  confirmDisabled,
  onConfirm,
}: LeaveChannelDialogProps) => {
  const name = channelName ? `#${channelName}` : "this channel";
  const message =
    isPrivate === true
      ? "This is a private channel. Once you leave, you won't see its messages, and you'll need to be invited again to rejoin."
      : isPrivate === false
        ? "You'll stop receiving messages from this channel. You can rejoin it any time from the channel directory."
        : "You'll stop receiving messages from this channel. If it's private, you'll need to be invited again to rejoin.";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Keep the dialog open while the leave request is in flight;
        // the caller closes it after success.
        if (!next && loading) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        onClick={(e) => e.stopPropagation()}
        className="p-0 gap-0 bg-background dark:bg-[#222529]"
      >
        <DialogHeader className="py-4 px-6 border-b border-[#E6EAEF] dark:border-white/10">
          <DialogTitle className="font-black text-[1.375rem] text-[#1D2939] dark:text-zinc-100 break-words pr-10">
            Leave {name}?
          </DialogTitle>
        </DialogHeader>

        <DialogClose className="absolute right-5 top-4 text-[#344054] dark:text-zinc-300 p-1 border border-input dark:border-white/15 rounded-[0.3125rem]">
          <X className="size-5 text-[#344054] dark:text-zinc-300" />
        </DialogClose>

        <DialogDescription
          asChild
          className="text-sm text-[#344054] dark:text-zinc-300 p-5"
        >
          <p>{message}</p>
        </DialogDescription>

        <DialogFooter className="flex justify-end space-x-2 p-5">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={loading || confirmDisabled}
            variant="destructive"
          >
            Leave channel {loading && <Loading />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
