"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "~/components/ui/dialog";
import { useDeleteFile } from "~/hooks/useDeleteFile";

interface DeleteFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (value: boolean) => void;
  fileName: string;
  fileId: string;
  viewType?: string;
}

const DeleteFileModal: React.FC<DeleteFileModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  fileName,
  fileId,
  viewType,
}) => {
  const { deleteFile, isLoading } = useDeleteFile();
  const isPermanent = viewType === "Deleted Files";

  const handleDelete = async () => {
    const success = await deleteFile(fileId, isPermanent);
    onDelete(success);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay>
        <DialogContent className="w-fit max-w-md px-0">
          <DialogHeader className="">
            <DialogTitle className="px-6 pb-4 tracking-wide border-b-2 border-[#5F5FE1]">
              {isPermanent ? "Delete file permanently?" : "Delete file?"}
            </DialogTitle>
          </DialogHeader>
          <div className="px-6 mt-2 w-full">
            <p className="text-sm text-[#1D2939] leading-relaxed break-words">
              {isPermanent ? (
                <>
                  This action will{" "}
                  <span className="font-extrabold text-[#D31103]">
                    permanently delete
                  </span>{" "}
                  <span className="font-extrabold break-all">{fileName}</span>.
                  This cannot be undone.
                </>
              ) : (
                <>
                  This action will delete{" "}
                  <span className="font-extrabold break-all">{fileName}</span>.
                  You can restore it anytime from the Deleted Files section.
                </>
              )}
            </p>
            <div className="place-self-end mt-5 flex items-center justify-end">
              <button
                type="button"
                className="px-4 py-2 text-sm bg-transparent border border-[#D0D5DD] text-[#344054] rounded-lg mr-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-sm bg-[#D31103] hover:bg-[#b50e02] text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading
                  ? "Deleting..."
                  : isPermanent
                    ? "Delete permanently"
                    : "Delete"}
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export default DeleteFileModal;
