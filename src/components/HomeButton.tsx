import Link from "next/link";

export default function HomeButton(){
    return(
        <Link href="/chatai">
        <button className="my-20 px-3 py-1 bg-[#C9A55C] rounded-3xl text-gray-200 z-10">
            ขอคำปรึกษากฎหมาย AI
        </button>
        </Link>
    );
}