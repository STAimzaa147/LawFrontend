'use client';
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";


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
      <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาคดี"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={()=> setIsFocused(true)}
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

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

