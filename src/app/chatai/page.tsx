'use client'
import { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Image from 'next/image';

export default function Home() {
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot', text: string }[]>([]);
  const [input, setInput] = useState('');
  const { data: session } = useSession();
  const chatBoxRef = useRef<HTMLDivElement>(null);

  //Load message history
  const aiId = '6828a931e92578c60ee00ebd'; // your AI bot id here
  useEffect(() => {
    if (!session) return;

    async function loadPreviousChats() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/${aiId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(res.statusText);

        const chats = await res.json();

        type Chat = {
          sender_id: { toString: () => string };
          text: string;
        };

        const formattedMessages = chats.map((chat: Chat) => ({
          sender: chat.sender_id.toString() === session?.user.id ? 'user' : 'bot',
          text: chat.text,
        }));



        setMessages(formattedMessages);
      } catch (err) {
        console.error('Failed to load chats', err);
      }
    }

    loadPreviousChats();
  }, [session]);
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;

    //Save user message
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.accessToken} `,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        receiver_id: '6828a931e92578c60ee00ebd',
        text:text
      })
    });

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
    const recentMessages = messages.slice(-6); 
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'user', content: text }
    ];

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${api}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-nano',
          messages: fullMessages
        })
      });

      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content || 'ขออภัย เกิดข้อผิดพลาด';
      //save Lawdee message

        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/chat/ai`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.accessToken} `,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiver_id: session?.user.id,
            text:answer
          })
        });


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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-[91.5dvh] ">
      <div className="w-full max-w-md h-full flex flex-col border bg-white">
        <header className="relative h-32 bg-gray-100 border-b flex items-center justify-center">
          <button className="absolute left-4 text-blue-800 hover:bg-blue-100 p-2 rounded-full transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex flex-col items-center">
            <Image
              src="/img/lawd.png"
              alt="AI Lawyer Avatar"
              width={50}
              height={50}
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

        <div className="flex items-center px-4 py-4 border-t bg-white">
          <div className="relative flex items-center w-full">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Aa"
              rows={1}
              className="flex-grow bg-gray-100 rounded-3xl py-2 px-4 text-l text-black resize-none outline-none border border-transparent focus:border-gray-300 max-h-40 overflow-y-auto"
            />
            <button
              onClick={sendMessage}
              className="ml-2 w-9 h-9 rounded-full hover:bg-blue-100 border-2 border-blue-800 text-blue-800 flex items-center justify-center text-xl font-bold"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

