
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { ComponentProps } from 'react';
import type { LocationInput } from './location-input';

const LocationInputWithNoSSR = dynamic(
  () => import('./location-input').then((mod) => mod.LocationInput),
  {
    ssr: false,
    loading: () => <Skeleton className="h-20 w-full" />,
  }
);

export function DynamicLocationInput(props: ComponentProps<typeof LocationInput>) {
  return <LocationInputWithNoSSR {...props} />;
}
