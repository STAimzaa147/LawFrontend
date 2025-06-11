export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#1A2341] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Article */}
        <section className="md:col-span-2 bg-white text-black rounded-xl p-6 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-semibold mb-4">
            ข่าวใหม่จากรัฐบาลกลางสหรัฐฯ ลงดาบเข้มงวดกับการทุจริตของบริษัทในวงการเทคโนโลยีและการเงิน
          </h1>
          <p className="text-sm text-gray-700">
            กระทรวงยุติธรรมสหรัฐฯ ประกาศแผนปฏิบัติการครั้งใหญ่ในการสอบสวนและดำเนินคดีเกี่ยวกับการทุจริตของบริษัทในอุตสาหกรรมที่เติบโตเร็ว เช่น เทคโนโลยี ฟินเทค และสกุลเงินดิจิทัล...
          </p>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          {[
            "ความยุติธรรมในจุดสนใจ: การปฏิรูปกฎหมายใหม่มุ่งเน้นเร่งรัดกระบวนการพิจารณาคดีในศาล",
            "ความรับผิดชอบขององค์กรเข้มงวดขึ้นเมื่อการบังคับใช้กฎหมายต่อด้านการฉ้อโกงเพิ่มขึ้นทั่วประเทศ",
            "สิ่งที่ธุรกิจทุกแห่งต้องรู้เกี่ยวกับกฎหมายความเป็นส่วนตัวข้อมูลใหม่",
            "จากห้องพิจารณาคดีสู่ห้องประชุม: นักกฎหมายยืนยันบทบาทอย่างไรในการกำหนดกลยุทธ์ธุรกิจ",
            "เมื่อ AI พบกฎหมาย: ความท้าทายทางกฎหมายที่เกิดขึ้นในยุคแห่งระบบอัตโนมัติ"
          ].map((title, index) => (
            <div key={index} className="bg-white text-black rounded-lg p-4 text-sm shadow-md hover:bg-gray-100 cursor-pointer">
              {title}
            </div>
          ))}
        </aside>
      </div>
    </main>
  );
}
