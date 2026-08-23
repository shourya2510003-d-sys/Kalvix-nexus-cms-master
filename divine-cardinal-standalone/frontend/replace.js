const fs = require('fs');

const files = [
  './src/context/CartContext.tsx',
  './src/app/products/[handle]/page.tsx',
  './src/app/checkout/page.tsx',
  './src/app/dashboard/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/'http:\/\/localhost:4000\/api/g, '`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:4000/api\'}');
  content = content.replace(/`http:\/\/localhost:4000\/api/g, '`${process.env.NEXT_PUBLIC_API_URL || \'http://localhost:4000/api\'}');
  fs.writeFileSync(file, content);
});

console.log('Finished replacing localhost with API_URL');
