import Image from "next/image";
import HomeButton from "@/components/HomeButton";
import SearchBar from "@/components/SearchBar";
import News from "@/components/News";

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
          priority
          className="z-0 blur-[2px] scale-110"
        />

        <div className="absolute inset-0 bg-[#353C63]/50 z-5 scale-110"></div>
        <div className="z-20 relative flex justify-center">
          <SearchBar/>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-start h-full px-4 text-white text-center">
          <h1 className="text-7xl font-bold py-3">ให้เราช่วยคุณ</h1>
          <h1 className="text-7xl font-bold py-3">
            แก้ทุกปัญหาอย่าง <span className="text-[#C9A55C]">มืออาชีพ</span>
          </h1>
          <div className="my-25">
              <HomeButton />
          </div>
        </div>
      </div>

      

      <div className="flex items-center mt-16 justify-center">
        <div className="w-[87%] border-t-2 border-white"></div>
      </div>
      <div className="mx-28 mt-2 font-bold text-white text-xl">ข่าว</div>
      <News/>
    </main>
  );
}
