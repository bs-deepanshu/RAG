import { pool } from "./db.js";
import { embedText } from "./embeddings.js";

export async function ingestDocument(pdfName, textChunks) {
  for (const chunk of textChunks) {
    const embedding = await embedText(chunk);
    
    // Convert the array [0.1, 0.2, ...] into a string "[0.1, 0.2, ...]"
    const formattedVector = `[${embedding.join(",")}]`;

    await pool.query(
      "INSERT INTO documents (pdf_name, content, embedding) VALUES ($1, $2, $3)",
      [pdfName, chunk, formattedVector] // Pass the formatted string here
    );
  }
  console.log(`PDF "${pdfName}" ingested with ${textChunks.length} chunks`);
}
