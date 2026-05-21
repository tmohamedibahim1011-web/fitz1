const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser(this, 1);
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("./pdf_text.txt", pdfParser.getRawTextContent());
});
pdfParser.loadPDF("./src/assets/fitz1orders.pdf");
