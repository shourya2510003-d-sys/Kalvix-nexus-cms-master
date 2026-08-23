const xlsx = require('xlsx');
const path = require('path');

const FILE_PATH = '/Users/apple/Downloads/PriceList5.xlsx';

function parseXlsx() {
  console.log(`Loading Excel file: ${FILE_PATH}`);
  const workbook = xlsx.readFile(FILE_PATH);
  
  const sheetNames = workbook.SheetNames;
  console.log("Sheet names:", sheetNames);
  
  for (const sheetName of sheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);
    console.log(`\nSheet: ${sheetName} - Parsed ${data.length} rows.`);
    if (data.length > 0) {
      console.log("Header keys:", Object.keys(data[0]));
      console.log("Row 0:", data[0]);
      if (data.length > 1) {
        console.log("Row 1:", data[1]);
      }
    }
  }
}

parseXlsx();
