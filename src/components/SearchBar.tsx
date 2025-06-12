'use client';
import { AiOutlineSearch } from "react-icons/ai";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function SearchBar() {
  const [search, setSearch] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLFormElement>(null);

  const router = useRouter();

  const recommendations = [
    "คดีแพ่ง",
    "คดีอาญา",
    "คดีครอบครัว",
    "คดีแรงงาน",
    "คดีผู้บริโภค",
    "คดีที่เกี่ยวกับที่อยู่อาศัย",
    "คดีละเมิด / หมิ่นประมาท",
    "คดีธุรกิจและการขอสิทธิบัตร",
    "คดีซื้อขายอสังหาริมทรัพย์",
    "คดีออนไลน์",
    "คดีต่างด้าว / ตรวจคนเข้าเมือง",
    "คดีที่ดินและทรัพย์สิน"
  ];

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <form className="p-10 w-[1200px] relative place-self-center z-10" ref={wrapperRef}>
      <div className="relative">
        <input
          type="search"
          placeholder="ค้นหาคดี"
          className="w-full p-4 rounded-full bg-white text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
        <button
          type="submit"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-4 bg-white text-[#353C63] rounded-full"
        >
          <AiOutlineSearch />
        </button>

        {isFocused && (
          <ul className="absolute z-[100] mt-2 w-full bg-white border border-gray-300 rounded-xl shadow-md">
            {recommendations
              .filter((item) => item.includes(search))
              .map((item, index) => (
                <li
                  key={index}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-xl text-gray-800 z-20"
                  onClick={() => {
                    setSearch(item);
                    setIsFocused(false);
                    router.push(`/lawyers?type=${encodeURIComponent(item)}`);
                  }}
                >
                  {item}
                </li>
              ))}
          </ul>
        )}
      </div>
    </form>
  );
}
