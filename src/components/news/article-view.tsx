'use client';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Article } from '@/ai/schemas';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { EmbeddedProduct } from './embedded-product';

const XLogo = () => (
    <svg 
        className="h-4 w-4" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        aria-hidden="true"
    >
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
);


export function ArticleView({
  article,
  open,
  onOpenChange,
}: {
  article: Article | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = article ? article.title : '';

  const xShareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareTitle)}`;
  
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (article) {
      setTimeAgo(
        formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
      );
    }
  }, [article]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0">
        {article && (
          <>
            <ScrollArea className="flex-1">
              <DialogHeader className="p-6 pb-2">
                <div className="flex items-center gap-2 mb-2">
                   <Badge variant={article.category === 'Shopping' ? 'default' : 'secondary'}>
                    {article.category}
                   </Badge>
                   <span className="text-xs text-muted-foreground">{article.source}</span>
                </div>
                <DialogTitle className="text-3xl md:text-4xl font-headline font-bold leading-tight">
                  {article.title}
                </DialogTitle>
                {article.id !== 'brand-hero-fixed' && (
                  <DialogDescription>
                    <div className="text-sm text-muted-foreground pt-1">
                      <span>
                        {format(new Date(article.publishedAt), 'MMMM d, yyyy')}
                      </span>
                      <span className="mx-2">·</span>
                      <span>
                        {timeAgo}
                      </span>
                    </div>
                  </DialogDescription>
                )}
              </DialogHeader>

              {article.videoUrl ? (
                <div className="px-6 mb-0">
                    <video
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full aspect-[2/3] max-h-[75vh] mx-auto rounded-md object-cover object-top bg-black"
                    >
                        <source src={article.videoUrl} type="video/mp4" />
                    </video>
                </div>
              ) : (
                <div className="px-6 mb-0">
                    <div className="relative w-full aspect-[2/3] max-h-[75vh] mx-auto overflow-hidden rounded-md">
                        <Image
                        src={article.imageUrl}
                        alt={article.title}
                        fill
                        className="object-cover object-top"
                        data-ai-hint={article.imageHint}
                        />
                    </div>
                </div>
              )}

            {article.id === 'Roaming-Through-the-Heartland-A-Song-About-Work-Roots-and-Motion' && (
                 <div className="p-6 py-2">
                     <audio
                         src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/audio%2FAmerican%20Heartland.mp3?alt=media"
                         controls
                         className="w-full"
                     />
                 </div>
            )}


              <div className="p-6 md:p-8 lg:p-10 pt-4">
                <div className="prose prose-stone dark:prose-invert max-w-none text-foreground text-lg prose-p:leading-relaxed prose-headings:font-headline whitespace-pre-wrap">
                  {article.content.split(/\[PRODUCT:([a-zA-Z0-9]+)\]/g).map((part, index) => {
                    if (index % 2 === 0) {
                      return (
                        <div 
                          key={index} 
                          dangerouslySetInnerHTML={{ __html: part }} 
                        />
                      );
                    } else {
                      return <EmbeddedProduct key={index} productId={part} />;
                    }
                  })}
                </div>
                
                {article.category === 'Shopping' && article.productId && (
                  <div className="mt-8 p-6 bg-accent/10 border border-accent/20 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-xl mb-1">Love this piece?</h4>
                      <p className="text-muted-foreground text-sm">Pick your size and color in the shop.</p>
                    </div>
                    <Button asChild size="lg" className="shrink-0">
                      <Link href={`/shopping/${article.productId}`}>
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="p-3 border-t bg-background/95 backdrop-blur-sm flex items-center justify-between">
                <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-muted-foreground'>Share:</span>
                    <Button variant="outline" size="icon" asChild>
                      <Link href={xShareLink} target="_blank" rel="noopener noreferrer">
                        <XLogo />
                      </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                  <DialogClose asChild>
                      <Button variant="outline">Close</Button>
                  </DialogClose>
                </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
