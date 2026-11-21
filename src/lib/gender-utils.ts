/**
 * Categorizes a product's gender eligibility using a robust 3-tier hierarchy:
 * 1. Explicit Title Designation (e.g. "Men's BLEND Pullover Hoodie" or "Women's Cropped Fleece")
 * 2. Inherent Category Attributes (Dresses, Skirts, Bikinis, Sports Bras, Leggings -> Women; Swim Trunks -> Men)
 * 3. Tag & Unisex Fallback (Manufacturer tags from Printify)
 */

export interface ProductGenderEligibility {
  forMen: boolean;
  forWomen: boolean;
  isUnisex: boolean;
}

export function getProductGenderEligibility(titleInput: string, tagsInput: string[] = []): ProductGenderEligibility {
  const title = (titleInput || '').toLowerCase();
  const tags = tagsInput.map(t => (t || '').toLowerCase());

  // 1. Explicit Title Keywords
  const hasWomensTitle = /\b(women's|womens|women|for women|gift for her)\b/i.test(title);
  const hasMensTitle = /\b(men's|mens|men|for men|gift for him)\b/i.test(title);
  const hasUnisexTitle = /\b(unisex)\b/i.test(title);

  // If the merchant explicitly specifies the gender in the product title, respect it 100%
  if (hasWomensTitle && !hasMensTitle) {
    return { forMen: false, forWomen: true, isUnisex: false };
  }
  if (hasMensTitle && !hasWomensTitle) {
    return { forMen: true, forWomen: false, isUnisex: false };
  }
  if (hasUnisexTitle) {
    return { forMen: true, forWomen: true, isUnisex: true };
  }

  // 2. Inherent Category Matching
  // Items that are inherently feminine even if "Women's" is not in the title
  const isInherentlyWomen =
    title.includes('dress') ||
    title.includes('skirt') ||
    title.includes('bikini') ||
    title.includes('sports bra') ||
    title.includes('legging') ||
    title.includes('capri') ||
    tags.some(t =>
      t === 'dresses' ||
      t === 'dress' ||
      t.includes('skirt') ||
      t.includes('bikini') ||
      t.includes('sports bra') ||
      t.includes('leggings') ||
      t.includes('capri') ||
      t.includes('women\'s fashion') ||
      t.includes('women\'s swimwear') ||
      t.includes('swimwear for women')
    );

  // Items that are inherently masculine
  const isInherentlyMen =
    title.includes('swim trunk') ||
    title.includes('surfing short') ||
    tags.some(t => t.includes('swim trunk') || t.includes('surfing shorts men'));

  if (isInherentlyWomen && !isInherentlyMen) {
    return { forMen: false, forWomen: true, isUnisex: false };
  }
  if (isInherentlyMen && !isInherentlyWomen) {
    return { forMen: true, forWomen: false, isUnisex: false };
  }

  // 3. Fallback to Tags from Printify
  const hasWomensTag = tags.some(t => /\b(women's clothing|womens clothing)\b/i.test(t));
  const hasMensTag = tags.some(t => /\b(men's clothing|mens clothing)\b/i.test(t));
  const isUnisexTag = tags.some(t => t === 'unisex' || t.includes('unisex'));

  // If manufacturer tagged both Men and Women (common for blank hoodies, sweatshirts, t-shirts) or tagged Unisex
  if (isUnisexTag || (hasMensTag && hasWomensTag)) {
    return {
      forMen: true,
      forWomen: true,
      isUnisex: true,
    };
  }

  // If tagged only for Men
  if (hasMensTag && !hasWomensTag) {
    return { forMen: true, forWomen: false, isUnisex: false };
  }

  // If tagged only for Women
  if (hasWomensTag && !hasMensTag) {
    return { forMen: false, forWomen: true, isUnisex: false };
  }

  // Neutral items (e.g. Beanies, Hats)
  return {
    forMen: true,
    forWomen: true,
    isUnisex: true,
  };
}
