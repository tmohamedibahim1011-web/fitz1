const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(this, 1);
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("./pdf_doc_text.txt", pdfParser.getRawTextContent());
});
pdfParser.loadPDF("./src/assets/DOC-20260519-WA0003..pdf");
