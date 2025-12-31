import fs from "fs";
import path from "path";
import pdf from '@cedrugs/pdf-parse';

export async function pdfToChunks(pdfFileName, chunkSize = 500) {
  const pdfPath = path.resolve("./pdf", pdfFileName);

  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`);
  }

  const dataBuffer = fs.readFileSync(pdfPath);
  const pdfData = await pdf(dataBuffer);

  // Clean whitespace
  const text = pdfData.text.replace(/\s+/g, " ").trim();

  // Split into chunks
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  return chunks;
}
