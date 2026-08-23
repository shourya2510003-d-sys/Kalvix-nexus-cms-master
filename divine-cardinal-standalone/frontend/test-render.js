const fs = require('fs');
const html = fs.readFileSync('output.html', 'utf8');
const match = html.match(/throw/i);
console.log(match);
