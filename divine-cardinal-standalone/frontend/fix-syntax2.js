const fs = require('fs');
const path = require('path');

// 1. Fix mismatched quotes in fetch URLs
function fixQuotes(file) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find cases where it starts with backtick but ends with single or double quote
  // example: `${process.env.NEXT_PUBLIC_API_URL || 'https://kalvix-nexus-production.up.railway.app/api'}/orders/history'
  content = content.replace(/(`\$\{process\.env\.NEXT_PUBLIC_API_URL[^}]+\}[^'"`]*)(['"])/g, '$1`');
  
  fs.writeFileSync(filePath, content);
}

['src/context/CartContext.tsx', 'src/app/dashboard/page.tsx', 'src/app/checkout/page.tsx', 'src/app/products/[handle]/page.tsx'].forEach(fixQuotes);

// 2. Fix the missing try block open brackets in page.tsx, shop/page.tsx, pages/[slug]/page.tsx
function fixTryCatch(file) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // The error "Expected a semicolon" at catch (error) means the try block was closed too early or there is an extra closing brace before catch
  // Let's replace the entire try/catch block with a clean one
  
  // We can just use a regex to find the try block and replace it, but it's risky.
  // Let's look at the specific lines.
  const regex = /try\s*\{\n\s*const API_URL[^]+?catch\s*\(error\)/;
  const match = content.match(regex);
  if (match) {
    // Check if there are balanced braces
    let openBraces = 0;
    for (let i = 0; i < match[0].length; i++) {
      if (match[0][i] === '{') openBraces++;
      if (match[0][i] === '}') openBraces--;
    }
    // If openBraces is not 0 right before catch, we need to fix it.
    // In our case, openBraces is likely < 0 because of an extra }
    
    // Instead of complex AST, let's just force replace the known bad block.
  }
}

// Let's just rewrite the files using a simpler string replacement for the known bad block
function rewriteBadBlock(file) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  const badBlockRegex = /try\s*\{\n\s*const API_URL = process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/kalvix-nexus-production\.up\.railway\.app\/api';\n\s*const res = await fetch\(`\$\{API_URL\}\/products`, \{ cache: 'no-store' \}\);\n\s*if \(res\.ok\) \{\n\s*const data = await res\.json\(\);\n\s*if \(data\) \{\n\s*const arr = data\.data \|\| data;\n\s*if \(Array\.isArray\(arr\) && arr\.length > 0\) \{\n([^]+?)\n\s*\}\n\s*\}\n\s*\}\n\s*\}\s*catch\s*\(error\)/;

  content = content.replace(badBlockRegex, (match, inner) => {
    return `try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kalvix-nexus-production.up.railway.app/api';
    const res = await fetch(\`\${API_URL}/products\`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        const arr = data.data || data;
        if (Array.isArray(arr) && arr.length > 0) {
${inner}
        }
      }
    }
  } catch (error)`;
  });
  
  fs.writeFileSync(filePath, content);
}

['src/app/page.tsx', 'src/app/shop/page.tsx', 'src/app/pages/[slug]/page.tsx'].forEach(rewriteBadBlock);

console.log('Fix script done.');
