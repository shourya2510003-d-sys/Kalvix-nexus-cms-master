const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/admin/dashboard/page.tsx');
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. handleInitializeLayout
  content = content.replace(
    /set\(ref\(db, targetLayoutKey\), asObject\)\n\s*\.then\(\(\) => alert\(`✅ Draft layout initialized for \$\{currentPageId\}!`\)\)/,
    `set(ref(db, targetLayoutKey), asObject)
      .then(() => {
        setHasUnpublishedChanges(true);
        alert(\`✅ Draft layout initialized for \${currentPageId}!\`);
      })`
  );

  // 2. handleMoveSection
  content = content.replace(
    /const targetLayoutKey = getDraftLayoutKey\(currentPageId\);\n\s*set\(ref\(db, targetLayoutKey\), asObject\);/,
    `const targetLayoutKey = getDraftLayoutKey(currentPageId);
    set(ref(db, targetLayoutKey), asObject);
    setHasUnpublishedChanges(true);`
  );

  // 3. handleAddPredefinedSection
  content = content.replace(
    /set\(ref\(db, targetLayoutKey\), asObject\)\.catch\(\(err\) => \{\n\s*console\.error\("Firebase sync error on adding section:", err\);\n\s*\}\);/,
    `set(ref(db, targetLayoutKey), asObject)
      .then(() => setHasUnpublishedChanges(true))
      .catch((err) => {
        console.error("Firebase sync error on adding section:", err);
      });`
  );

  // 4. Edit section Save Changes button click
  content = content.replace(
    /set\(ref\(db, targetLayoutKey\), asObject\)\.catch\(err => \{\n\s*console\.error\("Firebase save error:", err\);\n\s*alert\("Saved locally! Firebase sync failed, it will sync next time\."\);\n\s*\}\);/,
    `set(ref(db, targetLayoutKey), asObject)
                                  .then(() => setHasUnpublishedChanges(true))
                                  .catch(err => {
                                    console.error("Firebase save error:", err);
                                    alert("Saved locally! Firebase sync failed, it will sync next time.");
                                  });`
  );

  // 5. Visibility toggle click
  content = content.replace(
    /const targetLayoutKey = getDraftLayoutKey\(currentPageId\);\n\s*set\(ref\(db, targetLayoutKey\), asObject\);/,
    `const targetLayoutKey = getDraftLayoutKey(currentPageId);
                                       set(ref(db, targetLayoutKey), asObject);
                                       setHasUnpublishedChanges(true);`
  );

  fs.writeFileSync(filePath, content);
  console.log('Publish button triggers successfully updated in dashboard!');
}
