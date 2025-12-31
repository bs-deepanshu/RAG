import OpenAI from "openai";
import { findRelevantChunks } from "./search.js";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function askRAG(question, pdfName) {
  const chunks = await findRelevantChunks(question, pdfName);
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

  return response.choices[0].message.content;
}
