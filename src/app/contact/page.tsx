'use client';

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { PageHero } from '@/components/coastal/page-hero';

export default function ContactPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xkonvabb', {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();
      if (response.ok) {
        toast({
          title: 'Message sent',
          description: "Thanks for reaching out. We'll get back to you shortly.",
        });
        form.reset();
      } else {
        const errorMessages =
          result.errors?.map((err: any) => err.message).join(', ') ||
          'An unknown error occurred.';
        throw new Error(errorMessages);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: error.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <PageHero
        eyebrow="Support"
        title="Contact."
        editorial
        description="Questions, comments, or collaboration — we read every note."
      />
      <div className="ca-container max-w-xl py-12 sm:py-16">
        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
          <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="ca-field-label">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full border border-oat bg-linen px-3 py-2.5 font-body text-sm text-mineral-ink focus:outline-none focus:ring-1 focus:ring-mineral-ink"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="ca-field-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border border-oat bg-linen px-3 py-2.5 font-body text-sm text-mineral-ink focus:outline-none focus:ring-1 focus:ring-mineral-ink"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="ca-field-label">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="w-full border border-oat bg-linen px-3 py-2.5 font-body text-sm text-mineral-ink focus:outline-none focus:ring-1 focus:ring-mineral-ink"
            />
          </div>
          <button type="submit" className="ca-btn-primary" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Send message'}
          </button>
        </form>
      </div>
    </main>
  );
}
