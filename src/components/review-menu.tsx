"use client"

import { useState, useEffect, useRef } from "react"
import { FiEdit } from "react-icons/fi"

function ReviewMenu({
  onEdit,
  onDelete,
  isOwner,
}: {
  onEdit?: () => void
  onDelete?: () => void
  onReport: () => void
  isOwner: boolean
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-500 hover:text-black text-xl font-bold"
        aria-label="Open review menu"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow z-10">
          {isOwner && (
            <>
              <button
                onClick={() => {
                  onEdit?.()
                  setOpen(false)
                }}
                className="flex items-center gap-2 w-full text-black text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                <FiEdit size={16} />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete?.()
                  setOpen(false)
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-black"
              >
                🗑️ Delete
              </button>
            </>
          )}
          
        </div>
      )}
    </div>
  )
}

export default ReviewMenu
