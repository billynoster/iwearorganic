import { articles as allArticles } from '@/lib/data';
import { NewsPageClient } from '@/components/news/news-page-client';

export default function BlendIntelligencePage() {
  const intelligenceArticles = allArticles.filter(a => a.category === 'Blend Intelligence');

  return (
    <div className="bg-background min-h-screen">
      <NewsPageClient 
        articles={intelligenceArticles} 
        hideHero={false}
        title="Blend Intelligence"
        description="Systems for independence: Technology and strategy for the modern builder."
      />
    </div>
  );
}
