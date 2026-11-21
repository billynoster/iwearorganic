'use client';

import type { Article } from '@/ai/schemas';
import { ArticleCard } from './article-card';

export function ArticleGrid({
  articles,
  onArticleSelect,
}: {
  articles: Article[];
  onArticleSelect: (article: Article) => void;
}) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <p className="text-lg font-medium">No Articles Found</p>
        <p>Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          onSelect={() => onArticleSelect(article)}
        />
      ))}
    </div>
  );
}
