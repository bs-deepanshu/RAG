import { pdfToChunks } from "./parsePdf.js";
import { ingestDocument } from "./ingest.js";
import { askRAG } from "./rag.js";

async function main() {
  // Ingest PDF
  const chunks = await pdfToChunks("Amazon.pdf");
//   console.log(chunks);
  await ingestDocument("Amazon.pdf", chunks);

  // Ask question
  const answer = await askRAG("What is RAG?", "Amazon.pdf");
  console.log(answer);
}

main();
