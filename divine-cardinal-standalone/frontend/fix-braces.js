const fs = require('fs');
const path = require('path');

['src/app/page.tsx', 'src/app/shop/page.tsx', 'src/app/pages/[slug]/page.tsx'].forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // The previous error happened because we deleted a `}` during replacement.
    // We just need to add a `}` right before `} catch (error)`
    content = content.replace(/\}\n\s*\}\s*catch\s*\(error\)/, '}\n    }\n  } catch (error)');
    
    fs.writeFileSync(filePath, content);
  }
});
console.log('Fixed brace matching!');
