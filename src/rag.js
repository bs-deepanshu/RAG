import OpenAI from "openai";
import { findRelevantChunks } from "./search.js";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askRAG(question, pdfName, chunks = null, parentTrace = null) {
  // Use provided chunks or fetch them if not provided
  if (!chunks) {
    chunks = await findRelevantChunks(question, pdfName);
  }
  const context = chunks.map(chunk => chunk.text).join("\n\n");
  console.log(context);
  const prompt = `
Answer the question using ONLY the context below.

Context:
${context}

Question:
${question}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
  });

  // Create generation span if parent trace exists
  if (parentTrace) {
    parentTrace.generation({
      name: "RAG LLM Generation",
      model: "gpt-4.1-mini",
      input: { messages: [{ role: "user", content: prompt }] },
      output: { text: response.choices[0].message.content },
      usage: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
      },
    });
  }

  console.log(response);
  return response.choices[0].message.content;
}
