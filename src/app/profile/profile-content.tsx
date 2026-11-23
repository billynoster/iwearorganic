'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth, useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { handleFirestoreError, OperationType } from '@/firebase/errors';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { doc, setDoc, collection, getDocs, addDoc, query, where, updateDoc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, MapPin, LogOut, Save, Sparkles, Heart, RefreshCw, Trash2, Plus, Edit2, ShieldCheck, Mail, MessageSquare } from 'lucide-react';
import { articles as allArticles } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

import { useWishlist } from '@/context/wishlist-context';
import { ProductCard } from '@/components/shopping/product-card';

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export function ProfileContent() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';
  const { wishlistItems, isLoading: isLoadingWishlist } = useWishlist();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const styleOptions = ['Casual', 'Sporty', 'Formal', 'Streetwear', 'Minimalist', 'Bohemian'];
  
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [stylePreferences, setStylePreferences] = useState('');
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [currentAddress, setCurrentAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  const [communicationPrefs, setCommunicationPrefs] = useState({
    marketingEmails: true,
    smsNotifications: false,
    orderUpdates: true,
  });

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: ''
  });
  const [isSavingShipping, setIsSavingShipping] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Use a stable reference for the user preferences path
  const preferencesCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'users', user.uid, 'preferences');
  }, [firestore, user]);

  const { data: preferencesData, isLoading: isLoadingPreferences } = useCollection(preferencesCollectionRef);

  // Since we expect a single preferences document, we'll work with the first one.
  const userPreferences = useMemo(() => preferencesData?.[0], [preferencesData]);
  const preferenceDocId = userPreferences?.id;

  const allCategories = useMemo(() => {
    const categories = new Set(allArticles.map(a => a.category));
    return Array.from(categories);
  }, []);

  useEffect(() => {
    // If user is not logged in, redirect them.
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (userPreferences) {
      if (userPreferences.categoryIds) {
        setSelectedCategories(userPreferences.categoryIds);
      }
      if (userPreferences.stylePreferences) {
        setSelectedStyles(userPreferences.stylePreferences);
      }
    }
  }, [userPreferences]);

  useEffect(() => {
    if (!user || !firestore) return;

    const fetchProfileData = async () => {
      try {
        console.log("Fetching profile data for user:", user.uid);

        // Fetch shipping info
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.addresses) {
            setAddresses(data.addresses);
          } else if (data.shippingInfo) {
            // Migrate old shipping info to addresses
            setAddresses([{
              id: 'default',
              ...data.shippingInfo,
              isDefaultShipping: true,
              isDefaultBilling: false
            }]);
          }
          if (data.communicationPrefs) {
            setCommunicationPrefs(data.communicationPrefs);
          }
          if (data.shippingInfo) {
            setShippingInfo(data.shippingInfo);
          }
          if (data.firstName) {
            setFirstName(data.firstName);
          }
          if (data.lastName) {
            setLastName(data.lastName);
          }
          if (data.stylePreferences) {
            setStylePreferences(data.stylePreferences);
          }
        }

        // Fetch orders
        console.log("Fetching orders for user:", user.uid);
        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        console.log("Orders fetched:", querySnapshot.size);
        
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        handleFirestoreError(error, OperationType.GET, 'users/orders');
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchProfileData();
  }, [user, firestore]);

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleStyleToggle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleSaveChanges = async () => {
    if (!user || !preferencesCollectionRef) return;
    setIsSaving(true);
    
    const dataToSave = {
        userId: user.uid,
        categoryIds: selectedCategories,
        stylePreferences: selectedStyles,
    };

    try {
      // If a preference doc exists, update it. If not, create a new one.
      const docRef = preferenceDocId ? doc(preferencesCollectionRef, preferenceDocId) : doc(preferencesCollectionRef);
      // Non-blocking update for better UX
      setDocumentNonBlocking(docRef, dataToSave, { merge: true });

      toast({
        title: 'Preferences Saved',
        description: 'Your news feed and style recommendations will be updated.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        variant: 'destructive',
        title: 'Error Saving Preferences',
        description: 'Could not save your preferences. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCommunicationPrefs = async () => {
    if (!user || !firestore) return;
    setIsSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { communicationPrefs });
      toast({
        title: 'Preferences Saved',
        description: 'Your communication preferences have been updated.',
      });
    } catch (error) {
      console.error('Error saving communication preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save communication preferences.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !currentAddress) return;
    
    setIsSavingAddress(true);
    try {
      let updatedAddresses = [...addresses];
      
      // If setting as default shipping, unset others
      if (currentAddress.isDefaultShipping) {
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefaultShipping: false }));
      }
      
      // If setting as default billing, unset others
      if (currentAddress.isDefaultBilling) {
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefaultBilling: false }));
      }

      const existingIndex = updatedAddresses.findIndex(a => a.id === currentAddress.id);
      if (existingIndex >= 0) {
        updatedAddresses[existingIndex] = currentAddress;
      } else {
        updatedAddresses.push({ ...currentAddress, id: Date.now().toString() });
      }

      // If this is the only address, make it default
      if (updatedAddresses.length === 1) {
        updatedAddresses[0].isDefaultShipping = true;
        updatedAddresses[0].isDefaultBilling = true;
      }

      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, { addresses: updatedAddresses }, { merge: true });
      
      setAddresses(updatedAddresses);
      setIsAddingAddress(false);
      setCurrentAddress(null);
      
      toast({ title: 'Address Saved', description: 'Your address book has been updated.' });
    } catch (error) {
      console.error('Error saving address:', error);
      toast({ title: 'Error', description: 'Failed to save address.', variant: 'destructive' });
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user || !firestore) return;
    const updatedAddresses = addresses.filter(a => a.id !== id);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      toast({ title: 'Address Removed', description: 'The address has been removed from your address book.' });
    } catch (error) {
      console.error('Error removing address:', error);
      toast({ title: 'Error', description: 'Failed to remove address.', variant: 'destructive' });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;

    setIsSavingProfile(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { 
        firstName,
        lastName,
        stylePreferences
      });

      toast({
        title: 'Profile Saved',
        description: 'Your profile information has been updated.',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile information. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isUserLoading || isLoadingPreferences) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }
  
  if (!user) {
    // This will be briefly visible before the redirect effect kicks in.
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-8rem)]">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <>
      <main className="w-full mx-auto max-w-5xl py-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-medium font-headline tracking-tight">My Account</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="flex flex-wrap w-full md:grid md:grid-cols-5 mb-8 h-auto p-1.5 gap-1 rounded-lg">
          <TabsTrigger value="profile" className="text-base">
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-base">
            <Package className="mr-2 h-4 w-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="text-base">
            <Heart className="mr-2 h-4 w-4" /> Wishlist
          </TabsTrigger>
          <TabsTrigger value="addresses" className="text-base">
            <MapPin className="mr-2 h-4 w-4" /> Address Book
          </TabsTrigger>
          <TabsTrigger value="preferences" className="text-base">
            Preferences
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your personal information and style preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={user.email || ''} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stylePreferences">Style Preferences</Label>
                  <Input id="stylePreferences" value={stylePreferences} onChange={(e) => setStylePreferences(e.target.value)} placeholder="Tell us more about your style..." />
                </div>
                
                <Button type="submit" className="w-full sm:w-auto" disabled={isSavingProfile}>
                  {isSavingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {isLoadingOrders ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No orders yet</h3>
                <p className="text-muted-foreground mb-6">When you place an order, it will appear here.</p>
                <Button asChild>
                  <a href="/shopping">Start Shopping</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b pb-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div>
                        <CardDescription>Order Placed</CardDescription>
                        <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <CardDescription>Total</CardDescription>
                        <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <CardDescription>Status</CardDescription>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary capitalize">
                          {order.status}
                        </span>
                      </div>
                      <div className="sm:text-right">
                        <CardDescription>Order #</CardDescription>
                        <p className="font-mono text-sm">{order.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {order.items.map((itemStr: string, index: number) => {
                        try {
                          const item = JSON.parse(itemStr);
                          return (
                            <li key={index} className="flex items-center gap-4 p-4 sm:p-6">
                              <div className="relative h-16 w-16 rounded border overflow-hidden shrink-0 bg-muted">
                                {item.product?.images?.[0]?.src && (
                                  <Image
                                    src={item.product.images[0].src}
                                    alt={item.product.title}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="font-medium text-sm sm:text-base truncate">{item.product?.title || 'Unknown Product'}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">{item.variant?.title || 'Unknown Variant'}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-medium text-sm sm:text-base">${((item.variant?.price || 0) / 100).toFixed(2)}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">Qty: {item.quantity}</p>
                              </div>
                            </li>
                          );
                        } catch (e) {
                          return <li key={index} className="p-4 text-sm text-destructive">Error loading item</li>;
                        }
                      })}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="wishlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Wishlist</CardTitle>
              <CardDescription>
                Items you've saved for later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingWishlist ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-medium mb-2">Your wishlist is empty</h3>
                  <p className="text-muted-foreground mb-6">Save items you like by clicking the heart icon on products.</p>
                  <Button asChild>
                    <a href="/shopping">Start Shopping</a>
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item) => {
                    try {
                      const product = JSON.parse(item.productData);
                      return <ProductCard key={item.id} product={product} />;
                    } catch (e) {
                      return null;
                    }
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Address Book</CardTitle>
                <CardDescription>
                  Manage your shipping and billing addresses.
                </CardDescription>
              </div>
              {!isAddingAddress && (
                <Button onClick={() => {
                  setCurrentAddress({
                    id: '',
                    firstName: '',
                    lastName: '',
                    address1: '',
                    address2: '',
                    city: '',
                    state: '',
                    zip: '',
                    country: '',
                    phone: '',
                    isDefaultShipping: addresses.length === 0,
                    isDefaultBilling: addresses.length === 0
                  });
                  setIsAddingAddress(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Address
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isAddingAddress ? (
                <form onSubmit={handleSaveAddress} className="space-y-6 border rounded-lg p-6 bg-muted/10">
                  <h3 className="font-medium text-lg mb-4">{currentAddress?.id ? 'Edit Address' : 'New Address'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" value={currentAddress?.firstName || ''} onChange={(e) => setCurrentAddress({...currentAddress!, firstName: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" value={currentAddress?.lastName || ''} onChange={(e) => setCurrentAddress({...currentAddress!, lastName: e.target.value})} required />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input id="address1" name="address1" value={currentAddress?.address1 || ''} onChange={(e) => setCurrentAddress({...currentAddress!, address1: e.target.value})} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input id="address2" name="address2" value={currentAddress?.address2 || ''} onChange={(e) => setCurrentAddress({...currentAddress!, address2: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" value={currentAddress?.city || ''} onChange={(e) => setCurrentAddress({...currentAddress!, city: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State / Province</Label>
                      <Input id="state" name="state" value={currentAddress?.state || ''} onChange={(e) => setCurrentAddress({...currentAddress!, state: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP / Postal Code</Label>
                      <Input id="zip" name="zip" value={currentAddress?.zip || ''} onChange={(e) => setCurrentAddress({...currentAddress!, zip: e.target.value})} required />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" name="country" value={currentAddress?.country || ''} onChange={(e) => setCurrentAddress({...currentAddress!, country: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" value={currentAddress?.phone || ''} onChange={(e) => setCurrentAddress({...currentAddress!, phone: e.target.value})} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 py-4 border-y">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Default Shipping Address</Label>
                        <p className="text-sm text-muted-foreground">Use this as your primary shipping destination</p>
                      </div>
                      <Switch 
                        checked={currentAddress?.isDefaultShipping || false}
                        onCheckedChange={(c) => setCurrentAddress({...currentAddress!, isDefaultShipping: c})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Default Billing Address</Label>
                        <p className="text-sm text-muted-foreground">Use this as your primary billing address</p>
                      </div>
                      <Switch 
                        checked={currentAddress?.isDefaultBilling || false}
                        onCheckedChange={(c) => setCurrentAddress({...currentAddress!, isDefaultBilling: c})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => { setIsAddingAddress(false); setCurrentAddress(null); }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSavingAddress}>
                      {isSavingAddress ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Address
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                      <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>You haven't saved any addresses yet.</p>
                    </div>
                  ) : (
                    addresses.map((address) => (
                      <Card key={address.id} className="relative overflow-hidden group">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-medium text-lg">{address.firstName} {address.lastName}</h4>
                              <div className="flex gap-2 mt-1">
                                {address.isDefaultShipping && <Badge variant="secondary" className="text-xs">Default Shipping</Badge>}
                                {address.isDefaultBilling && <Badge variant="outline" className="text-xs">Default Billing</Badge>}
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                setCurrentAddress(address);
                                setIsAddingAddress(true);
                              }}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteAddress(address.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>{address.address1}</p>
                            {address.address2 && <p>{address.address2}</p>}
                            <p>{address.city}, {address.state} {address.zip}</p>
                            <p>{address.country}</p>
                            {address.phone && <p className="pt-2">{address.phone}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl font-headline">Your Preferences</CardTitle>
              <CardDescription>
                Select your favorite categories and personal style to customize your experience.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategories.includes(category) ? 'default' : 'secondary'}
                      className="cursor-pointer text-base py-1 px-3"
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Style Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.map(style => (
                    <Badge
                      key={style}
                      variant={selectedStyles.includes(style) ? 'default' : 'secondary'}
                      className="cursor-pointer text-base py-1 px-3"
                      onClick={() => handleStyleToggle(style)}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Style Preferences'
                  )}
                </Button>
              </div>

              <div className="pt-8 border-t space-y-6">
                <div>
                  <h3 className="text-xl font-medium mb-1">Communication Preferences</h3>
                  <p className="text-sm text-muted-foreground">Manage how and when you receive updates from us.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-base">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">Receive updates on new collections, sales, and exclusive offers.</p>
                      </div>
                    </div>
                    <Switch 
                      checked={communicationPrefs.marketingEmails}
                      onCheckedChange={(c) => setCommunicationPrefs(prev => ({...prev, marketingEmails: c}))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-base">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Get text messages for flash sales and special promotions.</p>
                      </div>
                    </div>
                    <Switch 
                      checked={communicationPrefs.smsNotifications}
                      onCheckedChange={(c) => setCommunicationPrefs(prev => ({...prev, smsNotifications: c}))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-base">Order Updates</Label>
                        <p className="text-sm text-muted-foreground">Receive emails about your order status and shipping tracking.</p>
                      </div>
                    </div>
                    <Switch 
                      checked={communicationPrefs.orderUpdates}
                      onCheckedChange={(c) => setCommunicationPrefs(prev => ({...prev, orderUpdates: c}))}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button onClick={handleSaveCommunicationPrefs} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Communication Preferences'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
    </>
  );
}
