const fs = require('fs');
let code = fs.readFileSync('src/components/layout/footer.tsx', 'utf8');
code = code.replace(/<Link href="\/shopping"/g, '<Link href="/"');
fs.writeFileSync('src/components/layout/footer.tsx', code);
