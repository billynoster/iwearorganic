const fs = require('fs');
let code = fs.readFileSync('src/components/shopping/media-section.tsx', 'utf8');

code = code.replace(
  `interface MediaItem {`,
  `interface MediaItem {`
); // just a check

// Add creatorId to author
code = code.replace(
  `  author: {
    name: string;
    avatar: string;
  };`,
  `  author: {
    name: string;
    avatar: string;
    creatorId?: string;
  };`
);

// Add router push
code = code.replace(
  `import { useState, useRef, useEffect, useMemo, useCallback } from 'react';`,
  `import { useState, useRef, useEffect, useMemo, useCallback } from 'react';\nimport { useRouter } from 'next/navigation';`
);

code = code.replace(
  `  const { addToCart } = useCart();`,
  `  const { addToCart } = useCart();\n  const router = useRouter();`
);

// Click handler for profile
code = code.replace(
  `        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-sm border border-white/50 shadow-lg">
             {item.author.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm drop-shadow-md leading-tight">
              {item.author.name}
            </span>`,
  `        <div 
            className="flex items-center gap-2.5 cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              if (item.author.creatorId) router.push('/creator/' + item.author.creatorId);
            }}
          >
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-black text-sm border border-white/50 shadow-lg">
             {item.author.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm drop-shadow-md leading-tight hover:underline">
              {item.author.name}
            </span>`
);

fs.writeFileSync('src/components/shopping/media-section.tsx', code);
