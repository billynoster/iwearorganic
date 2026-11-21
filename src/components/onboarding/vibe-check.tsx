'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp, collection, getDocs, addDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import Image from 'next/image';

const VIBES = {
  'classic-americana': {
    title: 'Classic Americana',
    description: 'Timeless denim, crisp whites, and heritage styles.',
    image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Famericana.jpg?alt=media'
  },
  'coastal-summer': {
    title: 'Coastal Summer',
    description: 'Breezy fabrics, bright colors, and beach-ready fits.',
    image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fcoastal.jpg?alt=media'
  },
  'urban-edge': {
    title: 'Urban Edge',
    description: 'Modern streetwear, bold silhouettes, and darker tones.',
    image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Furban.jpg?alt=media'
  },
  'vintage-retro': {
    title: 'Vintage Retro',
    description: '70s/80s inspired patterns, nostalgic cuts, and vibrant energy.',
    image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fretro.jpg?alt=media'
  }
};

const QUIZ_STEPS = [
  {
    id: 'uniform',
    question: "What's your go-to weekend uniform?",
    options: [
      { id: 'classic-americana', label: 'Denim and a classic tee', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fdenimtee.jpg?alt=media' },
      { id: 'coastal-summer', label: 'Linen shorts and a breezy shirt', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Flinenshorts.jpg?alt=media' },
      { id: 'urban-edge', label: 'Oversized hoodie and cargo pants', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fstreetwear.jpg?alt=media' },
      { id: 'vintage-retro', label: 'Vintage track jacket and high-waisted jeans', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Ftrackjacket.jpg?alt=media' },
    ]
  },
  {
    id: 'palette',
    question: "Which color palette speaks to you?",
    options: [
      { id: 'classic-americana', label: 'Navy, White, Red, Khaki', colors: ['#000080', '#FFFFFF', '#FF0000', '#F0E68C'] },
      { id: 'coastal-summer', label: 'Seafoam, Sand, Coral, Sky Blue', colors: ['#9FE2BF', '#C2B280', '#FF7F50', '#87CEEB'] },
      { id: 'urban-edge', label: 'Black, Charcoal, Neon accents', colors: ['#000000', '#36454F', '#39FF14', '#FF00FF'] },
      { id: 'vintage-retro', label: 'Mustard, Rust, Olive, Brown', colors: ['#FFDB58', '#B7410E', '#808000', '#964B00'] },
    ]
  },
  {
    id: 'environment',
    question: "Where would you rather spend a Saturday?",
    options: [
      { id: 'classic-americana', label: 'A cozy cabin or a classic diner', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fdiner.jpg?alt=media' },
      { id: 'coastal-summer', label: 'A sunny beach or a coastal town', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fbeach.jpg?alt=media' },
      { id: 'urban-edge', label: 'A bustling city street or an underground club', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fcity.jpg?alt=media' },
      { id: 'vintage-retro', label: 'A retro arcade or a thrift store', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Farcade.jpg?alt=media' },
    ]
  },
  {
    id: 'fit',
    question: "How do you like your clothes to fit?",
    options: [
      { id: 'tailored', label: 'Tailored & Slim', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Ftailored.jpg?alt=media' },
      { id: 'standard', label: 'Standard & Classic', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fstandard.jpg?alt=media' },
      { id: 'oversized', label: 'Oversized & Relaxed', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Foversized.jpg?alt=media' },
    ]
  },
  {
    id: 'goal',
    question: "What's your primary shopping goal today?",
    options: [
      { id: 'workwear', label: 'Office & Workwear', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fworkwear.jpg?alt=media' },
      { id: 'weekend', label: 'Weekend Casual', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fweekend.jpg?alt=media' },
      { id: 'active', label: 'Active & Loungewear', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Factive.jpg?alt=media' },
      { id: 'going-out', label: 'Going Out & Events', image: 'https://firebasestorage.googleapis.com/v0/b/blendamerica.firebasestorage.app/o/media%2Fgoingout.jpg?alt=media' },
    ]
  }
];

const CATEGORIES = [
  'T-Shirts', 'Hoodies', 'Sweatshirts', 'Tank Tops', 'Leggings', 'Hats', 'Accessories'
];

interface VibeCheckProps {
  onComplete: (vibe: string) => void;
}

export function VibeCheck({ onComplete }: VibeCheckProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleOptionSelect = (stepId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [stepId]: optionId }));
    setTimeout(() => {
      if (step < QUIZ_STEPS.length) {
        setStep(step + 1);
      }
    }, 400);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const calculatedVibe = useMemo(() => {
    if (step <= QUIZ_STEPS.length) return null;
    
    const counts: Record<string, number> = {};
    Object.values(answers).forEach(vibeId => {
      counts[vibeId] = (counts[vibeId] || 0) + 1;
    });
    
    let maxVibe = 'classic-americana';
    let maxCount = 0;
    Object.entries(counts).forEach(([vibeId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxVibe = vibeId;
      }
    });
    
    return maxVibe;
  }, [answers, step]);

  const handleSaveVibe = async () => {
    if (!user || !firestore || !calculatedVibe) return;
    
    setIsSaving(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const updateData = { 
        vibe: calculatedVibe
      };

      if (userDoc.exists()) {
        await updateDoc(userDocRef, updateData);
      } else {
        await setDoc(userDocRef, { 
          id: user.uid,
          email: user.email || '',
          dateJoined: serverTimestamp(),
          ...updateData
        });
      }

      // Save categories and quiz answers to preferences subcollection
      if (selectedCategories.length > 0 || Object.keys(answers).length > 0) {
        const prefCollectionRef = collection(firestore, 'users', user.uid, 'preferences');
        const prefDocs = await getDocs(prefCollectionRef);
        
        const prefData = {
          userId: user.uid,
          categoryIds: selectedCategories,
          stylePreferences: Object.entries(answers).map(([questionId, answerId]) => `${questionId}:${answerId}`),
          updatedAt: serverTimestamp()
        };

        if (!prefDocs.empty) {
          await updateDoc(doc(prefCollectionRef, prefDocs.docs[0].id), prefData);
        } else {
          await addDoc(prefCollectionRef, prefData);
        }
      }
      
      toast({
        title: 'Profile Curated 🎯',
        description: 'Your I Wear Organic experience has been personalized.',
      });
      
      onComplete(calculatedVibe);
    } catch (error) {
      console.error('Error saving vibe:', error);
      toast({
        title: 'Error',
        description: `Failed to save your profile: ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive'
      });
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    if (step < QUIZ_STEPS.length) {
      const currentStep = QUIZ_STEPS[step];
      return (
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col h-full"
        >
          <div className="text-center mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Question {step + 1} of {QUIZ_STEPS.length + 1}</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">{currentStep.question}</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-center">
            {currentStep.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(currentStep.id, option.id)}
                className={`group relative flex flex-col items-center text-center rounded-lg overflow-hidden border-2 transition-all duration-300 p-4 ${
                  answers[currentStep.id] === option.id 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : 'border-border/50 hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                {'image' in option && option.image && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                    <Image src={option.image} alt={option.label} fill className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                )}
                {'colors' in option && option.colors && (
                  <div className="flex gap-2 mb-4 w-full justify-center">
                    {option.colors.map((color: string, i: number) => (
                      <div key={i} className="w-12 h-12 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                )}
                <span className="font-semibold">{option.label}</span>
                {answers[currentStep.id] === option.id && (
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground p-1 rounded-full">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      );
    }

    if (step === QUIZ_STEPS.length) {
      return (
        <motion.div
          key="categories"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="flex flex-col h-full"
        >
          <div className="text-center mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Final Step</p>
            <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">What are you shopping for?</h2>
            <p className="text-muted-foreground mt-2">Select all that apply to help us curate your feed.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 flex-1 content-center max-w-2xl mx-auto">
            {CATEGORIES.map(category => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-6 py-3 rounded-full border-2 font-bold uppercase tracking-widest text-sm transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary text-primary-foreground scale-105 shadow-md' 
                      : 'border-border/50 hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-8 flex justify-center">
            <Button size="lg" className="px-12 py-6 text-lg rounded-full" onClick={() => setStep(step + 1)} disabled={selectedCategories.length === 0}>
              See My Results <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      );
    }

    if (calculatedVibe) {
      const vibeData = VIBES[calculatedVibe as keyof typeof VIBES];
      return (
        <motion.div
          key="result"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center h-full text-center"
        >
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-muted-foreground mb-2">Your I Wear Organic vibe is</h2>
          <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tight text-primary mb-6">
            {vibeData.title}
          </h1>
          <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden mb-6 shadow-2xl">
            <Image src={vibeData.image} alt={vibeData.title} fill className="object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
              <p className="text-white text-lg font-medium">{vibeData.description}</p>
            </div>
          </div>
          <Button 
            size="lg" 
            className="text-lg px-12 py-6 rounded-full mt-4"
            onClick={handleSaveVibe}
            disabled={isSaving}
          >
            {isSaving ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Curating your store...</>
            ) : (
              'Enter the shop'
            )}
          </Button>
        </motion.div>
      );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4 sm:p-6"
    >
      <div className="max-w-4xl w-full h-full max-h-[85vh] flex flex-col bg-card rounded-lg shadow-2xl overflow-hidden border relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / (QUIZ_STEPS.length + 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Back Button */}
        {step > 0 && step <= QUIZ_STEPS.length && (
          <button 
            onClick={() => setStep(step - 1)}
            className="absolute top-6 left-6 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-16">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
