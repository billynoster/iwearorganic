import { fetchPrintifyProducts } from './src/ai/flows/printify-products';
fetchPrintifyProducts().then(products => console.log(products.map(p => p.title)));
