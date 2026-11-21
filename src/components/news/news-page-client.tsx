'use client';

import { useMemo, useState, useTransition, useEffect } from 'react';
import type { Article } from '@/ai/schemas';

import { ArticleGrid } from '@/components/news/article-grid';
import { ArticleList } from '@/components/news/article-list';
import { ArticleView } from './article-view';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutGrid, List, Search, X } from 'lucide-react';
import { HeroSection } from './hero-section';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { matchesSearchQuery } from '@/lib/search-utils';

const ARTICLES_PER_PAGE = 12;

type Layout = 'grid' | 'list';

export function NewsPageClient({
  articles,
  hideHero = false,
  title,
  description,
  initialType = 'All' // Added prop to allow defaulting to 'Dresses'
}: {
  articles: Article[];
  hideHero?: boolean;
  title?: string;
  description?: string;
  initialType?: string;
}) {
  const [layout, setLayout] = useState<Layout>('grid');
  const [visibleArticleCount, setVisibleArticleCount] = useState(ARTICLES_PER_PAGE);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Shopping-specific filters
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedType, setSelectedType] = useState(initialType);

  const [isPending, startTransition] = useTransition();

  // Consolidated Leggings into Yoga
  const productTypes = useMemo(() => ['Dresses', 'Skirts', 'Swimwear', 'Yoga', 'Tees', 'Hoodies', 'Sweatshirts', 'Beanies', 'Hats', 'All'], []);
  const genders = useMemo(() => ['All', 'Men', 'Women'], []);

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    if (searchQuery.trim()) {
        filtered = filtered.filter(a => 
            matchesSearchQuery({ title: a.title, content: a.content, tags: a.tags }, searchQuery)
        );
    }

    // Apply product type filter
    if (selectedType !== 'All') {
        const selected = selectedType.toLowerCase();
        
        filtered = filtered.filter(a => {
            if (!a.tags) return false;
            const title = a.title.toLowerCase();
            const tags = a.tags.map(t => t.toLowerCase());

            if (selected === 'dresses') {
                const isExcluded = (!title.includes('dress') && (title.includes('skirt') || title.includes('pant') || title.includes('hoodie') || title.includes('sweatshirt') || title.includes('t-shirt') || title.includes('tee')));
                if (isExcluded) return false;
                return title.includes('dress') || tags.some(t => t === 'dress' || t === 'dresses' || t.includes('dress'));
            }

            if (selected === 'skirts') {
                const isExcluded = title.includes('dress') || title.includes('tee') || title.includes('t-shirt') || 
                                   title.includes('hoodie') || title.includes('sweatshirt') || title.includes('pant') ||
                                   title.includes('swim') || tags.some(t => t === 'dress' || t === 'dresses');
                if (isExcluded) return false;
                return title.includes('skirt') || tags.some(t => (t.includes('skirt') || t === 'skirts') && !t.includes('dress'));
            }

            if (selected === 'swimwear') {
                return title.includes('swim') || title.includes('bikini') || title.includes('one-piece') ||
                       tags.some(t => t.includes('swim') || t.includes('bikini'));
            }

            if (selected === 'yoga') {
                return tags.some(t => t.includes('yoga') || t.includes('legging') || t.includes('sports bra') || t.includes('capri')) ||
                       title.includes('yoga') || title.includes('legging') || title.includes('sports bra') || title.includes('capri');
            }

            if (selected === 'sweatshirts') {
                const isBottom = title.includes('sweatpant') || title.includes('pant') || title.includes('jogger') || title.includes('short') || title.includes('legging');
                const isHoodie = title.includes('hoodie') || title.includes('hooded') || title.includes('hoody') || tags.some(t => t.includes('hoodie') || t.includes('hooded') || t.includes('hoody'));
                const isTee = (title.includes('t-shirt') || title.includes('tee') || title.includes('tank')) && !title.includes('sweatshirt');
                const isDressOrSkirt = title.includes('dress') || title.includes('skirt');
                if (isBottom || isHoodie || isTee || isDressOrSkirt) return false;

                return title.includes('sweatshirt') || 
                       tags.some(t => t === 'sweatshirt' || t === 'sweatshirts' || t.includes('crewneck sweatshirt') || t.includes('fleece sweatshirt')) ||
                       (title.includes('crewneck') && !title.includes('shirt') && !title.includes('tee') && !title.includes('dress'));
            }

            if (selected === 'hoodies') {
                const isBottom = title.includes('sweatpant') || title.includes('pant') || title.includes('jogger') || title.includes('short') || title.includes('legging');
                const isDressOrSkirt = title.includes('dress') || title.includes('skirt');
                if (isBottom || isDressOrSkirt) return false;
                return title.includes('hoodie') || title.includes('hooded') || title.includes('hoody') ||
                       tags.some(t => (t.includes('hoodie') || t.includes('hooded') || t.includes('hoody')) && !t.includes('sweatpant') && !t.includes('dress'));
            }

            if (selected === 'tees') {
                const isExcluded = title.includes('dress') || title.includes('skirt') || title.includes('swim') || 
                                   title.includes('sweatshirt') || title.includes('hoodie') || title.includes('sweatpant') ||
                                   title.includes('pant') || title.includes('jogger') || title.includes('legging') || title.includes('short') ||
                                   tags.some(t => t.includes('dress') || t.includes('skirt') || t.includes('swimwear') || t.includes('swimsuit'));
                if (isExcluded) return false;

                return title.includes('t-shirt') || title.includes('tee') || title.includes('tank') ||
                       tags.some(t => (t.includes('t-shirt') || t.includes('tee') || t.includes('tank top') || t === 'tank') && 
                                      !t.includes('dress') && !t.includes('skirt') && !t.includes('sweatshirt') && !t.includes('hoodie'));
            }

            if (selected === 'beanies') {
                return title.includes('beanie') || tags.some(t => t.includes('beanie'));
            }

            if (selected === 'hats') {
                const isBeanie = title.includes('beanie') || tags.some(t => t.includes('beanie'));
                if (isBeanie) return false;
                return title.includes('hat') || title.includes('cap') || tags.some(t => (t.includes('hat') || t.includes('cap')) && !t.includes('beanie'));
            }

            let searchTerm = selected;
            if (selected === 'tees') searchTerm = 't-shirt';
            else if (selected.endsWith('es')) searchTerm = selected.slice(0, -2);
            else if (selected.endsWith('s')) searchTerm = selected.slice(0, -1);

            return tags.some(tag => tag.includes(searchTerm)) || title.includes(searchTerm);
        });
    }

    // Apply gender filter
    if (selectedGender !== 'All') {
        const gender = selectedGender.toLowerCase();
        filtered = filtered.filter(a => {
            if (!a.tags) return false;
            if (gender === 'men') {
                return a.tags.some(tag => /\b(men's|mens|men|unisex)\b/i.test(tag));
            }
            if (gender === 'women') {
                return a.tags.some(tag => /\b(women's|womens|women|unisex)\b/i.test(tag));
            }
            return false;
        });
    }

    return filtered;
  }, [articles, searchQuery, selectedGender, selectedType]);

  const showGenderFilter = useMemo(() => {
    if (selectedType === 'All') return false;
    
    const selected = selectedType.toLowerCase();
    
    const typeArticles = articles.filter(a => {
        if (!a.tags) return false;
        const title = a.title.toLowerCase();
        const tags = a.tags.map(t => t.toLowerCase());

        if (selected === 'dresses') {
            const isExcluded = (!title.includes('dress') && (title.includes('skirt') || title.includes('pant') || title.includes('hoodie') || title.includes('sweatshirt') || title.includes('t-shirt') || title.includes('tee')));
            if (isExcluded) return false;
            return title.includes('dress') || tags.some(t => t === 'dress' || t === 'dresses' || t.includes('dress'));
        }

        if (selected === 'skirts') {
            const isExcluded = title.includes('dress') || title.includes('tee') || title.includes('t-shirt') || 
                               title.includes('hoodie') || title.includes('sweatshirt') || title.includes('pant') ||
                               title.includes('swim') || tags.some(t => t === 'dress' || t === 'dresses');
            if (isExcluded) return false;
            return title.includes('skirt') || tags.some(t => (t.includes('skirt') || t === 'skirts') && !t.includes('dress'));
        }

        if (selected === 'swimwear') {
            return title.includes('swim') || title.includes('bikini') || title.includes('one-piece') ||
                   tags.some(t => t.includes('swim') || t.includes('bikini'));
        }

        if (selected === 'yoga') {
            return tags.some(t => t.includes('yoga') || t.includes('legging') || t.includes('sports bra') || t.includes('capri')) ||
                   title.includes('yoga') || title.includes('legging') || title.includes('sports bra') || title.includes('capri');
        }

        if (selected === 'sweatshirts') {
            const isBottom = title.includes('sweatpant') || title.includes('pant') || title.includes('jogger') || title.includes('short') || title.includes('legging');
            const isHoodie = title.includes('hoodie') || title.includes('hooded') || title.includes('hoody') || tags.some(t => t.includes('hoodie') || t.includes('hooded') || t.includes('hoody'));
            const isTee = (title.includes('t-shirt') || title.includes('tee') || title.includes('tank')) && !title.includes('sweatshirt');
            const isDressOrSkirt = title.includes('dress') || title.includes('skirt');
            if (isBottom || isHoodie || isTee || isDressOrSkirt) return false;

            return title.includes('sweatshirt') || 
                   tags.some(t => t === 'sweatshirt' || t === 'sweatshirts' || t.includes('crewneck sweatshirt') || t.includes('fleece sweatshirt')) ||
                   (title.includes('crewneck') && !title.includes('shirt') && !title.includes('tee') && !title.includes('dress'));
        }

        if (selected === 'hoodies') {
            const isBottom = title.includes('sweatpant') || title.includes('pant') || title.includes('jogger') || title.includes('short') || title.includes('legging');
            const isDressOrSkirt = title.includes('dress') || title.includes('skirt');
            if (isBottom || isDressOrSkirt) return false;
            return title.includes('hoodie') || title.includes('hooded') || title.includes('hoody') ||
                   tags.some(t => (t.includes('hoodie') || t.includes('hooded') || t.includes('hoody')) && !t.includes('sweatpant') && !t.includes('dress'));
        }

        if (selected === 'tees') {
            const isExcluded = title.includes('dress') || title.includes('skirt') || title.includes('swim') || 
                               title.includes('sweatshirt') || title.includes('hoodie') || title.includes('sweatpant') ||
                               title.includes('pant') || title.includes('jogger') || title.includes('legging') || title.includes('short') ||
                               tags.some(t => t.includes('dress') || t.includes('skirt') || t.includes('swimwear') || t.includes('swimsuit'));
            if (isExcluded) return false;

            return title.includes('t-shirt') || title.includes('tee') || title.includes('tank') ||
                   tags.some(t => (t.includes('t-shirt') || t.includes('tee') || t.includes('tank top') || t === 'tank') && 
                                  !t.includes('dress') && !t.includes('skirt') && !t.includes('sweatshirt') && !t.includes('hoodie'));
        }

        if (selected === 'beanies') {
            return title.includes('beanie') || tags.some(t => t.includes('beanie'));
        }

        if (selected === 'hats') {
            const isBeanie = title.includes('beanie') || tags.some(t => t.includes('beanie'));
            if (isBeanie) return false;
            return title.includes('hat') || title.includes('cap') || tags.some(t => (t.includes('hat') || t.includes('cap')) && !t.includes('beanie'));
        }

        let searchTerm = selected;
        if (selected === 'tees') searchTerm = 't-shirt';
        else if (selected.endsWith('es')) searchTerm = selected.slice(0, -2);
        else if (selected.endsWith('s')) searchTerm = selected.slice(0, -1);

        return tags.some(tag => tag.includes(searchTerm)) || title.includes(searchTerm);
    });

    const hasMen = typeArticles.some(a => a.tags?.some(tag => /\b(men's|mens|men|unisex)\b/i.test(tag)));
    const hasWomen = typeArticles.some(a => a.tags?.some(tag => /\b(women's|womens|women|unisex)\b/i.test(tag)));

    return hasMen && hasWomen;
  }, [articles, selectedType]);

  const featuredArticle = useMemo(() => articles.find(a => a.id === 'brand-hero-fixed') || filteredArticles[0], [articles, filteredArticles]);

  // If hero is hidden or we are filtering, we exclude the pinned hero from the grid
  const listArticles = useMemo(() => {
    let list = filteredArticles;
    // Allow hero visibility for either 'All' or the initialType (e.g. Dresses)
    if (!hideHero && !searchQuery && (selectedType === 'All' || selectedType === initialType)) {
        list = filteredArticles.filter(a => a.id !== 'brand-hero-fixed');
    }
    return list.slice(0, visibleArticleCount);
  }, [filteredArticles, visibleArticleCount, hideHero, searchQuery, selectedType, initialType]);

  const hasMoreArticles = useMemo(() => {
    let list = filteredArticles;
    if (!hideHero && !searchQuery && (selectedType === 'All' || selectedType === initialType)) {
        list = filteredArticles.filter(a => a.id !== 'brand-hero-fixed');
    }
    return list.length > visibleArticleCount;
  }, [filteredArticles, visibleArticleCount, hideHero, searchQuery, selectedType, initialType]);

  const handleLoadMore = () => {
    startTransition(() => {
      setVisibleArticleCount((prev) => prev + ARTICLES_PER_PAGE);
    });
  };

  const handleClearSearch = () => setSearchQuery('');

  if (articles.length === 0) {
    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {!hideHero && featuredArticle && !searchQuery && (selectedType === 'All' || selectedType === initialType) && (
          <div className="mb-12">
            <HeroSection
              article={featuredArticle}
              onReadMore={() => setSelectedArticle(featuredArticle)}
            />
          </div>
        )}

        {title && (
            <div className="mb-12 text-center">
                <h1 className="text-4xl lg:text-6xl font-headline font-bold mb-4 uppercase tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{description}</p>}
            </div>
        )}

        <div className="flex flex-col gap-8 mb-12">
            {/* Header Level Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/50 pb-8">
                <div className="flex flex-col gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 -mb-2 no-scrollbar">
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground shrink-0">Collection:</span>
                        <div className="flex gap-2">
                            {productTypes.map(type => (
                                <Button
                                    key={type}
                                    variant={selectedType === type ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setSelectedType(type);
                                        setSelectedGender('All');
                                    }}
                                    className={cn(
                                        "h-9 px-5 text-xs font-bold uppercase tracking-wider transition-all",
                                        selectedType === type && "bg-primary text-primary-foreground border-primary"
                                    )}
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    {showGenderFilter && (
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground shrink-0">Gender:</span>
                            <div className="flex gap-2">
                                {genders.map(gender => (
                                    <Button
                                        key={gender}
                                        variant={selectedGender === gender ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedGender(gender)}
                                        className={cn(
                                            "h-8 px-4 text-[10px] font-bold uppercase tracking-widest transition-all",
                                            selectedGender === gender && "bg-primary text-primary-foreground border-primary"
                                        )}
                                    >
                                        {gender}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            type="search"
                            placeholder="Search..."
                            className="pl-9 h-10 bg-card/50"
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                if (val.trim() && selectedType !== 'All') {
                                    setSelectedType('All');
                                    setSelectedGender('All');
                                }
                            }}
                        />
                        {searchQuery && (
                            <button 
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-full"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    <Tabs
                        value={layout}
                        onValueChange={(v) => setLayout(v as Layout)}
                        className="hidden sm:block"
                    >
                        <TabsList className="bg-card/50">
                            <TabsTrigger value="grid" className="data-[state=active]:bg-background">
                                <LayoutGrid className="h-4 w-4" />
                            </TabsTrigger>
                            <TabsTrigger value="list" className="data-[state=active]:bg-background">
                                <List className="h-4 w-4" />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            {/* Results Grid */}
            <div className="min-h-[40vh]">
                {listArticles.length > 0 ? (
                    layout === 'grid' ? (
                        <ArticleGrid
                            articles={listArticles}
                            onArticleSelect={setSelectedArticle}
                        />
                    ) : (
                        <ArticleList
                            articles={listArticles}
                            onArticleSelect={setSelectedArticle}
                        />
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-muted p-4 rounded-full mb-4">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className='text-2xl font-bold mb-2'>No Items Found</h2>
                        <p className='text-muted-foreground max-w-xs'>
                            We couldn't find anything matching your current filters or search criteria.
                        </p>
                        <Button 
                            variant="link" 
                            className="mt-4 text-primary"
                            onClick={() => {
                                setSelectedType('All');
                                setSelectedGender('All');
                                setSearchQuery('');
                            }}
                        >
                            Clear all filters
                        </Button>
                    </div>
                )}

                {hasMoreArticles && (
                    <div className="flex justify-center mt-16 pb-8">
                        <Button 
                            variant="outline"
                            size="lg"
                            onClick={handleLoadMore} 
                            disabled={isPending}
                            className="min-w-[200px] font-bold uppercase tracking-widest"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Load More'
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>

      <ArticleView
        article={selectedArticle}
        open={!!selectedArticle}
        onOpenChange={(isOpen) => !isOpen && setSelectedArticle(null)}
      />
    </main>
  );
}
