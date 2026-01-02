import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedText(text, parentTrace = null) {
  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  // Create span for embeddings if parent trace exists
  if (parentTrace) {
    parentTrace.span({
      name: "Text Embedding",
      model: "text-embedding-3-small",
      input: { text },
      output: { embeddingDimension: response.data[0].embedding.length },
      usage: {
        input: response.usage?.prompt_tokens || 0,
      },
    });
  }

  return response.data[0].embedding;
}
