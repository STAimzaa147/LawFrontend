import Image from "next/image";
import HomeButton from "@/components/HomeButton";
import SearchBar from "@/components/SearchBar";
import News from "@/components/News";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Banner section with SearchBar and text overlaid */}
      <div className="relative w-full h-[500px] my-5">
        {/* Optimized Next.js Image as background */}
        <Image
          src="/img/Law.png"
          alt="Banner"
          layout="fill"
          objectFit="cover"
          unoptimized
          priority
          className="z-0 blur-[2px] scale-110"
        />

        <div className="absolute inset-0 bg-[#353C63]/50 z-5 scale-110"></div>
        <div className="z-20 relative flex justify-center">
          <SearchBar/>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-start h-[435px] px-4 text-white text-center">
          <h1 className="text-6xl font-bold py-3">ให้เราช่วยคุณ</h1>
          <h1 className="text-6xl font-bold py-3">
            แก้ปัญหาทางกฎหมายอย่าง <span className="text-[#C9A55C]">มืออาชีพ</span>
          </h1>
          <div className="">
              <HomeButton />
          </div>
        </div>
      </div>

      

      <div className="flex items-center mt-16 justify-center">
        <div className="w-[87%] border-t-2 border-white"></div>
      </div>
      <div className="flex justify-between items-center mx-28 mt-2">
        <div className="font-bold text-white text-xl">ข่าว</div>

        <div>
          <Link
            href="/news"
            className="text-white hover:underline text-sm font-medium z-40"
          >
            ดูข่าวทั้งหมด →
          </Link>
        </div>
      </div>
      <News/>
    </main>
  );
}
