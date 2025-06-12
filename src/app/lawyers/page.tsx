'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Lawyer {
  _id: string;
  name: string;
  bio: string;
  imageUrl?: string;
  specialties: string[];
}

// Mock data for demonstration
const mockLawyers: Lawyer[] = [
  {
    _id: '1',
    name: 'ทนายสมชาย พิพากษา',
    bio: 'มีประสบการณ์มากกว่า 15 ปีในคดีแพ่งและครอบครัว',
    imageUrl: '/lawyer1.jpg',
    specialties: ['คดีแพ่ง', 'คดีครอบครัว'],
  },
  {
    _id: '2',
    name: 'ทนายนภา ศรีธรรม',
    bio: 'เชี่ยวชาญคดีอาญา และสิทธิมนุษยชน',
    imageUrl: '/lawyer2.jpg',
    specialties: ['คดีอาญา'],
  },
  {
    _id: '3',
    name: 'ทนายวีระ กฎหมาย',
    bio: 'ให้คำปรึกษาเรื่องแรงงาน และการฟ้องร้องบริษัท',
    imageUrl: '/lawyer3.jpg',
    specialties: ['คดีแรงงาน'],
  },
];

export default function LawyersPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type) {
      setLoading(true);
      const filtered = mockLawyers.filter((lawyer) =>
        lawyer.specialties.includes(type)
      );
      setTimeout(() => {
        setLawyers(filtered);
        setLoading(false);
      }, 500); // simulate network delay
    }
  }, [type]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">ทนายความสำหรับ: {type}</h1>

      {loading && <p>กำลังโหลดข้อมูลทนายความ...</p>}

      {!loading && lawyers.length === 0 && (
        <p className="text-gray-500">ไม่พบทนายความที่เชี่ยวชาญในประเภทคดีนี้</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {lawyers.map((lawyer) => (
          <div key={lawyer._id} className="bg-white rounded-xl shadow p-4">
            <Image src="/images/lawyer.jpg" alt="Lawyer" width={500} height={300} />
            <h2 className="text-xl font-semibold">{lawyer.name}</h2>
            <p className="text-gray-600 text-sm">{lawyer.bio}</p>
            <p className="text-sm text-blue-600 mt-2">
              ความเชี่ยวชาญ: {lawyer.specialties.join(', ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
