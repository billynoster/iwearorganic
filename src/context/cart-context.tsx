'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleFirestoreError, OperationType } from '@/firebase/errors';
import type { PrintifyProduct, PrintifyVariant } from '@/ai/flows/printify-products';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

export interface CartItem {
  product: PrintifyProduct;
  variant: PrintifyVariant;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: PrintifyProduct, variant: PrintifyVariant, quantity?: number) => void;
  removeFromCart: (variantId: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  openCart: () => void;
  /** True when cart is guest/anonymous (localStorage) vs signed-in Firestore. */
  isGuestCart: boolean;
  isCartHydrated: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'iwearorganic_guest_cart_v1';

function readGuestCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) => item?.product?.id && item?.variant?.id && item?.quantity > 0
    );
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Unable to persist guest cart', error);
  }
}

function clearGuestCartStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartHydrated, setIsCartHydrated] = useState(false);
  const cartItemsRef = useRef<CartItem[]>([]);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const isGuestCart = !user || Boolean(user.isAnonymous);

  useEffect(() => {
    cartItemsRef.current = cartItems;
  }, [cartItems]);

  // Hydrate guest cart from localStorage once auth state is known
  useEffect(() => {
    if (isUserLoading) return;
    if (!user || user.isAnonymous) {
      setCartItems(readGuestCart());
      setIsCartHydrated(true);
    }
  }, [user, isUserLoading]);

  // Persist guest cart
  useEffect(() => {
    if (!isCartHydrated) return;
    if (!user || user.isAnonymous) {
      writeGuestCart(cartItems);
    }
  }, [cartItems, user, isCartHydrated]);

  // Load cart from Firestore when user logs in (non-anonymous)
  useEffect(() => {
    if (!user || !firestore || user.isAnonymous) {
      return;
    }

    const cartRef = collection(firestore, 'users', user.uid, 'cartItems');

    // Sync any existing in-memory / guest items to Firestore on login
    if (cartItemsRef.current.length > 0) {
      cartItemsRef.current.forEach(async (item) => {
        try {
          const cartItemRef = doc(
            firestore,
            'users',
            user.uid,
            'cartItems',
            item.variant.id.toString()
          );
          await setDoc(
            cartItemRef,
            {
              id: item.variant.id.toString(),
              productId: item.product.id,
              variantId: item.variant.id,
              quantity: item.quantity,
              productData: JSON.stringify(item.product),
              variantData: JSON.stringify(item.variant),
              addedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (error) {
          console.error('Error syncing local cart item to Firestore on login', error);
        }
      });
      clearGuestCartStorage();
    }

    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        const items: CartItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          try {
            items.push({
              product: JSON.parse(data.productData),
              variant: JSON.parse(data.variantData),
              quantity: data.quantity,
            });
          } catch (e) {
            console.error('Error parsing cart item from Firestore', e);
          }
        });
        setCartItems(items);
        setIsCartHydrated(true);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/cartItems`);
        setIsCartHydrated(true);
      }
    );

    return () => unsubscribe();
  }, [user, firestore]);

  const syncCartItemToFirestore = async (item: CartItem) => {
    if (!user || !firestore || user.isAnonymous) return;

    try {
      const cartItemRef = doc(
        firestore,
        'users',
        user.uid,
        'cartItems',
        item.variant.id.toString()
      );
      await setDoc(cartItemRef, {
        id: item.variant.id.toString(),
        productId: item.product.id,
        variantId: item.variant.id,
        quantity: item.quantity,
        productData: JSON.stringify(item.product),
        variantData: JSON.stringify(item.variant),
        addedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/cartItems`);
    }
  };

  const removeCartItemFromFirestore = async (variantId: number) => {
    if (!user || !firestore || user.isAnonymous) return;

    try {
      const cartItemRef = doc(
        firestore,
        'users',
        user.uid,
        'cartItems',
        variantId.toString()
      );
      await deleteDoc(cartItemRef);
    } catch (error) {
      console.error('Error removing cart item from Firestore', error);
    }
  };

  const clearCartFromFirestore = async () => {
    if (!user || !firestore || user.isAnonymous) return;

    try {
      const cartRef = collection(firestore, 'users', user.uid, 'cartItems');
      const snapshot = await getDocs(cartRef);
      await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
    } catch (error) {
      console.error('Error clearing cart from Firestore', error);
    }
  };

  const addToCart = (
    product: PrintifyProduct,
    variant: PrintifyVariant,
    quantity: number = 1
  ) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.variant.id === variant.id);
      let newItems;
      let itemToSync;

      if (existingItem) {
        newItems = prevItems.map((item) =>
          item.variant.id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        itemToSync = newItems.find((item) => item.variant.id === variant.id);
      } else {
        itemToSync = { product, variant, quantity };
        newItems = [...prevItems, itemToSync];
      }

      if (itemToSync) {
        syncCartItemToFirestore(itemToSync);
      }

      return newItems;
    });

    toast({
      title: 'Added to bag',
      description: `${product.title} (${variant.title}) has been added to your bag.`,
    });
  };

  const removeFromCart = (variantId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.variant.id !== variantId));
    removeCartItemFromFirestore(variantId);
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
    } else {
      setCartItems((prevItems) => {
        const newItems = prevItems.map((item) =>
          item.variant.id === variantId ? { ...item, quantity } : item
        );

        const updatedItem = newItems.find((item) => item.variant.id === variantId);
        if (updatedItem) {
          syncCartItemToFirestore(updatedItem);
        }

        return newItems;
      });
    }
  };

  const clearCart = () => {
    setCartItems([]);
    clearCartFromFirestore();
    clearGuestCartStorage();
  };

  const openCart = () => setIsCartOpen(true);

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = item.variant.price / 100;
      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        openCart,
        isGuestCart,
        isCartHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
