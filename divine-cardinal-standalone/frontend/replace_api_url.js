const fs = require('fs');
const glob = require('glob');

const searchRegex = /const API_URL = 'https:\/\/kalvix-nexus-production\.up\.railway\.app\/api';/g;
const replacement = "const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';";

const files = glob.sync('src/**/*.{ts,tsx}');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.match(searchRegex)) {
    content = content.replace(searchRegex, replacement);
    fs.writeFileSync(file, content);
    console.log('Updated ' + file);
  }
}
