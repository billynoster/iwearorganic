const fs = require('fs');
let code = fs.readFileSync('src/components/shopping/media-section.tsx', 'utf8');

if (!code.includes('useCart')) {
  code = code.replace(
    `import { calculateVibeMatch`,
    `import { useCart } from '@/context/cart-context';\nimport { calculateVibeMatch`
  );
  
  code = code.replace(
    `function MediaCard({ `,
    `function MediaCard({ `
  );
  
  code = code.replace(
    `  const videoRef = useRef<HTMLVideoElement>(null);`,
    `  const { addToCart } = useCart();\n  const videoRef = useRef<HTMLVideoElement>(null);`
  );

  code = code.replace(
    `<Button size="sm" className="w-full text-xs font-bold">Add to Cart</Button>`,
    `<Button size="sm" className="w-full text-xs font-bold" onClick={(e) => { e.stopPropagation(); addToCart({ product, variant: product.variants[0], quantity: 1 }); }}>Add to Cart</Button>`
  );

  fs.writeFileSync('src/components/shopping/media-section.tsx', code);
}
