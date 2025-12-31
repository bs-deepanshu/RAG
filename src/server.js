import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

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
  try {
    const { question, pdfName } = req.body;

    // Step 1: Get top 5 relevant chunks with distance
    const chunks = await findRelevantChunks(question, pdfName, 5);

    // Step 2: Send to LLM only top chunk
    const answer = await askRAG(question, pdfName);

    // Mark which chunk was sent to the LLM (top 1)
    const chunksWithHighlight = chunks.map((chunk, index) => ({
      ...chunk,
      highlight: index === 0  // Only the top chunk is sent to LLM
    }));

    res.json({ chunks: chunksWithHighlight, answer });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
