const fs = require('fs');
const path = require('path');

const files = [
  'src/app/page.tsx',
  'src/app/shop/page.tsx',
  'src/app/pages/[slug]/page.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix orphaned Object.values(data).map
    content = content.replace(/Object\.values\(data\)\.map\(\(p: any\) => \{\n\s*const slug = p\.name \? p\.name\.toLowerCase\(\)\.replace\(\/\[\^a-z0-9\]\+\/g, '-'\)\.replace\(\/\(\^\-\|\-\$\)\+\/g, ''\) : `product-\$\{p\.id\}`;\n\s*const arr = data\.data \|\| data;/g, 'const arr = data.data || data;');
    
    // Fix any double 'const arr' in slug page
    content = content.replace(/const arr = data\.data \|\| data;\n\s*if \(Array\.isArray\(arr\) && arr\.length > 0\) \{\n\s*const arr = data\.data \|\| data;\n\s*\.filter/g, 'const arr = data.data || data;\n      if (Array.isArray(arr) && arr.length > 0) {\n        bestSellers = arr\n          .filter');
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed ${file}`);
  }
});
