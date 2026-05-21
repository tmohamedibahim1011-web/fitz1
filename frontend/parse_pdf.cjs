const fs = require('fs');
const pdf = require('pdf-parse');
let dataBuffer = fs.readFileSync('./src/assets/fitz1orders.pdf');
pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(console.log);
