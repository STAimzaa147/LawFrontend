"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Users, FileText, Scale } from "lucide-react"
import Link from "next/link";

interface Lawyer {
   _id:
    | string
    | {
        _id: string; // actual ID used in the route
        name: string;
        tel: string;
        location: string;
      };
  lawfirm_name: string
  slogan: string
  summary: string
  civilCase_specialized: string[]
  criminalCase_specialized: string[]
  consultationRate: {
    min: number
    max: number
  }
  documentDeliveryRate?: {
    min?: number
    max?: number
  }
  has_law_license: boolean
  is_verified_by_council: boolean
}

interface News {
  _id: string
  title: string
  content: string;
  createdAt: string
  category: string
  view_count?: number
  like_count?: number
}

interface Forum {
  _id: string
  title: string
  content: string
  poster_id: {
    name: string
  }
  createdAt: string
  comment_count: number
  category: string
  view_count: number
  like_count: number
}

interface SearchResults {
  lawyers: Lawyer[]
  news: News[]
  forums: Forum[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<SearchResults>({
    lawyers: [],
    news: [],
    forums: [],
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (query) {
      fetchSearchResults(query)
    }
  }, [query])

  const fetchSearchResults = async (searchQuery: string) => {
    setLoading(true)
    try {
      // Fetch all data in parallel
      const [lawyersRes, newsRes, forumsRes] = await Promise.all([
        fetch(`/api/lawyers?search=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/news?search=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/forums?search=${encodeURIComponent(searchQuery)}`),
      ])

      const [lawyers, news, forums] = await Promise.all([lawyersRes.json(), newsRes.json(), forumsRes.json()])

      setResults({ lawyers, news, forums })
    } catch (error) {
      console.error("Error fetching search results:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalResults = results.lawyers.length + results.news.length + results.forums.length

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังค้นหา...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6 text-[#C9A55C]" />
          <h1 className="text-2xl font-bold text-white">ผลการค้นหา: &quot;{query}&quot;</h1>
        </div>
        <p className="text-gray-400">พบ {totalResults} รายการที่เกี่ยวข้อง</p>
      </div>

      {/* Results Tabs */}
      <div className="w-full">
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("all")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Search className="w-4 h-4" />
            ทั้งหมด ({totalResults})
          </button>
          <button
            onClick={() => setActiveTab("lawyers")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "lawyers" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Scale className="w-4 h-4" />
            ทนายความ ({results.lawyers.length})
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "news" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            ข่าวสาร ({results.news.length})
          </button>
          <button
            onClick={() => setActiveTab("forums")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "forums" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4" />
            กระดานสนทนา ({results.forums.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "all" && (
          <div className="space-y-8">
            {results.lawyers.length > 0 && <LawyersSection lawyers={results.lawyers.slice(0, 3)} />}
            {results.news.length > 0 && <NewsSection news={results.news.slice(0, 3)} />}
            {results.forums.length > 0 && <ForumsSection forums={results.forums.slice(0, 3)} />}
          </div>
        )}

        {activeTab === "lawyers" && <LawyersSection lawyers={results.lawyers} />}

        {activeTab === "news" && <NewsSection news={results.news} />}

        {activeTab === "forums" && <ForumsSection forums={results.forums} />}
      </div>
    </div>
  )
}

function LawyersSection({ lawyers }: { lawyers: Lawyer[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Scale className="w-5 h-5 text-[#C9A55C]" />
        ทนายความ
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lawyers.map((lawyer) => {
          // Extract ID string correctly
          const lawyerId =
            typeof lawyer._id === "string"
              ? lawyer._id
              : lawyer._id?._id || "";

          return (
            <div
              key={lawyerId}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{lawyer.lawfirm_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{lawyer.slogan}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {lawyer.civilCase_specialized.slice(0, 2).map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {specialty}
                      </span>
                    ))}
                    {lawyer.criminalCase_specialized.slice(0, 1).map((specialty, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>
                    ค่าปรึกษา: {lawyer.consultationRate.min.toLocaleString()}-
                    {lawyer.consultationRate.max.toLocaleString()} บาท
                  </p>
                  {lawyer.documentDeliveryRate && (
                    <p>
                      ค่าจัดทำเอกสาร: {lawyer.documentDeliveryRate.min?.toLocaleString()}-
                      {lawyer.documentDeliveryRate.max?.toLocaleString()} บาท
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {lawyer.has_law_license && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        มีใบอนุญาต
                      </span>
                    )}
                    {lawyer.is_verified_by_council && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        ยืนยันโดยสภา
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/lawyers/${lawyerId}`}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors text-center block"
                >
                  ดูรายละเอียด
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NewsSection({ news }: { news: News[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#C9A55C]" />
        ข่าวสาร
      </h2>
      <div className="space-y-4">
        {news.map((article) => (
  <div
    key={article._id}
    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="p-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap gap-1">
          {[article.category].filter(Boolean).slice(0, 2).map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(article.createdAt).toLocaleDateString("th-TH")}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{article.title}</h3>
              <p className="text-gray-600 mb-3">{article.content.slice(0, 100) + "..."}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {article.view_count && <span>{article.view_count.toLocaleString()} ครั้ง</span>}
                  {article.like_count && <span>{article.like_count.toLocaleString()} ถูกใจ</span>}
                </div>
                <Link href={`/news/${article._id}`}>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    อ่านเพิ่มเติม →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ForumsSection({ forums }: { forums: Forum[] }) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-[#C9A55C]" />
        กระดานสนทนา
      </h2>
      <div className="space-y-4">
        {forums.map((forum) => (
          <div
            key={forum._id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                  {forum.category}
                </span>
                <span className="text-sm text-gray-500">{new Date(forum.createdAt).toLocaleDateString("th-TH")}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">{forum.title}</h3>
              <p className="text-gray-600 mb-3 line-clamp-2">{forum.content}</p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>โดย: {forum.poster_id.name}</span>
                  <span>{forum.comment_count} ตอบกลับ</span>
                  <span>{forum.view_count.toLocaleString()} ครั้ง</span>
                  <span>{forum.like_count} ถูกใจ</span>
                </div>
                <Link href={`/forum/${forum._id}`}>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    เข้าร่วมสนทนา →
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
