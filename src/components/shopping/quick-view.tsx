'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { PrintifyProduct } from '@/ai/flows/printify-products';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/context/cart-context';
import { Zap, ShoppingCart, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getProductGenderEligibility } from '@/lib/gender-utils';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickViewProps {
  product: PrintifyProduct;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const { addToCart, openCart } = useCart();
  
  const filteredOptions = useMemo(() => {
    if (!product.options) return [];
    
    const enabledOptionIds = new Set<number>();
    if (product.variants) {
      product.variants.forEach((v: any) => {
        if (v.is_enabled !== false) {
          if (Array.isArray(v.options)) {
            v.options.forEach((optId: number) => enabledOptionIds.add(optId));
          }
        }
      });
    }

    return product.options.map(option => ({
      ...option,
      values: option.values.filter(v => enabledOptionIds.has(v.id))
    })).filter(opt => opt.values.length > 0);
  }, [product.options, product.variants]);

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>(() => {
    const initialOptions: { [key: string]: string } = {};
    if (filteredOptions) {
      filteredOptions.forEach(option => {
        if (option.values.length > 0) {
          initialOptions[option.name] = option.values[0].title;
        }
      });
    }
    return initialOptions;
  });

  // Re-sync default selected options if product changes
  useEffect(() => {
    if (filteredOptions) {
      setSelectedOptions(prev => {
        const next = { ...prev };
        filteredOptions.forEach(option => {
          if (!next[option.name] && option.values.length > 0) {
            next[option.name] = option.values[0].title;
          }
        });
        return next;
      });
    }
  }, [filteredOptions]);

  const selectedVariant = useMemo(() => {
    if (!product.variants || !product.options) return null;

    const optionValueIdMap = new Map<string, number>();
    product.options.forEach(option => {
      option.values.forEach(value => {
        optionValueIdMap.set(value.title, value.id);
      });
    });
    
    const selectedOptionIds = Object.values(selectedOptions)
      .map(title => optionValueIdMap.get(title))
      .filter((id): id is number => id !== undefined);

    return product.variants.find(variant => {
      const sortedVariantOptions = [...variant.options].sort();
      const sortedSelectedOptions = [...selectedOptionIds].sort();
      return JSON.stringify(sortedVariantOptions) === JSON.stringify(sortedSelectedOptions);
    }) || null;
  }, [product, selectedOptions]);

  const price = selectedVariant ? selectedVariant.price / 100 : 0;
  
  const activeImage = useMemo(() => {
    if (selectedVariant) {
      const variantImage = product.images.find(img => img.variant_ids.includes(selectedVariant.id));
      if (variantImage) return variantImage;
    }
    return product.images.find(img => img.is_default) || product.images[0];
  }, [selectedVariant, product.images]);

  const handleAddToCart = () => {
    if (selectedVariant) {
      addToCart(product, selectedVariant);
      onClose();
      openCart();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-[2/3] md:aspect-auto bg-muted">
            {activeImage && (
              <Image
                src={activeImage.src}
                alt={product.title}
                fill
                className="object-cover object-top"
              />
            )}
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
            <DialogHeader className="p-0">
              <div className="flex flex-col gap-2">
                {getProductGenderEligibility(product.title, product.tags).isUnisex && (
                  <Badge variant="secondary" className="w-fit text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 border border-border/60">
                    Unisex Fit
                  </Badge>
                )}
                <DialogTitle className="text-2xl font-bold font-headline uppercase tracking-tight">
                  {product.title}
                </DialogTitle>
              </div>
              <p className="text-2xl font-bold text-primary mt-2">
                ${price.toFixed(2)}
              </p>
            </DialogHeader>

            <div className="space-y-6">
              {filteredOptions?.map(option => (
                <div key={option.name} className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {option.name}
                  </Label>
                  <RadioGroup
                    value={selectedOptions[option.name]}
                    onValueChange={(val) => setSelectedOptions(prev => ({ ...prev, [option.name]: val }))}
                    className="flex flex-wrap gap-2.5 sm:gap-3"
                  >
                    {option.values.map(val => (
                      <div key={val.id}>
                        <RadioGroupItem value={val.title} id={`qv-${option.name}-${val.id}`} className="peer sr-only" />
                        <Label
                          htmlFor={`qv-${option.name}-${val.id}`}
                          className="px-3.5 py-2 border rounded-md cursor-pointer text-xs font-bold uppercase tracking-widest peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover:bg-accent/50 transition-all inline-flex items-center justify-center text-center select-none"
                        >
                          {val.title}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 mt-auto pt-6 border-t">
              <Button size="lg" className="w-full font-bold uppercase tracking-widest" onClick={handleAddToCart} disabled={!selectedVariant}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Bag
              </Button>
              <Button variant="outline" size="lg" asChild className="w-full font-bold uppercase tracking-widest">
                <Link href={`/shopping/${product.id}`} onClick={onClose}>
                  <ExternalLink className="mr-2 h-4 w-4" /> View Full Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
