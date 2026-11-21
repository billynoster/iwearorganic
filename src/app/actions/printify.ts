"use server"

import { fetchPrintifyProducts, fetchPrintifyProductById } from '@/ai/flows/printify-products';

export async function getProductsAction() {
  return fetchPrintifyProducts();
}

export async function getProductByIdAction(id: string) {
  return fetchPrintifyProductById(id);
}
