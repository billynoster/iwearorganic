
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Heart, Home, Dog, Cat } from 'lucide-react';

export default function RescuingPetsPage() {
  return (
    <main className="w-full mx-auto max-w-6xl py-16 px-4 sm:px-6 lg:px-8">
      {/* --- Hero Section --- */}
      <div className="relative h-[60vh] min-h-[400px] rounded-lg overflow-hidden shadow-xl mb-16">
        <Image
            src="https://firebasestorage.googleapis.com/v0/b/gen-lang-client-0039997765.firebasestorage.app/o/images%2Frescue-pets.png?alt=media"
            alt="A happy dog being pet by a person"
            fill
            className="object-cover"
            data-ai-hint="dog rescue"
            priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
            <h1 className="text-4xl lg:text-6xl font-headline font-bold mb-4">
                Adopt & Rescue: A Journey of Second Chances
            </h1>
            <p className="text-lg lg:text-xl max-w-3xl">
                From the streets to a loving home, every rescued animal has a story. Discover the joy of adoption and change a life forever.
            </p>
        </div>
      </div>

      {/* --- Why Adopt Section --- */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold font-headline mb-4">The Impact of Rescuing a Shelter Animal</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
          When you adopt from a shelter, you do more than just bring home a pet—you save a life and gain a friend who will be forever grateful.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 bg-secondary rounded-full">
              <Heart className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-bold">You Save a Life</h3>
            <p className="text-muted-foreground">You give a deserving animal a loving home and free up shelter resources for another animal in need.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 bg-secondary rounded-full">
              <Dog className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-bold">Find Your Perfect Match</h3>
            <p className="text-muted-foreground">Shelters are full of animals with unique personalities, ensuring you can find the right companion for your life.</p>
          </div>
          <div className="flex flex-col items-center space-y-3">
            <div className="p-4 bg-secondary rounded-full">
              <Home className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-bold">Support a Compassionate Cause</h3>
            <p className="text-muted-foreground">Choosing to adopt helps fight pet overpopulation and supports the vital work of local shelters and rescue groups.</p>
          </div>
        </div>
      </div>

      <Separator className="my-16" />

      {/* --- CTA Section --- */}
        <div className="text-center bg-card p-8 md:p-12 rounded-lg shadow-lg">
            <Cat className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold font-headline">Find a Rescue Organization</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4 mb-8">
                Your new best friend is waiting for you. Take the first step on a rewarding journey by connecting with these incredible organizations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button asChild size="lg" variant="outline">
                    <Link href="https://bestfriends.org" target="_blank" rel="noopener noreferrer">
                        Best Friends Animal Society
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="https://www.animalleague.org" target="_blank" rel="noopener noreferrer">
                        North Shore Animal League America
                    </Link>
                </Button>
            </div>
        </div>
    </main>
  );
}
