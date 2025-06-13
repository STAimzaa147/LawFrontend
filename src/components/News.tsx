'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

type NewsItem = {
  _id: string;
  title: string;
  summary: string;
  image: string;
};

export default function News() {
  // Temporary mock data – replace this with props or API data later
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/news`);
        const data = await res.json();
        if (data.success) {
          setNewsItems(data.data);
        } else {
          console.error("Failed to fetch news:", data.message);
        }
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [backendUrl]);

  if (loading) {
    return <p className="text-center py-10">Loading news...</p>;
  }
  console.log(newsItems);
  return (
    <section className="mx-15 px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {newsItems.map((item) => (
        <Link key={item._id} href={`/news/${item._id}`}>
          <div 
            className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col justify-between"
            style={{ height: '100%' }}
          >
            <Image
              src={item.image}
              alt={item.title}
              width={500}
              height={300}
              className="object-cover w-full h-48"
            />
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="text-xl font-semibold text-[#353C63] mb-2">{item.title}</h3>
              <p className="text-gray-600 line-clamp-3 flex-grow">{item.summary}</p>
              <button className="mt-4 text-sm text-[#353C63] hover:underline self-start">
                อ่านเพิ่มเติม
              </button>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
