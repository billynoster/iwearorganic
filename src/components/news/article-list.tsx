
'use client';

import type { Article } from '@/ai/schemas';
import { ArticleListItem } from './article-list-item';

export function ArticleList({
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
    <div className="space-y-4 max-w-4xl mx-auto">
      {articles.map((article) => (
        <ArticleListItem
          key={article.id}
          article={article}
          onSelect={() => onArticleSelect(article)}
        />
      ))}
    </div>
  );
}
