'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { handleFirestoreError, OperationType } from '@/firebase/errors';
import { collection, query, where, getDocs, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    if (!firestore) return;

    const fetchReviews = async () => {
      const reviewsPath = 'reviews';
      try {
        const reviewsRef = collection(firestore, reviewsPath);
        // Removed orderBy('createdAt', 'desc') to prevent Firestore composite index errors
        const q = query(reviewsRef, where('productId', '==', productId));
        const snapshot = await getDocs(q);
        
        const fetchedReviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];
        
        // Sort client-side by createdAt descending
        fetchedReviews.sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setReviews(fetchedReviews);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, reviewsPath);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [firestore, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review.",
        variant: "destructive"
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a comment for your review.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = {
        productId,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, 'reviews'), newReview);
      
      // Optimistically add to UI
      setReviews([{
        id: docRef.id,
        ...newReview,
        createdAt: { toDate: () => new Date() }
      } as Review, ...reviews]);
      
      setComment('');
      setRating(5);
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium font-headline tracking-tight">Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-5 w-5",
                    star <= Math.round(averageRating) ? "fill-primary text-primary" : "text-muted"
                  )}
                />
              ))}
            </div>
            <span className="font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm">({reviews.length})</span>
          </div>
        )}
      </div>

      {/* Review Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-muted/30 p-6 rounded-lg border border-border/50">
          <h3 className="font-medium text-sm">Write a Review</h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Rating:</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      star <= rating ? "fill-primary text-primary" : "text-muted hover:text-primary/50"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            placeholder="What did you think about this product?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] resize-y"
          />
          <Button type="submit" disabled={isSubmitting} className="font-medium">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit Review
          </Button>
        </form>
      ) : (
        <div className="bg-muted/30 p-6 rounded-lg border border-border/50 text-center">
          <p className="text-muted-foreground mb-4">Please sign in to leave a review.</p>
          <Button asChild variant="outline" className="font-medium">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 italic">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="divide-y divide-border/50">
            {reviews.map((review) => (
              <div key={review.id} className="py-6 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{review.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.createdAt?.toDate ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= review.rating ? "fill-primary text-primary" : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-foreground/90 leading-relaxed mt-3">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
