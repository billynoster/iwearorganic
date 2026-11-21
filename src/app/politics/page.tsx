import { articles as allArticles } from '@/lib/data';
import { NewsPageClient } from '@/components/news/news-page-client';

export default function PoliticsPage() {
  const politicsArticles = allArticles.filter(a => a.category === 'Politics');

  return (
    <div className="bg-background min-h-screen">
      <NewsPageClient 
        articles={politicsArticles} 
        hideHero={false}
        title="Politics"
        description="Thoughtful perspectives on the governance and policy shaping our future."
      />
    </div>
  );
}
