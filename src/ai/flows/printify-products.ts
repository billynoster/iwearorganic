'use server';
/**
 * @fileOverview A flow for fetching products from a Printify store.
 *
 * - fetchPrintifyProducts - Fetches products from the Printify API.
 * - fetchPrintifyProductById - Fetches a single product by its ID from the Printify API.
 * - PrintifyProduct - The TypeScript type for a Printify product.
 */

import {z} from 'zod';
import { resolvePrintifyShopId } from '@/lib/printify-shop';

const PrintifyImageSchema = z.object({
  src: z.string().url(),
  variant_ids: z.array(z.number()),
  position: z.string(),
  is_default: z.boolean(),
});
export type PrintifyImage = z.infer<typeof PrintifyImageSchema>;


const PrintifyVariantSchema = z.object({
  id: z.number(),
  price: z.number(),
  title: z.string(),
  options: z.array(z.number()),
  is_enabled: z.boolean().optional(),
  is_available: z.boolean().optional(),
  is_default: z.boolean().optional(),
  sku: z.string().optional(),
  cost: z.number().optional(),
  grams: z.number().optional(),
  quantity: z.number().optional(),
});
export type PrintifyVariant = z.infer<typeof PrintifyVariantSchema>;

const PrintifyOptionValueSchema = z.object({
  id: z.number(),
  title: z.string(),
  colors: z.array(z.string()).optional(),
});
export type PrintifyOptionValue = z.infer<typeof PrintifyOptionValueSchema>;

const PrintifyOptionSchema = z.object({
  name: z.string(),
  type: z.string(),
  values: z.array(PrintifyOptionValueSchema),
  display_in_preview: z.boolean().optional(),
});
export type PrintifyOption = z.infer<typeof PrintifyOptionSchema>;

const PrintifyProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  images: z.array(PrintifyImageSchema),
  variants: z.array(PrintifyVariantSchema),
  options: z.array(PrintifyOptionSchema),
  visible: z.boolean().optional(),
  is_locked: z.boolean().optional(),
});

export type PrintifyProduct = z.infer<typeof PrintifyProductSchema>;

const printifyAPI = 'https://api.printify.com/v1';

/**
 * Filters out disabled variant options and deduplicates identical option value titles
 * (such as Printify providing multiple vendor entries for the same color like "Ash").
 * Also filters product.variants to only active, enabled variants so that pricing,
 * cart items, and catalog previews accurately reflect the seller-assigned active prices.
 */
function sanitizeProductOptionsAndVariants(product: PrintifyProduct) {
  if (!product || !product.options || !product.variants) return;

  const hasExplicitEnabledFlags = product.variants.some((v: any) => v.is_enabled !== undefined);
  const enabledVariants = hasExplicitEnabledFlags
    ? product.variants.filter((v: any) => v.is_enabled === true)
    : product.variants;

  const enabledOptionIds = new Set<number>();
  enabledVariants.forEach((v: any) => {
    if (Array.isArray(v.options)) {
      v.options.forEach((optId: number) => enabledOptionIds.add(optId));
    }
  });

  product.options = product.options.map(option => {
    const seenTitles = new Set<string>();
    const filteredValues: PrintifyOptionValue[] = [];

    for (const val of option.values) {
      if (hasExplicitEnabledFlags && enabledOptionIds.size > 0 && !enabledOptionIds.has(val.id)) {
        continue;
      }
      const normalizedTitle = val.title.trim();
      if (seenTitles.has(normalizedTitle)) {
        continue;
      }
      seenTitles.add(normalizedTitle);
      filteredValues.push(val);
    }

    return {
      ...option,
      values: filteredValues,
    };
  }).filter(opt => opt.values.length > 0);

  // Retain only enabled variants so default pricing and selections target active prices
  if (hasExplicitEnabledFlags && enabledVariants.length > 0) {
    product.variants = enabledVariants;
  }
}

/**
 * Applies custom overrides for specific products (e.g., custom high-res images).
 * Uses resilient keyword matching to avoid dash/special character mismatches.
 */
