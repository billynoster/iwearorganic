import type { ProductVariant, ServiceMeta } from './types';
import { catalogService } from './catalog';

export interface VariantsInventoryService {
  getVariantsForProduct(
    productId: string
  ): Promise<{ variants: ProductVariant[]; meta: ServiceMeta }>;
  getAvailableVariant(
    productId: string,
    variantId: string
  ): Promise<{ variant: ProductVariant | null; meta: ServiceMeta }>;
}

export const variantsInventoryService: VariantsInventoryService = {
  async getVariantsForProduct(productId) {
    const { product, meta } = await catalogService.getProductById(productId);
    return { variants: product?.variants ?? [], meta };
  },

  async getAvailableVariant(productId, variantId) {
    const { variants, meta } = await this.getVariantsForProduct(productId);
    const variant =
      variants.find(
        (v) => v.id === variantId && v.isEnabled && v.isAvailable
      ) ?? null;
    return { variant, meta };
  },
};
