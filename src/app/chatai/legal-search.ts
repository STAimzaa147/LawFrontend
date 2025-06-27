import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

// Initialize clients
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
  dangerouslyAllowBrowser: true, // Only for client-side usage
})

export interface LegalDoc {
  id: string
  content: string
  title: string
  section: number
  law_type: string
  similarity?: number
}

// Function to create embeddings for text
export async function embedText(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error("Error creating embedding:", error)
    throw error
  }
}

// Function to search for similar documents
export async function searchSimilarDocs(query: string, topK = 3): Promise<LegalDoc[]> {
  try {
    // 1. Create embedding for the query
    const queryEmbedding = await embedText(query)

    // 2. Search for similar documents in Supabase
    const { data, error } = await supabase.rpc("match_legal_docs", {
      query_embedding: queryEmbedding,
      match_count: topK,
    })

    if (error) {
      console.error("Error searching documents:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in searchSimilarDocs:", error)
    return []
  }
}

// Function to answer questions using retrieved documents
export async function answerQuestion(question: string): Promise<string> {
  try {
    const docs = await searchSimilarDocs(question)

    if (docs.length === 0) {
      return "ขออภัย ไม่พบข้อมูลที่เกี่ยวข้องกับคำถามของคุณ"
    }

    const context = docs.map((doc) => doc.content).join("\n\n")

    const prompt = `
คำถาม: ${question}

บริบท:
${context}

กรุณาตอบคำถามโดยอ้างอิงจากบริบทด้านบน พร้อมอ้างอิงมาตรา ตอบแค่คำถามที่ถามเท่านั้น
`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 500,
    })

    return response.choices[0]?.message?.content || "ขออภัย เกิดข้อผิดพลาดในการตอบคำถาม"
  } catch (error) {
    console.error("Error answering question:", error)
    return "ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำถาม"
  }
}

// Enhanced search function with similarity threshold
export async function searchRelevantDocs(query: string, topK = 3, similarityThreshold = 0.1): Promise<LegalDoc[]> {
  const docs = await searchSimilarDocs(query, topK)
  return docs.filter((doc) => (doc.similarity || 0) >= similarityThreshold)
}

// Function to generate enhanced answer with context
export function generateEnhancedAnswer(question: string, docs: LegalDoc[]): string {
  if (docs.length === 0) return ""

  return docs.map((doc) => `${doc.law_type} มาตรา ${doc.section}: ${doc.content}`).join("\n\n")
}