function applyProductOverrides(product: PrintifyProduct) {
  sanitizeProductOptionsAndVariants(product);

  const allVariantIds = product.variants.map(v => v.id);
  const title = product.title.toLowerCase();
  
  // Helper to check if title contains all provided keywords
  const has = (...keys: string[]) => keys.every(k => title.includes(k));

  // Overrides for Burgundy High Waisted Yoga Leggings
  if (has("burgundy", "yoga", "leggings")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Fburgundy%2Fblend%20yoga%20burgundy%20leggings%203.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Fburgundy%2Fblend%20yoga%20burgundy%20leggings%204.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Fburgundy%2Fblend%20yoga%20burgundy%20leggings%205.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Fburgundy%2Fblend%20yoga%20burgundy%20leggings%2001.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Oxblood collection (Leggings and Sports Bra)
  if (has("oxblood") && (has("yoga") || has("sports bra"))) {
    const isSportsBra = has("sports bra");
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2001.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: !isSportsBra
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2002.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2004.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2005.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2006.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2007.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "6",
        is_default: isSportsBra // Set as lead for Sports Bra
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Foxblood%2Fblend%20america%20oxblood%2008.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "7",
        is_default: false
      }
    ];
  }

  // Overrides for Burgundy Sports Bra
  if (has("burgundy", "sports bra")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Fburgundy%2Fsports%20bra%2Fblend%20america%20burgundy%20sports%20bra%2003.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Fburgundy%2Fsports%20bra%2Fblend%20america%20burgundy%20sports%20bra%2001.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Fburgundy%2Fsports%20bra%2Fblend%20america%20burgundy%20sports%20bra%2002.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fyoga%2Fburgundy%2Fsports%20bra%2Fblend%20america%20burgundy%20sports%20bra%2006.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Women's Vintage Swimsuit with Retro Stripes
  if (product.id === "67b272e6cae4c640ec0ec6e7" || has("vintage swimsuit", "retro stripes")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fretro%2Fblend%20america%20retro%20bikini%2001.png?alt=media&token=c5f08df8-e023-43ad-b6b4-b380c5b77a21",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fretro%2Fblend%20america%20retro%20bikini%2002.png?alt=media&token=3380f0f9-3177-4976-81e6-31751077e47f",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fretro%2Fblend%20america%20retro%20bikini%2005.png?alt=media&token=31f2fc44-7921-4541-9314-1cb2905a528a",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fretro%2Fblend%20america%20retro%20bikini%2020.png?alt=media&token=8a2fe87b-d654-45d3-9056-8ee2f64f7f70",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Solid Burgundy Racerback Dress
  if (has("solid", "burgundy", "racerback", "dress")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fburgundy%2Fblend%20america%20solid%20burgundy%20racerback%2001%204k.png?alt=media&token=21cbb6d4-ad1d-440e-a042-20b88356fd74",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fburgundy%2Fblend%20america%20solid%20burgundy%20racerback%2002%204k.png?alt=media&token=7c5a0025-096c-4927-96fe-f05665b0df36",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fburgundy%2Fblend%20america%20solid%20burgundy%20racerback%2003%204k.png?alt=media&token=32886a5d-3a5a-4f9c-a3ac-c3134dd23c66",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fburgundy%2Fblend%20america%20solid%20burgundy%20racerback%2004%204k.png?alt=media&token=4d5f8f7a-051b-451d-8e0a-f5dfb4c3a10e",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Cherry Red Racerback Dress
  if (has("cherry", "red", "racerback", "dress")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fcherry%2Fblend%20america%20racerback-dress-cherry-red-color-womens-sleeveless-tank-dress%2002.png?alt=media&token=8f8a7d79-be1d-425b-8867-0c964ff9d3bd",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fcherry%2Fblend%20america%20racerback-dress-cherry-red-color-womens-sleeveless-tank-dress%2003.png?alt=media&token=6d74a84f-b9a3-4370-94be-a0d4c4fb1ff5",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fcherry%2Fblend%20america%20racerback-dress-cherry-red-color-womens-sleeveless-tank-dress%2004.png?alt=media&token=5a2033b5-177a-465f-b411-2ef7fa68c829",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fcherry%2Fblend%20america%20racerback-dress-cherry-red-color-womens-sleeveless-tank-dress%2005.png?alt=media&token=222466d5-d0cf-45cf-98dc-02b19607757e",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Sage Racerback Dress
  if (has("sage") && has("racerback") && has("dress")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2001.png?alt=media&token=debafd1b-33b4-48ca-a8f3-7b712dce185d",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2002.png?alt=media&token=8ae92c65-db43-4789-b914-4e46eceef0b2",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2003.png?alt=media&token=cc714701-d061-457c-96eb-a4d2f9e3c3de",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2004.png?alt=media&token=a8817e0e-6bf9-46af-bbdd-9d6486c0c943",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2005.png?alt=media&token=c0f11354-bfe7-414b-9bb0-50f1d5b6416d",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2006.png?alt=media&token=c08f753c-8c88-4a2e-b82c-35e1dfc57086",
        variant_ids: allVariantIds,
        position: "6",
        is_default: false
      }
    ];
  }

  // Overrides for Moss Racerback Dress
  if (has("moss") && has("racerback") && has("dress")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2001.png?alt=media&token=019449d6-ee7e-46e4-a72b-31a3af87c18e",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2002.png?alt=media&token=f84da910-ef3e-4203-ac30-ccce4d4ee0b6",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2003.png?alt=media&token=788c33d0-1b57-4635-9408-17a377cc038e",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2004.png?alt=media&token=92f6ce35-e177-4c12-8bf8-9f11803054e5",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2005.png?alt=media&token=b8746bd7-08ff-4069-a859-551325ce9858",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      }
    ];
  }

  // Overrides for Solid Terracotta Racerback Dress
  if (has("solid") && has("terracotta") && has("racerback")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fsolid%20color%2Fblend%20america%20racerback%20solid%20dress%20terracotta%2005.png?alt=media&token=0e772550-c991-42aa-8053-aff31cf612a0",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fsolid%20color%2Fblend%20america%20racerback%20solid%20dress%20terracotta%2002.png?alt=media&token=4297b14b-6a33-4910-84e2-3b60bcd97086",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fsolid%20color%2Fblend%20america%20racerback%20solid%20dress%20terracotta%2003.png?alt=media&token=26392c4e-0a2e-46b5-96f7-a5510c655432",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fsolid%20color%2Fblend%20america%20racerback%20solid%20dress%20terracotta%2006.png?alt=media&token=e51aa2e9-8099-4ecc-95a8-f0fd52f74ab1",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Solid Burgundy Racerback Dress
  if (has("solid", "burgundy", "racerback", "dress")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fburgundy%2Fblend%20america%20solid%20burgundy%20racerback%2001%204k.png?alt=media&token=21cbb6d4-ad1d-440e-a042-20b88356fd74",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fburgundy%2Fblend%20america%20solid%20burgundy%20racerback%2002%204k.png?alt=media&token=7c5a0025-096c-4927-96fe-f05665b0df36",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fburgundy%2Fblend%20america%20solid%20burgundy%20racerback%2003%204k.png?alt=media&token=32886a5d-3a5a-4f9c-a3ac-c3134dd23c66",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fburgundy%2Fblend%20america%20solid%20burgundy%20racerback%2004%204k.png?alt=media&token=4d5f8f7a-051b-451d-8e0a-f5dfb4c3a10e",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Cherry Red Racerback Dress
  if (has("cherry", "red", "racerback", "dress")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fcherry%2Fblend%20america%20racerback-dress-cherry-red-color-womens-sleeveless-tank-dress%2002.png?alt=media&token=8f8a7d79-be1d-425b-8867-0c964ff9d3bd",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fcherry%2Fblend%20america%20racerback-dress-cherry-red-color-womens-sleeveless-tank-dress%2003.png?alt=media&token=6d74a84f-b9a3-4370-94be-a0d4c4fb1ff5",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fcherry%2Fblend%20america%20racerback-dress-cherry-red-color-womens-sleeveless-tank-dress%2004.png?alt=media&token=5a2033b5-177a-465f-b411-2ef7fa68c829",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fcherry%2Fblend%20america%20racerback-dress-cherry-red-color-womens-sleeveless-tank-dress%2005.png?alt=media&token=222466d5-d0cf-45cf-98dc-02b19607757e",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Sage Racerback Dress
  if (has("sage") && has("racerback") && has("dress")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2001.png?alt=media&token=debafd1b-33b4-48ca-a8f3-7b712dce185d",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2002.png?alt=media&token=8ae92c65-db43-4789-b914-4e46eceef0b2",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2003.png?alt=media&token=cc714701-d061-457c-96eb-a4d2f9e3c3de",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2004.png?alt=media&token=a8817e0e-6bf9-46af-bbdd-9d6486c0c943",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2005.png?alt=media&token=c0f11354-bfe7-414b-9bb0-50f1d5b6416d",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FSolid%20Colors%2Fsage%2Fblend%20america%20racerback%20dress%20sage%2006.png?alt=media&token=c08f753c-8c88-4a2e-b82c-35e1dfc57086",
        variant_ids: allVariantIds,
        position: "6",
        is_default: false
      }
    ];
  }

  // Overrides for Moss Racerback Dress
  if (has("moss") && has("racerback") && has("dress")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2001.png?alt=media&token=019449d6-ee7e-46e4-a72b-31a3af87c18e",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2002.png?alt=media&token=f84da910-ef3e-4203-ac30-ccce4d4ee0b6",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2003.png?alt=media&token=788c33d0-1b57-4635-9408-17a377cc038e",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2004.png?alt=media&token=92f6ce35-e177-4c12-8bf8-9f11803054e5",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FMOSS%2Fblend%20america%20racerback%20dress%20moss%2005.png?alt=media&token=b8746bd7-08ff-4069-a859-551325ce9858",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      }
    ];
  }

  // Overrides for Solid Terracotta Racerback Dress
  if (has("solid") && has("terracotta") && has("racerback")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fsolid%20color%2Fblend%20america%20racerback%20solid%20dress%20terracotta%2005.png?alt=media&token=0e772550-c991-42aa-8053-aff31cf612a0",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fsolid%20color%2Fblend%20america%20racerback%20solid%20dress%20terracotta%2002.png?alt=media&token=4297b14b-6a33-4910-84e2-3b60bcd97086",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fsolid%20color%2Fblend%20america%20racerback%20solid%20dress%20terracotta%2003.png?alt=media&token=26392c4e-0a2e-46b5-96f7-a5510c655432",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fsolid%20color%2Fblend%20america%20racerback%20solid%20dress%20terracotta%2006.png?alt=media&token=e51aa2e9-8099-4ecc-95a8-f0fd52f74ab1",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Antique White Racerback Dress
  if (has("antique", "white") && has("racerback")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fsolid%2Fblend%20america%20racerback%20dress%20antique%20white%2001.png?alt=media&token=769ef1b2-62de-429b-b209-a6be9e6a8267",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fsolid%2Fblend%20america%20racerback%20dress%20antique%20white%2002.png?alt=media&token=3a5934de-9830-48b5-bee8-59a6ff46def7",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fsolid%2Fblend%20america%20racerback%20dress%20antique%20white%2003.png?alt=media&token=10d598b6-84cd-4365-b7eb-307f61566a9e",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fsolid%2Fblend%20america%20racerback%20dress%20antique%20white%2004.png?alt=media&token=bb9ccf01-a695-4f9b-9590-0191f77e2b46",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Red Triangle Bikini
  if (has("red", "triangle", "bikini")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2001.jpeg?alt=media&token=f5354516-4e6a-4281-a1e4-253bd486a775",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2002.jpeg?alt=media&token=5ce0e189-7f64-4012-a4c1-177fd04895c6",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2003.jpeg?alt=media&token=465bf3f2-bd94-4ff2-ad6f-fa071cb22d98",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2004.jpeg?alt=media&token=8166e4dd-0c40-40a3-a15b-3190e8172d3d",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2006.jpeg?alt=media&token=4bebfe3e-e489-41af-8de7-0e00946740df",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      }
    ];
  }

  // Overrides for Stars & Stripes Bikini
  if (has("stars", "stripes", "bikini")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fusa%20flag%2Fblend%20america%20usa%202.png?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fusa%20flag%2Fblend%20america%20usa%204.png?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fusa%20flag%2Fblend%20america%20usa%206.png?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fusa%20flag%2Fblend%20america%20usa%20flag%201.png?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fusa%20flag%2Fblend%20america%20usa%20product%20shot%201.png?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      }
    ];
  }

  // Overrides for Solid Olive Triangle Bikini Swimsuit
  if (has("solid", "olive", "bikini") || has("green", "string", "bikini")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fmoss%2Fblend%20america%20moss%2015.png?alt=media&token=412620d3-81b2-4d0b-be9c-471ab826ca1d",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fmoss%2Fblend%20america%20moss%2016.png?alt=media&token=53094de6-a9a2-4a65-ada2-237adaefbc46",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fmoss%2Fblend%20america%20moss%2017.png?alt=media&token=13024290-6679-4234-a05e-beffe915a0b1",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fmoss%2Fblend%20america%20moss%2009.png?alt=media&token=78bea79d-4e8d-40e7-baa9-902652135448",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Solid Terracotta Triangle Bikini Swimsuit
  if (has("solid", "terracotta", "bikini") || has("terracotta", "triangle", "bikini")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fterracotta%2Fblend%20america%20bikini%20terracotta%2004.png?alt=media&token=06b1633e-f7ef-4ec3-84e1-c7cfd7bd3655",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fterracotta%2Fblend%20america%20bikini%20terracotta%2001.png?alt=media&token=450b9bfc-9664-43a9-af9f-eeb4bcbf0a01",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fterracotta%2Fblend%20america%20bikini%20terracotta%2002.png?alt=media&token=87653741-05f9-446e-a5a6-2b0fb6217604",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fterracotta%2Fblend%20america%20bikini%20terracotta%2005.png?alt=media&token=97aa23ae-bff8-43d5-8c14-6f5534542e04",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fterracotta%2Fblend%20america%20bikini%20terracotta%2006.png?alt=media&token=e719edac-56ff-4a61-a435-73cd65e9e2cc",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fterracotta%2Fblend%20america%20bikini%20terracotta%2008.png?alt=media&token=43e4b956-4e48-45fa-9883-5f9ca8834698",
        variant_ids: allVariantIds,
        position: "6",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fterracotta%2Fblend%20america%20bikini%20terracotta%2009.png?alt=media&token=3ecc9220-c49d-4015-bbee-ea0643f716cb",
        variant_ids: allVariantIds,
        position: "7",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fterracotta%2Fblend%20america%20bikini%20terracotta%2013.png?alt=media&token=985be20e-e2e9-47d7-a562-566864b6d366",
        variant_ids: allVariantIds,
        position: "8",
        is_default: false
      }
    ];
  }

  // Overrides for Solid Burgundy Bikini Swimsuit
  if (has("solid", "burgundy", "bikini") || has("burgundy", "triangle", "bikini")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fburgundy%2Fblend%20america%20burgundy%2008.png?alt=media&token=3963ece4-f748-49b8-9493-321c8f9e5f43",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fburgundy%2Fblend%20america%20burgundy%20010.png?alt=media&token=dcca7123-4a61-4b4c-ad44-e5842d7a5dd8",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fburgundy%2Fblend%20america%20burgundy%2005.png?alt=media&token=0b743fa5-5a94-47d2-bd22-7865a4d31348",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fburgundy%2Fblend%20america%20burgundy%2003.png?alt=media&token=c33a0239-00d6-4056-8b05-a68531c5b997",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Red Triangle Bikini
  if (has("red", "triangle", "bikini")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2001.jpeg?alt=media&token=f5354516-4e6a-4281-a1e4-253bd486a775",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2002.jpeg?alt=media&token=5ce0e189-7f64-4012-a4c1-177fd04895c6",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2003.jpeg?alt=media&token=465bf3f2-bd94-4ff2-ad6f-fa071cb22d98",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2004.jpeg?alt=media&token=8166e4dd-0c40-40a3-a15b-3190e8172d3d",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fred%20bikini%2Fblend%20america%20red%20bikini%2006.jpeg?alt=media&token=4bebfe3e-e489-41af-8de7-0e00946740df",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      }
    ];
  }

  // Overrides for Antique White Triangle Bikini
  if (has("antique white", "triangle", "bikini") || has("solid antique white triangle bikini swimsuit")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fwhite%2Fblend%20america%20antique%20white%20swimwear%2001.png?alt=media&token=71028e68-dcd1-49a6-820d-46d6cad22f7c",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fwhite%2Fblend%20america%20antique%20white%20swimwear%2003.png?alt=media&token=c0c8909d-26b4-4b8f-bf82-d9c5ad163c90",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fwhite%2Fblend%20america%20antique%20white%20swimwear%2004.png?alt=media&token=f8bc2955-5eee-444f-8032-b78b91efd2e0",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fwhite%2Fblend%20america%20antique%20white%20swimwear%2005.png?alt=media&token=86e25e27-544d-4399-8789-47e96e1b8f6b",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fswimwear%2Fwhite%2Fblend%20america%20antique%20white%20swimwear%2007.png?alt=media&token=e026a83d-e110-4592-97a0-ff64c71b3b4a",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      }
    ];
  }

  // Overrides for Women's Casual Racerback Dress (Antique White Pattern)
  if (has("women's casual racerback dress") && !has("crimson", "sage", "terracotta", "midnight", "emerald", "sand stone", "olive", "slate")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FANTIQUE%20WHITE%20LONG%2011.png?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FANTIQUE%20WHITE%20LONG%2013.png?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FANTIQUE%20WHITE%2010.png?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FANTIQUE%20WHITE%2012.png?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FANTIQUE%20WHITE%2017.png?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FANTIQUE%20WHITE%2023.png?alt=media",
        variant_ids: allVariantIds,
        position: "6",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FANTIQUE%20WHITE%207.png?alt=media",
        variant_ids: allVariantIds,
        position: "7",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FANTIQUE%20WHITE%208.png?alt=media",
        variant_ids: allVariantIds,
        position: "8",
        is_default: false
      }
    ];
  }

  // Overrides for Signature Seam Racerback Dress – Crimson Red
  if (has("signature seam racerback dress", "crimson red")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FRED%2FRED%202.png?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FRED%2FRED%203.png?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FRED%2FRED%208.png?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FRED%2Fpomelli-image-2.png?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2FRED%2Fpomelli-image-3.png?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      }
    ];
  }

  // Overrides for Signature Seam Racerback Dress – Sage
  if (has("signature seam racerback dress", "sage") && !has("olive")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fsage%2Fblend%20america%20sage%2006.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fsage%2Fblend%20america%20sage%2005.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fsage%2Fblend%20america%20sage%2008.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fsage%2Fblend%20america%20sage%2009.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Signature Seam Racerback Dress – Terracotta
  if (has("signature seam racerback dress", "terracotta")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fblend%20america%20terracotta%2002.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fblend%20america%20terracotta%2001.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fblend%20america%20terracotta%2007.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fterracotta%2Fblend%20america%20terracotta%2003.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      }
    ];
  }

  // Overrides for Signature Seam Racerback Dress – Antique White
  if (product.id === "6896c3dd10430a23e7107a61" || has("signature seam racerback dress", "antique white")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fblend%20america%20antique%20white%2018.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fblend%20america%20antique%20white%2013.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fblend%20america%20antique%20white%2014.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fblend%20america%20antique%20white%2016.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fblend%20america%20antique%20white%2017.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fblend%20america%20antique%20white%2007.png?alt=media",
        variant_ids: allVariantIds,
        position: "6",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fblend%20america%20antique%20white%2010.png?alt=media",
        variant_ids: allVariantIds,
        position: "7",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fblend%20america%20antique%20white%2012.png?alt=media",
        variant_ids: allVariantIds,
        position: "8",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fantique%20white%2Fblend%20america%20antique%20white%2019.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "9",
        is_default: false
      }
    ];
  }

  // Overrides for Signature Seam Racerback Dress – Sand Stone
  if (has("signature seam racerback dress", "sand stone")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fsand%20stone%2Fblend%20america%20sand%20stone%2006.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fsand%20stone%2Fblend%20america%20sand%20stone%2007.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fsand%20stone%2Fblend%20america%20sand%20stone%2001.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fsand%20stone%2Fblend%20america%20sand%20stone%2002.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fsand%20stone%2Fblend%20america%20sand%20stone%2003.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      }
    ];
  }

  // Overrides for Signature Seam Racerback Dress – Slate Blue
  if (has("signature seam racerback dress", "slate blue")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fslate%20blue%2Fblend%20america%20slate%20blue%2001.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fcurrent%2Fslate%20blue%2Fblend%20america%20slate%20blue%2007.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fslate%20blue%2Fblend%20america%20slate%20blue%2003.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fslate%20blue%2Fblend%20america%20slate%20blue%2010.png?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fslate%20blue%2Fblend%20america%20slate%20blue%2011.png?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fslate%20blue%2Fblend%20america%20slate%20blue%2012.png?alt=media",
        variant_ids: allVariantIds,
        position: "6",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fslate%20blue%2Fblend%20america%20slate%20blue%2015.png?alt=media",
        variant_ids: allVariantIds,
        position: "7",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fslate%20blue%2Fblend%20america%20slate%20blue%2017.png?alt=media",
        variant_ids: allVariantIds,
        position: "8",
        is_default: false
      }
    ];
  }

  // Overrides for Signature Seam Racerback Dress – Olive Stone
  if (has("signature seam racerback dress", "olive stone")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Folive%2Fblend%20america%20olive%2004.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Folive%2Fblend%20america%20olive%2001.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Folive%2Fblend%20america%20olive%2002.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Folive%2Fblend%20america%20olive%2003.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Folive%2Fblend%20america%20olive%2005.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Folive%2Fblend%20america%20olive%2006.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "6",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Folive%2Fblend%20america%20olive%2007.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "7",
        is_default: false
      }
    ];
  }

  // Overrides for Signature Seam Racerback Dress – Midnight Navy
  if (has("signature seam racerback dress", "midnight navy")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fmidnight%20navy%2Fblend%20america%20midnight%20blue%2007.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fmidnight%20navy%2Fblend%20america%20midnight%20blue%2005.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fmidnight%20navy%2Fblend%20america%20midnight%20blue%2004.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fmidnight%20navy%2Fblend%20america%20midnight%20blue%2008.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fmidnight%20navy%2Fblend%20america%20midnight%20blue%2009.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Fmidnight%20navy%2Fblend%20america%20midnight%20blue%2010.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "6",
        is_default: false
      }
    ];
  }

  // Overrides for Signature Seam Racerback Dress – Emerald
  if (has("signature seam racerback dress", "emerald")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2016.png?alt=media",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2001.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2003.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2004.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "4",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2008.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "5",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2010.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "6",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2012.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "7",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2014.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "8",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2015.jpeg?alt=media",
        variant_ids: allVariantIds,
        position: "9",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fdresses%2Femerald%2Fblend%20america%20emerald%2017.png?alt=media",
        variant_ids: allVariantIds,
        position: "10",
        is_default: false
      }
    ];
  }

  // Overrides for Moss Retro Racing Stripes Sweatshirt
  if (has("moss") && has("sweatshirt") && has("retro racing stripes")) {
    product.images = [
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fmen%2Fsweatshirt%2Fmoss%20green%2Fblend%20america%20moss%20green%20sweatshirt%2008.png?alt=media&token=2f9f3f1f-f213-4fed-9d5d-52653641958d",
        variant_ids: allVariantIds,
        position: "1",
        is_default: true
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fmen%2Fsweatshirt%2Fmoss%20green%2Fblend%20america%20moss%20green%20sweatshirt%2007.png?alt=media&token=fc91b45f-0dd6-4531-b783-ac34fba8746c",
        variant_ids: allVariantIds,
        position: "2",
        is_default: false
      },
      {
        src: "https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Fmen%2Fsweatshirt%2Fmoss%20green%2Fblend%20america%20moss%20green%20sweatshirt%2006.png?alt=media&token=a79bbf93-b7ab-4dfe-aa49-1b8922e434cc",
        variant_ids: allVariantIds,
        position: "3",
        is_default: false
      }
    ];
  }
}

