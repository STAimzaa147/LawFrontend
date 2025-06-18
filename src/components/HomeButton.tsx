import Link from "next/link";

export default function HomeButton(){
    return(
        <Link href="/chatai">
        <div className="z-10 my-20">
            <button className="px-3 py-3 bg-white rounded-3xl text-black z-10">
                ขอคำปรึกษากฎหมาย AI
            </button>
        </div>
        </Link>
    );
}