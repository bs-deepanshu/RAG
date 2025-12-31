import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { AISDK } from "@browserstack/ai-sdk";

const client = new AISDK({
  publicKey: process.env.AISDK_PUBLIC_KEY,
  secretKey: process.env.AISDK_SECRET_KEY,
});

import { findRelevantChunks } from "./search.js";
import { askRAG } from "./rag.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.post("/ask", async (req, res) => {
  const trace = client.trace({
    name: "RAG Ask Query",
    input: { question: req.body.question, pdfName: req.body.pdfName },
  });

  try {
    const { question, pdfName } = req.body;

    // Step 1: Get top 5 relevant chunks with distance
    const chunks = await findRelevantChunks(question, pdfName, 5, trace);

    // Step 2: Send to LLM with chunks (no duplicate call)
    const answer = await askRAG(question, pdfName, chunks, trace);

    // Mark which chunk was sent to the LLM (top 1)
    const chunksWithHighlight = chunks.map((chunk, index) => ({
      ...chunk,
      highlight: index === 0  // Only the top chunk is sent to LLM
    }));

    trace.update({
      output: { answer, chunksCount: chunksWithHighlight.length },
    });

    res.json({ chunks: chunksWithHighlight, answer });
    client.flush();
  } catch (err) {
    console.error(err);
    trace.update({
      error: { message: err.message, stack: err.stack },
    });
    client.flush();
    res.status(500).send("Internal server error");
  }
});

app.get("/test-ai-sdk", async (req, res) => {
  const trace = client.trace({
    name: "Test AI SDK Trace",
    input: { query: "What is the capitof INDIA?" },
  });

  trace.update({
    output: { answer: "The capital of France is N/A." },
  });

  trace.generation({
        name: 'test-generation',
        model: 'hello',
        input: { messages: [{ role: 'user', content: "asdjfgvdhb" }] },
        usage:{
          input:100,
          cacheReadInputTokens:200,
          cacheCreationInputTokens:50,
          output:200
        },
        metadata:{
          traceId:trace.id
        }
      })
  client.flush();
  
  res.json({ message: "AI SDK trace created successfully." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
