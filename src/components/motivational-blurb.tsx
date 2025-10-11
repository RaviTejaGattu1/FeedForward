
'use client';

import { generateHomepageContent } from '@/ai/flows/homepage-statistics-blurb';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

export function MotivationalBlurb() {
  const [blurb, setBlurb] = useState('Join us in the fight against hunger. Every contribution makes a difference.');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stats = {
      foodDeliveredLbs: 10000,
      hungerMetKcal: 5000000,
      livesImpacted: 1000,
    };
    
    generateHomepageContent(stats)
      .then(content => {
        setBlurb(content.motivationalBlurb);
      })
      .catch(e => {
        console.error('Failed to generate motivational blurb:', e);
        // Default blurb is already set.
      })
      .finally(() => {
          setLoading(false);
      });
  }, []);

  if (loading) {
      return <Skeleton className="h-7 w-[600px] mx-auto" />;
  }

  return <span>{blurb}</span>;
}
