'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

import type { PrintifyProduct } from '@/ai/flows/printify-products';
import { Loader2, Sparkles, Trash2, Maximize2, Save } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface BoardItem {
  id: string;
  product: PrintifyProduct;
  x: number;
  y: number;
  scale: number;
  zIndex: number;
}

import { handleFirestoreError, OperationType } from '@/firebase/errors';

export function BlendBoard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [boardItems, setBoardItems] = useState<BoardItem[]>([]);
  const [maxZIndex, setMaxZIndex] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      const blendboardPath = `users/${user?.uid}/blendboard/main`;
      try {
        const res = await fetch('/api/products'); const fetchedProducts = await res.json();
        setProducts(fetchedProducts);
        
        if (user && firestore) {
          const boardDocRef = doc(firestore, 'users', user.uid, 'blendboard', 'main');
          const boardDoc = await getDoc(boardDocRef);
          if (boardDoc.exists() && boardDoc.data().items) {
            // We need to re-hydrate the products from the IDs or just use the saved data
            // For simplicity, we'll assume the saved data includes the necessary product info
            const savedItems = boardDoc.data().items;
            setBoardItems(savedItems);
            
            // Update maxZIndex
            const highestZ = Math.max(...savedItems.map((i: BoardItem) => i.zIndex), 0);
            setMaxZIndex(highestZ + 1);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('permission')) {
          handleFirestoreError(error, OperationType.GET, blendboardPath);
        }
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user, firestore]);

  const handleAddItem = (product: PrintifyProduct) => {
    const newItem: BoardItem = {
      id: `${product.id}-${Date.now()}`,
      product,
      x: Math.random() * 100 + 50, // Random initial position
      y: Math.random() * 100 + 50,
      scale: 1,
      zIndex: maxZIndex,
    };
    setBoardItems([...boardItems, newItem]);
    setMaxZIndex(maxZIndex + 1);
  };

  const handleRemoveItem = (id: string) => {
    setBoardItems(boardItems.filter(item => item.id !== id));
  };

  const handleDragEnd = (id: string, info: any) => {
    setBoardItems(items => items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          x: item.x + info.offset.x,
          y: item.y + info.offset.y,
        };
      }
      return item;
    }));
  };

  const bringToFront = (id: string) => {
    setBoardItems(items => items.map(item => {
      if (item.id === id) {
        return { ...item, zIndex: maxZIndex };
      }
      return item;
    }));
    setMaxZIndex(maxZIndex + 1);
  };

  const handleSaveBoard = async () => {
    if (!user || !firestore) return;
    setIsSaving(true);
    try {
      const boardDocRef = doc(firestore, 'users', user.uid, 'blendboard', 'main');
      await setDoc(boardDocRef, {
        items: boardItems,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      toast({
        title: 'Board Saved!',
        description: 'Your Blend Board has been saved successfully.',
      });
    } catch (error) {
      console.error('Error saving board:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your board.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[700px] bg-muted/20 rounded-lg border overflow-hidden">
      {/* Sidebar: Product Catalog */}
      <div className="w-full lg:w-80 bg-card border-r flex flex-col h-full">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-headline font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Your Wardrobe
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Click items to add them to your board.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="columns-2 gap-3 space-y-3">
            {products.map(product => (
              <button
                key={product.id}
                onClick={() => handleAddItem(product)}
                className="group relative w-full rounded-lg border bg-muted overflow-hidden hover:border-primary transition-colors break-inside-avoid"
              >
                {product.images?.[0]?.src && (
                  <Image
                    src={product.images[0].src}
                    alt={product.title}
                    width={200}
                    height={200}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                   <span className="opacity-0 group-hover:opacity-100 bg-background/90 text-foreground text-xs px-2 py-1 rounded-full shadow-sm transition-opacity font-medium">
                     Add
                   </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setBoardItems([])}>
            <Trash2 className="w-4 h-4 mr-2" /> Clear
          </Button>
          <Button size="sm" onClick={handleSaveBoard} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Board
          </Button>
        </div>
        
        <div className="flex-1 relative overflow-hidden" ref={boardRef}>
          {boardItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground opacity-50">
                <Maximize2 className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Your canvas is empty</p>
                <p className="text-sm">Click items from the wardrobe to add them here.</p>
              </div>
            </div>
          )}

          {boardItems.map((item) => (
            <motion.div
              key={item.id}
              drag
              dragConstraints={boardRef}
              dragElastic={0}
              dragMomentum={false}
              onDragEnd={(e, info) => handleDragEnd(item.id, info)}
              onPointerDown={() => bringToFront(item.id)}
              initial={{ x: item.x, y: item.y, scale: 0, opacity: 0 }}
              animate={{ x: item.x, y: item.y, scale: item.scale, opacity: 1 }}
              style={{ zIndex: item.zIndex }}
              className="absolute cursor-grab active:cursor-grabbing group"
            >
              <div className="relative w-32 h-32 bg-background rounded-lg shadow-xl border overflow-hidden">
                {item.product.images?.[0]?.src && (
                  <Image
                    src={item.product.images[0].src}
                    alt={item.product.title}
                    fill
                    className="object-cover pointer-events-none"
                  />
                )}
                
                {/* Controls that appear on hover */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveItem(item.id);
                    }}
                    className="bg-destructive text-destructive-foreground p-1 rounded-full shadow-sm hover:bg-destructive/90"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
