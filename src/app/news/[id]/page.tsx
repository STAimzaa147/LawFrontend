import { notFound } from "next/navigation";
import Image from 'next/image';

type NewsItem = {
  _id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
};

async function getNewsById(id: string): Promise<NewsItem | null> {
  try {
    const res = await fetch(`http://localhost:5050/api/v1/news/${id}`, {
      cache: "no-store",
    });
    const data = await res.json();
    console.log("Get big news", data);
    if (data.success) {
      return data.data;
    }
  } catch (err) {
    console.error("Error fetching news detail:", err);
  }
  return null;
}

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const newsItem = await getNewsById(params.id);

  if (!newsItem) return notFound();

  return (
    <main className="min-h-screen bg-[#1A2341] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Article */}
        <section className="md:col-span-2 bg-white text-black rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">{newsItem.title}</h1>

        <div className="relative w-full my-5" style={{ paddingTop: '56.25%' /* 9/16 ratio */ }}>
        <Image
            src={newsItem.image}
            alt={newsItem.title}
            fill
            className="object-cover rounded-md"
        />
        </div>

        <p className="text-sm text-gray-700 whitespace-pre-line">{newsItem.content}</p>
        </section>


        {/* Sidebar */}
        <OtherNews currentId={newsItem._id} />
      </div>
    </main>
  );
}

// Sidebar component with images
async function OtherNews({ currentId }: { currentId: string }) {
  const res = await fetch(`http://localhost:5050/api/v1/news`, {
    cache: "no-store",
  });
  const data = await res.json();

  if (!data.success) return null;
  console.log("Get small news", data);
  const otherNews: NewsItem[] = data.data.filter((item: NewsItem) => item._id !== currentId);

  return (
    <aside className="space-y-4">
    {otherNews.map((item: NewsItem) => (
        <a
        key={item._id}
        href={`/news/${item._id}`}
        className="flex items-center gap-4 bg-white text-black rounded-lg p-4 shadow-md hover:bg-gray-100 transition min-h-[100px]"
        >
        <Image
        src={item.image}
        alt={item.title}
        width={120}
        height={90}
        className="object-cover rounded-md w-[120px] h-[90px]"
        />
        <span className="text-base font-medium">{item.title}</span>
        </a>
    ))}
    </aside>
  );
}
// export default function NewsDetailPage(){
//   return(
//     <div>

//     </div>
//   );
// };