'use client';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/ai/schemas';
import { useState, useEffect } from 'react';

export function ArticleCard({
  article,
  onSelect,
}: {
  article: Article;
  onSelect: () => void;
}) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    // This runs only on the client, after hydration, preventing mismatch
    setTimeAgo(
      formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    );
  }, [article.publishedAt]);

  return (
    <Card
      className="flex flex-col h-full overflow-hidden transition-all duration-300 group hover:shadow-lg hover:border-accent hover:-translate-y-1 cursor-pointer bg-card"
      onClick={onSelect}
    >
      <CardHeader className="p-0">
        <div className="relative w-full aspect-[2/3]">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover object-top rounded-t-lg"
            data-ai-hint={article.imageHint}
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <CardTitle className="text-xl font-headline font-bold leading-tight line-clamp-3">
          {article.title}
        </CardTitle>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col items-start gap-2">
        <div className="flex justify-between w-full items-center">
          <Badge variant="secondary">{article.category}</Badge>
          <p className="text-xs text-muted-foreground">
            {timeAgo}
          </p>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{article.source}</p>
      </CardFooter>
    </Card>
  );
}
