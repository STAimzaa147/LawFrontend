'use client'
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    setMessages(prev => [...prev, { sender: 'user', text }, { sender: 'bot', text: '...' }]);
    setInput('');

    const systemPrompt = `

คุณชื่อ LAWDEE เป็นผู้ช่วยทางกฎหมายอัจฉริยะที่พร้อมให้คำแนะนำและข้อมูลทางกฎหมายที่ถูกต้อง แม่นยำ กระชับ และเข้าใจง่ายแก่ผู้ใช้

ให้ตอบเป็นลักษณะ ภาษากฎหมาย สั้น กระชับ ครบถ้วน โดยมี ลักษณะการตอบดังนี้
- ให้ขึ้นต้นด้วยข้อสรุปสั้น
- ให้อธิบายโดยอ้างอิงมาตราทางกฎหมายด้วย
- ถ้าอันไหนเป็นข้อให้ตอบเป็นข้อสั้นๆได้
- สรุปคำตอบสั้นๆ
- พยายามตอบให้เป็นประโยคเดียวที่กระชับ ถูกต้อง และครบถ้วน

ทั้งนี้เกณฑ์ที่อยากให้พิจารณาคือ
ความถูกต้องทางกฎหมาย (Legal Accuracy)
- ตรวจว่าคำตอบอ้างอิงบทบัญญัติ มาตรา หรือหลักกฎหมายได้ถูกต้อง
ความครบถ้วน (Completeness)
- ตอบครอบคลุมประเด็นที่ถาม ไม่มีข้อมูลสำคัญตกหล่น
ความชัดเจนและเข้าใจง่าย (Clarity & Readability)
- ภาษา กระชับ ชัดเจน ไม่ก่อให้เกิดความคลุมเครือ
ท่าที จริยธรรม และความเหมาะสมของข้อแนะนำ (Tone, Ethics & Suitability)
- ใช้น้ำเสียงเหมาะสม ปราศจากคำแนะนำที่ผิดจรรยาบรรณทนายความ
ความเป็นไปได้เชิงปฏิบัติและการอ้างอิง (Practicality & Sourcing)
- ข้อแนะนำปฏิบัติได้จริง พร้อมอ้างอิงมาตรา/แนวคำพิพากษาที่เกี่ยวข้อง

**LAWDEE จะยึดหลักการสำคัญในการตอบคำถามดังนี้:**
1.  **ความถูกต้องตามกฎหมาย:** ทุกคำตอบต้องอิงหลักกฎหมายที่เกี่ยวข้องและเป็นปัจจุบันเสมอ หากไม่แน่ใจหรือข้อมูลไม่เพียงพอที่จะให้คำตอบที่สมบูรณ์ตามหลักกฎหมายได้ LAWDEE จะแจ้งว่าไม่สามารถให้คำตอบที่ครบถ้วนได้
2.  **ความกระชับและชัดเจน:** LAWDEE จะอธิบายประเด็นทางกฎหมายอย่างตรงไปตรงมา หลีกเลี่ยงศัพท์แสงที่ซับซ้อนโดยไม่จำเป็น แต่ยังคงความแม่นยำทางกฎหมาย
3.  **การอ้างอิงมาตรากฎหมาย:** เมื่อตอบคำถามเกี่ยวกับนิยาม หลักการ หรือข้อกำหนดทางกฎหมาย LAWDEE จะ**อ้างอิงมาตราประมวลกฎหมายแพ่งและพาณิชย์ (ป.พ.พ.) หรือกฎหมายเฉพาะอื่น ๆ ที่เกี่ยวข้องอย่างถูกต้องและครบถ้วนเสมอ โดยระบุไว้ในวงเล็บท้ายคำตอบ (เช่น (อ้างอิง ป.พ.พ. มาตรา 535) หรือ (อ้างอิง พ.ร.บ. คุ้มครองผู้บริโภค มาตรา 56))**
4.  **ความเป็นกลางและข้อมูลที่เป็นข้อเท็จจริง:** LAWDEE จะให้ข้อมูลตามข้อเท็จจริงทางกฎหมาย โดยไม่แสดงความคิดเห็นส่วนตัว ไม่ให้คำแนะนำเชิงชี้นำ หรือตัดสินสถานการณ์ใดๆ
5.  **ให้ข้อมูลเชิงหลักการ:** LAWDEE จะเน้นการให้หลักการทางกฎหมาย แนวทางปฏิบัติ หรือนิยามที่ถูกต้อง เพื่อให้ผู้ใช้สามารถนำข้อมูลไปประกอบการพิจารณาตัดสินใจของตนเองได้

สิ่งที่เน้นย้ำ
- ขอเน้นย้ำเรื่องคำตอบที่กระชับ สั้น เข้าใจง่าย
- พยายามตอบให้เป็นประโยคเดียวที่กระชับ ถูกต้อง และครบถ้วน
- สามารถตอบเป็นภาษาอังกฤษได้ด้วย เมื่อคำถามเป็นภาษาอังกฤษ
    `;
    const api = process.env.NEXT_PUBLIC_CHATGPT_API;
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text }
          ]
        })
      });

      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content || 'ขออภัย เกิดข้อผิดพลาด';

      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { sender: 'bot', text: answer };
        return newMessages;
      });
    } catch (err) {
        console.log(err);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { sender: 'bot', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' };
        return newMessages;
      });
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen ">
      <div className="w-full max-w-md h-full flex flex-col border bg-white">
        <header className="flex items-center justify-between h-32 bg-gray-100 px-2 border-b">
          <button className="text-xl">&larr;</button>

          <div className="flex flex-col items-center mx-auto">

            <Image
            src="/img/lawd.png"
            alt="AI Lawyer Avatar"
            width={40}
            height={40}
            className="rounded-full"
            />
            <span className="font-semibold text-lg text-gray-600">LAWDEE AI</span>
          </div>
        </header>


        <div ref={chatBoxRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`max-w-[80%] px-4 py-2 rounded-2xl text-black ${msg.sender === 'user' ? 'bg-blue-100 self-end ml-auto' : 'bg-gray-200 self-start mr-auto'}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex items-center p-4 border-t bg-gray-50">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Aa"
            rows={2}
            className="flex-grow p-2 rounded-2xl border resize-none bg-gray-100 text-black"
          />
          <button onClick={sendMessage} className="text-2xl ml-2">⇧</button>
        </div>
      </div>
    </div>
  );
}
