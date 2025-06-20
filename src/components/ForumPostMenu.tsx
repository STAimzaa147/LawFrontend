import { useState, useEffect, useRef } from "react";
import { FiEdit, FiMoreHorizontal } from "react-icons/fi";

export default function ForumPostMenu({
  onEdit,
  onDelete,
  onReport,
  isOwner,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onReport: () => void;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-500 hover:text-black text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200"
        aria-label="Open forum post menu"
      >
        <FiMoreHorizontal size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow z-10">
          {/* Conditionally show Edit/Delete if isOwner */}
          {isOwner && (
            <>
              <button
                onClick={() => {
                  onEdit?.();
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full text-black text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                <FiEdit size={16} />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete?.();
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-black"
              >
                🗑️ Delete
              </button>
            </>
          )}

          {/* Always show Report */}
          <button
            onClick={() => {
              onReport();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-black"
          >
            🚩 Report
          </button>
        </div>
      )}
    </div>
  );
}

