"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminForumReportsPage from "./forums/page"
import AdminCommentReportsPage from "./comments/page"

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-slate-800 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-6">การจัดการรายงาน</h1>
        <Tabs defaultValue="forum-reports" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 text-white border border-white/20 rounded-lg overflow-hidden">
            <TabsTrigger
              value="forum-reports"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=inactive]:text-white data-[state=inactive]:hover:bg-white/10 rounded-none"
            >
              รายงานกระทู้
            </TabsTrigger>
            <TabsTrigger
              value="comment-reports"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-700 data-[state=inactive]:text-white data-[state=inactive]:hover:bg-white/10 rounded-none"
            >
              รายงานความคิดเห็น
            </TabsTrigger>
          </TabsList>
          <TabsContent value="forum-reports">
            {/* AdminForumReportsPage should handle its own data fetching and sorting */}
            <AdminForumReportsPage />
          </TabsContent>
          <TabsContent value="comment-reports">
            {/* AdminCommentReportsPage should handle its own data fetching and sorting */}
            <AdminCommentReportsPage />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
