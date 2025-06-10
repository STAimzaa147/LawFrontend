import Image from "next/image";

export default function News() {
  // Temporary mock data – replace this with props or API data later
  const newsItems = [
    {
      id: 1,
      title: "ประกาศกฎหมายใหม่เกี่ยวกับแรงงาน",
      summary: "กฎหมายใหม่มีผลบังคับใช้ในเดือนหน้า มีผลต่อแรงงานในภาคอุตสาหกรรม...",
      image: "/img/Banner3.jpg",
    },
    {
      id: 2,
      title: "การเปลี่ยนแปลงกฎหมายอาญาครั้งใหญ่",
      summary: "การแก้ไขกฎหมายอาญาฉบับใหม่มุ่งเน้นการป้องกันอาชญากรรม...",
      image: "/img/Banner2.jpg",
    },
    {
      id: 3,
      title: "สิทธิของผู้บริโภคในยุคดิจิทัล",
      summary: "เมื่อซื้อสินค้าผ่านออนไลน์ คุณมีสิทธิอะไรบ้าง? มาดูกัน...",
      image: "/img/Banner.jpg",
    },
  ];
  console.log(newsItems);
  return (
    <section className="mx-15 px-6 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {newsItems.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            width={500}
            height={300}
            className="object-cover w-full h-48 "
          />
          <div className="p-4">
            <h3 className="text-xl font-semibold text-[#353C63] mb-2">{item.title}</h3>
            <p className="text-gray-600 line-clamp-3">{item.summary}</p>
            <button className="mt-4 text-sm text-[#353C63] hover:underline">
              อ่านเพิ่มเติม
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
