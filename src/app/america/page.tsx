import { articles as allArticles } from '@/lib/data';
import { NewsPageClient } from '@/components/news/news-page-client';

export default function AmericaPage() {
  // Filter articles for this category
  const americaArticles = allArticles.filter(a => 
    a.category === 'America' || a.category === 'The American Kitchen'
  );

  return (
    <div className="bg-background min-h-screen">
      <NewsPageClient 
        articles={americaArticles} 
        hideHero={false}
        title="America"
        description="Exploring the stories, traditions, and ideas that define the American experience."
      />
    </div>
  );
}
