const fs = require('fs');
let code = fs.readFileSync('src/app/creator/[creatorId]/page.tsx', 'utf8');

code = code.replace(
  `export default function CreatorProfilePage({ params }: { params: { creatorId: string } }) {`,
  `import { use } from 'react';\nexport default function CreatorProfilePage({ params }: { params: Promise<{ creatorId: string }> }) {\n  const resolvedParams = use(params);\n  const creatorId = resolvedParams.creatorId;`
);

code = code.replaceAll('params.creatorId', 'creatorId');
fs.writeFileSync('src/app/creator/[creatorId]/page.tsx', code);