async function getShopId(): Promise<string> {
  try {
    return await resolvePrintifyShopId();
  } catch (err) {
    console.error('[printify-products] resolvePrintifyShopId failed:', err);
    throw err;
  }
}






/**
 * Checks whether a product should be hidden from the storefront.
 * Excludes discontinued, duplicate, or explicitly hidden items.
 */
function isProductHidden(product: { id?: string; title?: string; visible?: boolean }): boolean {
  if (!product) return true;

  const id = product.id || '';
  // Explicitly hidden products (including Moss and Burgundy retro racing stripes sweatshirts and older draft items)
  if (
    id === '6a7fe05bd171f252ad0c1f3b' || // Blend Logo Sweatshirt | Moss | Retro Racing Stripes
    id === '6a7fd5099b54c111e50726cc' || // Blend Logo Sweatshirt | Burgundy | Retro Racing Stripes
    id === '6a666f0846b4a23b8900baa1'    // older draft BLEND Hoodie Pullover
  ) {
    return true;
  }

  const titleLower = (product.title || '').toLowerCase();
  if (
    titleLower.startsWith('copy of') ||
    titleLower.includes("bohemian floral t-shirt dress") ||
    titleLower.includes("vibrant floral t-shirt dress") ||
    titleLower.includes("chic polka dot women's long sleeve dance dress") ||
    titleLower.includes("chic floral capri leggings") ||
    titleLower.includes("patriotic triangle bikini") ||
    titleLower.includes("signature seam racerback dress") ||
    (titleLower.includes("moss") && titleLower.includes("retro racing stripes")) ||
    (titleLower.includes("burgundy") && titleLower.includes("retro racing stripes"))
  ) {
    return true;
  }

  return false;
}

