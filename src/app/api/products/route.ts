import { NextResponse } from 'next/server';
import { fetchPrintifyProducts } from '@/ai/flows/printify-products';

export const dynamic = 'force-dynamic'; // Prevent Next.js from caching the deleted Printify products

export async function GET() {
  try {
    const products = await fetchPrintifyProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products API:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
