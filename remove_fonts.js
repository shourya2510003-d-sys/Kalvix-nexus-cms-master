const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function processDir(baseDir) {
  walkDir(baseDir, function(filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;
      
      // Remove next/font/google imports
      if (content.includes('next/font/google')) {
        content = content.replace(/import\s+\{.*\}\s+from\s+['"]next\/font\/google['"];?/g, '');
        
        // Remove font instantiations
        content = content.replace(/const\s+\w+\s*=\s*\w+\(\{.*\}\);/g, '');
        content = content.replace(/className=\{`?[\w\s\$]*\$\{?\w+\.className\}?[\w\s\$]*`?\}/g, 'className=""');
        content = content.replace(/\w+\.className/g, '""');
        content = content.replace(/\w+\.variable/g, '""');
        
        if (content !== original) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log('Removed fonts from', filePath);
        }
      }
    }
  });
}

processDir('/opt/app/frontend/src');
processDir('/opt/app/divine-cardinal/frontend/src');
