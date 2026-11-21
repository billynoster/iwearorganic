'use client';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/ai/schemas';
import { useState, useEffect } from 'react';

export function ArticleListItem({
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
      className="flex flex-col sm:flex-row w-full overflow-hidden transition-all duration-300 group hover:shadow-md hover:border-accent cursor-pointer bg-card"
      onClick={onSelect}
    >
      <div className="relative w-full sm:w-1/3 md:w-1/4 aspect-[2/3]">
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          className="object-cover object-top sm:rounded-l-lg sm:rounded-r-none rounded-t-lg"
          data-ai-hint={article.imageHint}
        />
      </div>
      <CardContent className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start gap-2 mb-2">
            <Badge variant="secondary">{article.category}</Badge>
            <p className="text-xs text-muted-foreground text-right flex-shrink-0">
              {timeAgo}
            </p>
          </div>
          <h3 className="text-base font-bold leading-tight line-clamp-2 mb-2">
            {article.title}
          </h3>
        </div>
        <p className="text-sm font-medium text-muted-foreground">{article.source}</p>
      </CardContent>
    </Card>
  );
}
