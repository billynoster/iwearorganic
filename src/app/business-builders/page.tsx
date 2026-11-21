import { articles as allArticles } from '@/lib/data';
import { NewsPageClient } from '@/components/news/news-page-client';

export default function BusinessBuildersPage() {
  const businessArticles = allArticles.filter(a => a.category === 'Business & Builders');

  return (
    <div className="bg-background min-h-screen">
      <NewsPageClient 
        articles={businessArticles} 
        hideHero={false}
        title="Business & Builders"
        description="Spotlighting the entrepreneurs and craftsmen building independent American enterprise."
      />
    </div>
  );
}
