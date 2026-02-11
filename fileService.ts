import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import { Packer, Document, Paragraph, TextRun } from 'docx';
import saveAs from 'file-saver';

// Helper to handle ESM default export inconsistencies with pdfjs-dist
const getPdfJs = () => {
  // @ts-ignore
  return pdfjsLib.getDocument ? pdfjsLib : pdfjsLib.default;
};

// Configure PDF.js worker to match the version in index.html (v5.4.624)
// Using unpkg to ensure we get the matching .mjs worker
const pdfJs = getPdfJs();
if (pdfJs) {
  pdfJs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs`;
}

export const readPdf = async (file: File): Promise<string> => {
  const pdfJs = getPdfJs();
  if (!pdfJs) throw new Error("PDF Library not loaded correctly");

  const arrayBuffer = await file.arrayBuffer();
  // Load document
  const loadingTask = pdfJs.getDocument({
    data: arrayBuffer,
    useWorkerFetch: true,
    isEvalSupported: false,
    useSystemFonts: true
  });

  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = (textContent.items || []).map((item: any) => item.str).join(' ');
    fullText += pageText + "\n";
  }

  return fullText;
};

export const readDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  // Handle ESM import variations for mammoth
  // @ts-ignore
  const extractRawText = mammoth.extractRawText || mammoth.default?.extractRawText;
  
  if (!extractRawText) {
    throw new Error("Mammoth library failed to load correctly.");
  }

  const result = await extractRawText({ arrayBuffer });
  return result.value;
};

export const readFileContent = async (file: File): Promise<string> => {
  if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
    return readPdf(file);
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || 
    file.name.endsWith(".docx")
  ) {
    return readDocx(file);
  } else {
    // Fallback for text files
    return await file.text();
  }
};

export const exportToDocx = async (text: string, filename: string = "Rapport_Final.docx") => {
  const lines = text.split('\n');
  const children = lines.map(line => {
      // Basic markdown-ish parsing for bold headers
      if (line.startsWith('# ')) {
          return new Paragraph({
              children: [new TextRun({ text: line.replace('# ', ''), bold: true, size: 32 })],
              spacing: { after: 200, before: 200 }
          });
      }
      if (line.startsWith('## ')) {
          return new Paragraph({
              children: [new TextRun({ text: line.replace('## ', ''), bold: true, size: 28 })],
              spacing: { after: 150, before: 150 }
          });
      }
      return new Paragraph({
          children: [new TextRun({ text: line })]
      });
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
};