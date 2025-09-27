'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

// In a real app, this would be your database.
const existingUsers = [{ id: 'admin' }];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsFormValid(!!(name && id && password && role));
  }, [name, id, password, role]);

  const handleCreateAccount = () => {
    setError('');
    
    // Check if user ID already exists
    if (existingUsers.some(user => user.id === id)) {
      setError('User with this ID already exists. Please choose another ID.');
      return;
    }

    // Simulate creating a new user
    const newUser = { name, id, password, role };
    existingUsers.push(newUser);

    setIsSuccess(true);
    toast({
      title: 'Registration Successful!',
      description: 'Your account has been created.',
    });

    setTimeout(() => {
      router.push('/');
    }, 2000);
  };


  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Register</CardTitle>
            <CardDescription>
              Create an account to join the FeedForward network.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Max Robinson"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                placeholder="maxr"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                className="flex gap-4 pt-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="r-user" />
                  <Label htmlFor="r-user" className="font-normal">
                    User
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="r-admin" />
                  <Label htmlFor="r-admin" className="font-normal">
                    Admin
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
               <Alert>
                 <Terminal className="h-4 w-4" />
                 <AlertTitle>Success!</AlertTitle>
                 <AlertDescription>
                   Registration successful! Redirecting to homepage...
                 </AlertDescription>
               </Alert>
            )}

          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              className={cn('w-full', {
                'bg-success text-success-foreground hover:bg-success/90': isFormValid,
              })}
              disabled={!isFormValid || isSuccess}
              onClick={handleCreateAccount}
            >
              Create
            </Button>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
      <AppFooter />
    </div>
  );
}
