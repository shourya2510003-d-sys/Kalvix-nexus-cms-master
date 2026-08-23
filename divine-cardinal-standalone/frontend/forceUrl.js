const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace `process.env.NEXT_PUBLIC_API_URL || '...'` with `'https://kalvix-nexus-production.up.railway.app/api'`
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*'[^']+'/g, "'https://kalvix-nexus-production.up.railway.app/api'");
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*`[^`]+`/g, "'https://kalvix-nexus-production.up.railway.app/api'");
  
  // Replace inside template literals: `${process.env.NEXT_PUBLIC_API_URL || '...'}/...`
  // Actually the above replace might handle it inside `${...}` if it matches exactly. Let's see.
  // We want to make sure we don't leave syntax errors.
  
  // Let's just do a simpler search and replace.
  content = content.replace(/\$\{process\.env\.NEXT_PUBLIC_API_URL[^}]+\}/g, 'https://kalvix-nexus-production.up.railway.app/api');
  content = content.replace(/process\.env\.NEXT_PUBLIC_API_URL[^|]*\|\|\s*'[^']+'/g, "'https://kalvix-nexus-production.up.railway.app/api'");
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
    count++;
  }
});

console.log(`Updated ${count} files to strictly hardcode the backend URL.`);
