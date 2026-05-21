const fs = require('fs');
const PDFParser = require('pdf2json');
const pdfParser = new PDFParser();
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync("./pdf_data.json", JSON.stringify(pdfData.Pages[0]));
});
pdfParser.loadPDF("./src/assets/fitz1orders.pdf");
