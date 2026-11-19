"use client";

import { ChevronRight } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { openConversationInNewWindow } from "~/utils/open-in-new-window";

interface MenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  deleteModal: () => void;
}

interface SubMenuState {
  copy: boolean;
}

const DetailDropdown = ({
  isOpen,
  onClose,
  deleteModal,
}: MenuDropdownProps) => {
  const [subMenus, setSubMenus] = useState<SubMenuState>({
    copy: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // const params = useParams();
  // const id = params.id as string;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click target is inside a dialog
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
  }, [onClose]);

  if (!isOpen) return null;

  const menuItemClass =
    "px-4 py-2 text-[15px] text-[#101828] hover:bg-[#F1F1FE] flex items-center justify-between cursor-pointer";
  const dividerClass = "h-px bg-[#E6EAEF]";

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 w-[220px] mt-2.5 bg-white rounded-[7px] shadow-lg border border-[#E6EAEF] z-20"
    >
      <div>
        <div className={dividerClass} />

        <div
          className={menuItemClass}
          onClick={() => console.log("Star conversation")}
        >
          Star conversation
        </div>

        <div className={dividerClass} />

        <div
          className={`${menuItemClass} relative`}
          onMouseEnter={() => setSubMenus({ copy: true })}
          onMouseLeave={() => setSubMenus({ copy: false })}
        >
          Copy
          <ChevronRight className="w-4 h-4" color="#343330" />
          {subMenus.copy && (
            <div className="absolute right-full top-0 w-[200px] bg-white rounded-[7px] shadow-lg border border-[#E6EAEF]">
              <div className={menuItemClass}>Copy display name</div>
              <div className={menuItemClass}>Copy member ID</div>
              <div className={menuItemClass}>Copy link to profile</div>
            </div>
          )}
        </div>
        <div
          className={menuItemClass}
          onClick={() => console.log("Search in conversation")}
        >
          Search in conversation
        </div>

        <div
          className={menuItemClass}
          onClick={() => {
            openConversationInNewWindow();
            onClose();
          }}
        >
          Open in new window
        </div>

        <div className={dividerClass} />

        <div
          className={`${menuItemClass} text-[#B00E03]`}
          onClick={() => deleteModal()}
        >
          Delete Colleague
        </div>
      </div>
    </div>
  );
};

export default DetailDropdown;
