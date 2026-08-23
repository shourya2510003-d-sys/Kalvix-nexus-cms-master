const xlsx = require('xlsx');
const fetch = require('node-fetch'); // node-fetch was installed earlier

const FILE_PATH = '/Users/apple/Downloads/PriceList5.xlsx';
const BASE_API_URL = 'https://divinecardinal.vercel.app/api/backend';

async function main() {
  console.log(`Loading Excel file: ${FILE_PATH}`);
  const workbook = xlsx.readFile(FILE_PATH);
  
  const parsedProducts = [];

  // 1. Process regular sheets
  const regularSheets = ['Faceand body', 'Child', 'women', 'men', 'hair', 'wellness', 'mother'];
  
  for (const sheetName of regularSheets) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;
    
    const rows = xlsx.utils.sheet_to_json(worksheet);
    console.log(`Processing sheet: ${sheetName} (${rows.length} rows)`);
    
    let currentProduct = null;
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const values = Object.values(row);
      if (values.includes('Sr No') || values.includes('SKUID')) {
        continue; // skip header row
      }
      
      const sku = row['__EMPTY_1'];
      const productName = row['__EMPTY'];
      const mrp = row['__EMPTY_6'];
      
      if (sku && String(sku).trim()) {
        if (currentProduct) {
          parsedProducts.push(currentProduct);
        }
        currentProduct = {
          sku: String(sku).trim(),
          name: productName ? String(productName).trim() : '',
          price: mrp ? Number(mrp) : 0,
          essentialOils: [],
          carrierOils: [],
          directions: []
        };
      }
      
      if (currentProduct) {
        const eo = row['__EMPTY_2'];
        if (eo && String(eo).trim() && String(eo).trim() !== 'Essential Oil') {
          currentProduct.essentialOils.push(String(eo).trim());
        }
        
        const co = row['__EMPTY_4'];
        if (co && String(co).trim() && String(co).trim() !== 'Carrier Oil') {
          currentProduct.carrierOils.push(String(co).trim());
        }
        
        const dir = row['__EMPTY_8'];
        if (dir && String(dir).trim() && String(dir).trim() !== 'Direction of Use' && String(dir).trim() !== 'Direction of use') {
          currentProduct.directions.push(String(dir).trim());
        }
      }
    }
    
    if (currentProduct) {
      parsedProducts.push(currentProduct);
    }
  }

  // 2. Process Attar sheet
  const attarWorksheet = workbook.Sheets['Attar'];
  if (attarWorksheet) {
    const rows = xlsx.utils.sheet_to_json(attarWorksheet);
    console.log(`Processing sheet: Attar (${rows.length} rows)`);
    
    for (const row of rows) {
      const values = Object.values(row);
      if (values.includes('Sr No') || values.includes('SKU ID')) {
        continue; // skip headers
      }
      
      const sku = row['__EMPTY_2'];
      const productName = row['__EMPTY'];
      const mrp = row['__EMPTY_5'];
      
      if (sku && String(sku).trim()) {
        parsedProducts.push({
          sku: String(sku).trim(),
          name: productName ? String(productName).trim() : '',
          price: mrp ? Number(mrp) : 0,
          essentialOils: [],
          carrierOils: [],
          directions: []
        });
      }
    }
  }

  console.log(`\nParsed a total of ${parsedProducts.length} products from Excel.`);
  
  // 3. Send payload to Backend
  console.log("\nSending data to the remote server to update the database...");
  try {
    const res = await fetch(`${BASE_API_URL}/admin/products/bulk-update-excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(parsedProducts)
    });
    
    if (!res.ok) {
      throw new Error(`Server responded with status ${res.status}: ${await res.text()}`);
    }
    
    const responseData = await res.json();
    console.log("Server Response:", responseData);
    console.log(`Successfully updated ${responseData.updated} products in DB.`);
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

main().catch(console.error);