export async function fetchPrintifyProductById(productId: string): Promise<PrintifyProduct> {
  const shopId = await getShopId();
  if (!shopId) return null as any;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_API_KEY;
  const response = await fetch(`${printifyAPI}/shops/${shopId}/products/${productId}.json`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Failed');
  const product = await response.json();
  
  if (isProductHidden(product)) {
    return null as any; // Discontinued or hidden product
  }
  
  applyProductOverrides(product);
  return product;
}


export async function fetchPrintifyProducts(): Promise<PrintifyProduct[]> {
  const shopId = await getShopId();
  if (!shopId) return [];
  let allProducts: PrintifyProduct[] = [];
  let currentPage = 1;
  let hasMorePages = true;
  while (hasMorePages) {
    const url = `${printifyAPI}/shops/${shopId}/products.json?limit=50&page=${currentPage}`;
    const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_API_KEY;
    const response = await fetch(url, { 
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Failed');
    const data = await response.json();
    if (data.data && data.data.length > 0) {
      const validProducts = data.data.filter((p: PrintifyProduct) => !isProductHidden(p));
      validProducts.forEach((p: PrintifyProduct) => applyProductOverrides(p));
      allProducts = allProducts.concat(validProducts);
    }
    if (!data.current_page || data.current_page >= data.last_page) hasMorePages = false;
    else currentPage++;
  }
  return allProducts;
}
