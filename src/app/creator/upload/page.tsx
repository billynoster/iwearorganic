'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useFirebaseApp } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Video, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import type { PrintifyProduct } from '@/ai/flows/printify-products';
import Image from 'next/image';

export default function UploadVideoPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const router = useRouter();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Hoodies');
  const [vibeTags, setVibeTags] = useState('');
  
  const [purchasedProducts, setPurchasedProducts] = useState<any[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function loadPurchasedProducts() {
      if (!user || !firestore) return;
      setIsLoadingProducts(true);
      try {
        const q = query(collection(firestore, "orders"), where("userId", "==", user.uid), where("status", "==", "paid"));
        const querySnapshot = await getDocs(q);
        const productsMap = new Map();
        querySnapshot.forEach((doc) => {
          const order = doc.data();
          if (order.items) {
            order.items.forEach((item: any) => {
              if (!productsMap.has(item.productId)) {
                productsMap.set(item.productId, {
                  id: item.productId,
                  title: item.title,
                  image: item.image,
                  price: item.price
                });
              }
            });
          }
        });
        setPurchasedProducts(Array.from(productsMap.values()));
      } catch (e) {
        console.error("Failed to load purchased products", e);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    loadPurchasedProducts();
  }, [user, firestore]);
  const toggleProduct = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };
  const [progress, setProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setVideoPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !firebaseApp) {
      toast({ title: 'Error', description: 'You must be logged in to upload.', variant: 'destructive' });
      return;
    }
    if (!file) {
      toast({ title: 'Error', description: 'Please select a video file.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // 1. Get or create creator profile
      const creatorRef = doc(firestore, 'creators', user.uid);
      const creatorSnap = await getDoc(creatorRef);
      let creatorData = creatorSnap.data();
      
      if (!creatorSnap.exists()) {
        creatorData = {
          id: user.uid,
          name: user.displayName || 'Anonymous Creator',
          avatar: user.displayName ? user.displayName.substring(0, 2).toUpperCase() : 'CC',
          handle: '@' + (user.email?.split('@')[0] || 'creator' + Math.floor(Math.random() * 1000)),
          followers: 0,
          following: 0,
        };
        await setDoc(creatorRef, creatorData);
      }

      // 2. Upload video to storage
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `videos/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(Math.round(p));
        },
        (error) => {
          console.error('Upload failed', error);
          toast({ title: 'Upload Failed', description: error.message, variant: 'destructive' });
          setIsUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // 3. Save to Firestore
          const tags = vibeTags.split(',').map(t => t.trim()).filter(t => t);
          
          await addDoc(collection(firestore, 'videos'), {
            authorId: user.uid,
            author: {
              name: creatorData?.handle || '@iwearorganic',
              avatar: creatorData?.avatar || 'BA',
              creatorId: user.uid
            },
            title,
            caption,
            category,
            vibeTags: tags,
            productIds: selectedProductIds,
            videoUrl: downloadURL,
            likes: '0',
            comments: '0',
            createdAt: serverTimestamp()
          });

          toast({ title: 'Success!', description: 'Your video has been published to the feed.' });
          setIsUploading(false);
          router.push('/creator/' + user.uid);
        }
      );
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: err.message || 'Something went wrong.', variant: 'destructive' });
      setIsUploading(false);
    }
  };

  const selectedProducts = purchasedProducts.filter(p => selectedProductIds.includes(p.id));

  return (
    <div className="w-full mx-auto max-w-5xl py-12 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline uppercase tracking-wider">Creator Studio</h1>
        <p className="text-muted-foreground mt-2">Upload your style and tag your favorite I Wear Organic gear.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Upload Form */}
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="space-y-2">
            <Label>Video File</Label>
            <div 
              className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <Video className="h-10 w-10 text-primary mb-2" />
                  <span className="font-bold">{file.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">Click to change</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <span className="font-bold">Select a video to upload</span>
                  <span className="text-sm text-muted-foreground mt-1">MP4, WebM, or QuickTime</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="E.g., Summer Lookbook" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea 
              id="caption" 
              placeholder="Tell us about this fit... add #hashtags" 
              value={caption} 
              onChange={e => setCaption(e.target.value)} 
              required
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hoodies">Hoodies</SelectItem>
                  <SelectItem value="Sweatshirts">Sweatshirts</SelectItem>
                  <SelectItem value="T-Shirts">T-Shirts</SelectItem>
                  <SelectItem value="Dresses">Dresses</SelectItem>
                  <SelectItem value="Activewear">Activewear</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Vibe Tags</Label>
              <Input 
                id="tags" 
                placeholder="streetwear, cozy, dark" 
                value={vibeTags} 
                onChange={e => setVibeTags(e.target.value)} 
              />
              <p className="text-[10px] text-muted-foreground">Comma separated</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Tag Products Featured in Video</Label>
            
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
              {isLoadingProducts ? (
                <div className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                  Loading your purchases...
                </div>
              ) : purchasedProducts.length > 0 ? (
                purchasedProducts.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all ${
                      selectedProductIds.includes(product.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="h-12 w-12 shrink-0 bg-muted rounded relative overflow-hidden">
                      {product.image ? (
                        <Image src={product.image} alt={product.title} fill className="object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-[10px]">No Img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{product.title}</p>
                      <p className="text-[10px] text-muted-foreground">${(product.price / 100).toFixed(2)}</p>
                    </div>
                    <div className="w-5 h-5 flex items-center justify-center rounded-full border shrink-0">
                      {selectedProductIds.includes(product.id) && <Check className="w-3 h-3 text-primary" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                  You haven't purchased any products yet.
                </div>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground">These items will instantly appear when users click the SHOP button on your video.</p>
          </div>

          <Button type="submit" className="w-full font-bold uppercase tracking-widest" disabled={isUploading}>
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Uploading {progress}%
              </span>
            ) : 'Publish to Feed'}
          </Button>
        </form>

        {/* Preview */}
        <div>
          <Label className="mb-2 block">Preview</Label>
          <div className="w-full max-w-[320px] mx-auto h-[600px] bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-border">
            {videoPreview ? (
              <video 
                src={videoPreview} 
                className="w-full h-full object-cover" 
                autoPlay 
                loop 
                muted 
                playsInline
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No video selected
              </div>
            )}
            
            {/* UI Overlay Mockup */}
            <div className="absolute bottom-6 left-4 right-16 z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center text-white text-xs font-bold border border-white/20">
                  ME
                </div>
                <span className="text-white font-bold text-sm shadow-sm">{user?.displayName || '@you'}</span>
              </div>
              <p className="text-white text-sm line-clamp-2 shadow-sm">{caption || 'Your caption will appear here'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
