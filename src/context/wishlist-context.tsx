'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { PrintifyProduct } from '@/ai/flows/printify-products';

interface WishlistItem {
  id: string;
  productId: string;
  productData: string; // JSON stringified product
  addedAt: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: PrintifyProduct) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

import { handleFirestoreError, OperationType } from '@/firebase/errors';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !firestore) {
      setWishlistItems([]);
      setIsLoading(false);
      return;
    }

    const wishlistPath = `users/${user.uid}/wishlistItems`;
    console.log("Subscribing to wishlist:", wishlistPath);
    const wishlistRef = collection(firestore, 'users', user.uid, 'wishlistItems');
    const unsubscribe = onSnapshot(wishlistRef, (snapshot) => {
      console.log("Wishlist snapshot received:", snapshot.size);
      const items: WishlistItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as WishlistItem);
      });
      setWishlistItems(items);
      setIsLoading(false);
    }, (error) => {
      console.error("Error in wishlist onSnapshot:", error);
      handleFirestoreError(error, OperationType.LIST, wishlistPath);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const addToWishlist = async (product: PrintifyProduct) => {
    if (!user || !firestore) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    try {
      const wishlistRef = doc(collection(firestore, 'users', user.uid, 'wishlistItems'), product.id);
      await setDoc(wishlistRef, {
        productId: product.id,
        productData: JSON.stringify(product),
        addedAt: new Date().toISOString()
      });
      toast({
        title: "Added to wishlist",
        description: `${product.title} has been added to your wishlist.`,
      });
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Could not add item to wishlist.",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user || !firestore) return;

    try {
      const wishlistRef = doc(collection(firestore, 'users', user.uid, 'wishlistItems'), productId);
      await deleteDoc(wishlistRef);
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      });
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Could not remove item from wishlist.",
        variant: "destructive",
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
