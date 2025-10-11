import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Typewriter } from './ui/typewriter';

type StatCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
  description: string;
};

export function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <Card className="text-center transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-col items-center justify-center space-y-2 pb-2">
        {icon}
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
            <Typewriter text={value} />
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
