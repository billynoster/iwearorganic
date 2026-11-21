const fs = require('fs');
let code = fs.readFileSync('src/app/home-page.tsx', 'utf8');
code = code.replace(
  `<MediaSection onMediaClick={(category) => {`,
  `<MediaSection userPrefs={userPrefs} products={products} onMediaClick={(category) => {`
);
fs.writeFileSync('src/app/home-page.tsx', code);
