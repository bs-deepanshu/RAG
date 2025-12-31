import { pool } from "./db.js";
import { embedText } from "./embeddings.js";

export async function findRelevantChunks(question, pdfName, limit = 5) {
  const embedding = await embedText(question);

  // Convert the numerical array into a pgvector compatible string "[0.1, 0.2, ...]"
  const formattedVector = `[${embedding.join(",")}]`;

  const result = await pool.query(
    `
    SELECT content, embedding <-> $1 AS distance
    FROM documents
    WHERE pdf_name = $2
    ORDER BY distance ASC
    LIMIT $3
    `,
    [formattedVector, pdfName, limit] // Pass the formatted string here
  );

  return result.rows.map((row, index) => ({
    text: row.content,
    rank: index + 1,
    distance: row.distance,
    highlight: index === 0, // top chunk
  }));
}
