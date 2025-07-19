"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Search, Plus, ArrowUp } from "lucide-react"
import { useSession } from "next-auth/react"
import { v4 as uuidv4 } from 'uuid';

interface ChatContact {
  id: string
  name: string
  photo: string
  lastMessage?: string
}

type Contact = {
  _id: string;
  name: string;
  photo?: string;
};

type WrappedContact = {
  _id: Contact;
};

interface RawMessage {
  _id: string
  text: string
  sender_id: string
  createdAt: string
}

interface Message {
  id: string
  text: string
  senderId: string
  timestamp: Date
}

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL

export default function ChatPage() {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null)
  const [message, setMessage] = useState("")
  const [messagesByContact, setMessagesByContact] = useState<Record<string, Message[]>>({});
  const [searchQuery, setSearchQuery] = useState("")
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch(`${backendUrl}/api/v1/chat/users`, {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });
        const data = await res.json();
        const cleaned: ChatContact[] = (data as WrappedContact[]).map((item) => ({
          id: item._id._id,
          name: item._id.name,
          photo: item._id.photo || "",
        }));
        setContacts(cleaned);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      }
    };
    if (session?.accessToken) fetchContacts();
  }, [session?.accessToken]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchMessages = async () => {
      if (!selectedContact || !session?.accessToken) return;
      try {
        const res = await fetch(`${backendUrl}/api/v1/chat/${selectedContact.id}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        const data = await res.json();
        const messages: Message[] = Array.isArray(data)
          ? data.map((m: RawMessage, i: number) => ({
              id: m._id ?? `${m.sender_id}-${m.createdAt}-${i}`,
              text: m.text,
              senderId: m.sender_id,
              timestamp: new Date(m.createdAt),
            }))
          : [];

        setMessagesByContact((prev) => ({
          ...prev,
          [selectedContact.id]: messages,
        }));
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    if (selectedContact && session?.accessToken) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedContact, session?.accessToken]);

  const filteredContacts = (contacts ?? []).filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedContact) return;

    const newMessage: Message = {
      id: uuidv4(),
      text: message,
      senderId: session?.user?.id || "unknown",
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
          receiver_id: selectedContact.id,
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
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="w-80 border-r border-gray-200 flex flex-col">
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
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Chat</h2>
        </div>
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
                  src={contact.photo || "/img/default-avatar.jpg"}
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

      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold mr-3 relative overflow-hidden">
                  <Image
                    src={selectedContact.photo || "/img/default-avatar.jpg"}
                    alt={selectedContact.name}
                    fill
                    unoptimized
                    className="rounded-full object-cover"
                  />
                </div>
                <h2 className="text-lg font-semibold">{selectedContact.name}</h2>
              </div>
            </div>

            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
              {(() => {
                const messages = messagesByContact[selectedContact.id] || [];
                const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
                const today = new Date();
                let lastDate: string | null = null;

                return messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>เริ่มต้นการสนทนาของคุณ</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isCurrentUser = msg.senderId === session?.user?.id;
                      const msgDate = msg.timestamp;
                      const msgDateStr = msgDate.toDateString();
                      const showDateSeparator = lastDate !== msgDateStr;
                      lastDate = msgDateStr;
                      const isToday = isSameDay(today, msgDate);

                      return (
                        <div key={msg.id}>
                          {showDateSeparator && (
                            <div className="text-center my-6">
                              <span className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm">
                                {isToday
                                  ? "วันนี้"
                                  : msgDate.toLocaleDateString("th-TH", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                              </span>
                            </div>
                          )}

                          <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isCurrentUser
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-gray-800 border border-gray-200"
                              }`}
                            >
                              <p>{msg.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isCurrentUser ? "text-blue-100 text-right" : "text-gray-500 text-left"
                                }`}
                              >
                                {msgDate.toLocaleTimeString("th-TH", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

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
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <h3 className="text-lg font-medium mb-2">เลือกการสนทนา</h3>
              <p>เลือกการสนทนาจากรายการด้านซ้ายเพื่อเริ่มต้น</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
