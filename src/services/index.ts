/**
 * Commerce service interfaces — presentation-agnostic.
 * Fixtures are development-only and never represent production inventory/pricing.
 */

export * from './types';
export * from './fixtures';
export { catalogService } from './catalog';
export { variantsInventoryService } from './variants';
export { collectionsService } from './collections';
export { authService } from './auth';
export { cartService } from './cart';
export { checkoutSessionService } from './checkout';
export { orderStatusService } from './orders';
