"use client"

import type React from "react"
import Image from "next/image"
import { useState,useEffect } from "react"
import { Search, Plus, ArrowUp } from "lucide-react"
import { useSession } from "next-auth/react"

interface ChatContact {
  id: string
  name: string
  photo: string
  lastMessage?: string
}

interface RawMessage {
  _id: string
  text: string
  sender: string // typically a user ID
  createdAt: string // ISO timestamp
}

interface Message {
  id: string
  text: string
  sender: "client" | "lawyer"
  timestamp: Date
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [message, setMessage] = useState("")
  const [messagesByContact, setMessagesByContact] = useState<Record<string, Message[]>>({});
  const [searchQuery, setSearchQuery] = useState("")
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const { data: session } = useSession()
  // Fetch chat users on load
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/chat/users`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`, // use appropriate auth
          },
        });
        const data = await res.json();
        console.log(data);
        setContacts(data.users || []);
 // or adjust based on response format
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    };

    fetchContacts();
  }, [session?.accessToken]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedContact || !session?.accessToken) return;

      try {
        const res = await fetch(`${backendUrl}/api/v1/chat/${selectedContact.id}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        const data = await res.json();

        const messages: Message[] = data.messages.map((m: RawMessage, index: number) => ({
          id: m._id || `${m.sender}-${m.createdAt}-${index}`,
          text: m.text,
          sender: m.sender === session?.user?.id ? "client" : "lawyer",
          timestamp: new Date(m.createdAt),
        }));

        setMessagesByContact((prev) => ({
          ...prev,
          [selectedContact.id]: messages,
        }));
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    fetchMessages();
  }, [selectedContact, session?.accessToken, session?.user?.id]);

  const filteredContacts = (contacts ?? []).filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  ); 

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "client",
      timestamp: new Date(),
    };

    try {
      await fetch(`${backendUrl}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({
          receiverId: selectedContact.id,
          text: message,
        }),
      });

      setMessagesByContact((prev) => {
        const currentMessages = prev[selectedContact.id] || [];
        return {
          ...prev,
          [selectedContact.id]: [...currentMessages, newMessage],
        };
      });
      setMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ค้นหา"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* All Chat Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Chat</h2>
        </div>

        {/* Chat Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedContact?.id === contact.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold mr-3 relative overflow-hidden">
                <Image
                  src={`https://lawprojectdemo.s3.ap-southeat-1.amazonaws.com/${contact.photo}` || "/placeholder.svg"}
                  alt={contact.name}
                  fill
                  unoptimized
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{contact.name}</h3>
                {contact.lastMessage && <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold mr-3 relative overflow-hidden">
                  <Image
                    src={`https://lawprojectdemo.s3.ap-southeast-1.amazonaws.com/${selectedContact.photo}` || "/placeholder.svg"}
                    alt={selectedContact.name}
                    fill
                    unoptimized
                    className="rounded-full object-cover"
                  />
                </div>
                <h2 className="text-lg font-semibold">{selectedContact.name}</h2>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
              {(messagesByContact[selectedContact.id] || []).length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>เริ่มต้นการสนทนาของคุณ</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(messagesByContact[selectedContact.id] || []).map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === "client"
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800 border border-gray-200"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === "client" ? "text-blue-100" : "text-gray-500"}`}>
                          {msg.timestamp.toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="ข้อความของคุณ"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-3 text-black border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">เลือกการสนทนา</h3>
              <p>เลือกการสนทนาจากรายการด้านซ้ายเพื่อเริ่มต้น</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
