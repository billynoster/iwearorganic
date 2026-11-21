const fs = require('fs');
let code = fs.readFileSync('src/ai/flows/printify-products.ts', 'utf8');
code = code.replace(/const getPrintifyProductsFlow = ai\.defineFlow\([\s\S]*?\n\);/g, '');
code = code.replace(/const getPrintifyProductByIdFlow = ai\.defineFlow\([\s\S]*?\n\);/g, '');

code = code.replace(/export async function fetchPrintifyProductById[^}]*\}/, `export async function fetchPrintifyProductById(productId: string): Promise<PrintifyProduct> {
  const shopId = await getShopId();
  if (!shopId) return null as any;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_API_KEY;
  const response = await fetch(\`\${printifyAPI}/shops/\${shopId}/products/\${productId}.json\`, {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  if (!response.ok) throw new Error('Failed');
  const product = await response.json();
  applyProductOverrides(product);
  return product;
}`);

code = code.replace(/export async function fetchPrintifyProducts[^}]*\}/, `export async function fetchPrintifyProducts(): Promise<PrintifyProduct[]> {
  const shopId = await getShopId();
  if (!shopId) return [];
  let allProducts: PrintifyProduct[] = [];
  let currentPage = 1;
  let hasMorePages = true;
  while (hasMorePages) {
    const url = \`\${printifyAPI}/shops/\${shopId}/products.json?limit=50&page=\${currentPage}\`;
    const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_API_KEY;
    const response = await fetch(url, { headers: { Authorization: \`Bearer \${token}\` } });
    if (!response.ok) throw new Error('Failed');
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const validProducts = data.data.filter((p: PrintifyProduct) => !p.title.toLowerCase().startsWith('copy of') && !p.title.includes("bohemian floral t-shirt dress") && !p.title.includes("vibrant floral t-shirt dress") && !p.title.includes("chic polka dot women's long sleeve dance dress") && !p.title.includes("chic floral capri leggings") && !p.title.includes("patriotic triangle bikini") && !p.title.includes("signature seam racerback dress"));
      validProducts.forEach((p: PrintifyProduct) => applyProductOverrides(p));
      allProducts = allProducts.concat(validProducts);
    }
    if (!data.current_page || data.current_page >= data.last_page) hasMorePages = false;
    else currentPage++;
  }
  return allProducts;
}`);

fs.writeFileSync('src/ai/flows/printify-products.ts', code);
