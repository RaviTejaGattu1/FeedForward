
'use client';

import { generateHomepageContent } from '@/ai/flows/homepage-statistics-blurb';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from './ui/skeleton';

function Blurb() {
  const [blurb, setBlurb] = useState('Join us in the fight against hunger. Every contribution makes a difference.');

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
        // Don't show an error to the user, just use the default blurb.
        // We already show an API key error on the page if that's the issue.
        console.error('Failed to generate motivational blurb:', e);
      });
  }, []);

  return <>{blurb}</>;
}


const DynamicBlurb = dynamic(() => Promise.resolve(Blurb), {
  ssr: false,
  loading: () => <Skeleton className="h-7 w-[600px] mx-auto" />,
});


export function MotivationalBlurb() {
    return <DynamicBlurb />;
}
