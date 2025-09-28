
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
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsFormValid(!!(name && email && password));
  }, [name, email, password]);

  const handleCreateAccount = async () => {
    setError('');
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // After creating the user, update their profile with the name
      if (user) {
        await updateProfile(user, {
          displayName: name,
        });

        // Create a document in the 'users' collection
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName: name,
            email: user.email,
            createdAt: serverTimestamp(),
        });
      }

      setIsSuccess(true);
      toast({
        title: 'Registration Successful!',
        description: 'Your account has been created.',
      });
      router.push('/dashboard');
    } catch (firebaseError: any) {
      let friendlyMessage = 'An unexpected error occurred. Please try again.';
      if (firebaseError.code === 'auth/email-already-in-use') {
        friendlyMessage = 'This email address is already in use. Please use a different email.';
      } else if (firebaseError.code === 'auth/weak-password') {
        friendlyMessage = 'The password is too weak. Please choose a stronger password (at least 6 characters).';
      } else if (firebaseError.code === 'auth/invalid-email') {
        friendlyMessage = 'The email address is not valid. Please enter a valid email.';
      } else if (firebaseError.code === 'auth/invalid-credential') {
        friendlyMessage = 'The credentials provided are invalid. Please check the email and password and try again.';
      }
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            {error && (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
               <Alert>
                 <Terminal className="h-4 w-4" />
                 <AlertTitle>Success!</AlertTitle>
                 <AlertDescription>
                   Registration successful! Redirecting to dashboard...
                 </AlertDescription>
               </Alert>
            )}

          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button
              className={cn('w-full', {
                'bg-success text-success-foreground hover:bg-success/90': isFormValid,
              })}
              disabled={!isFormValid || isLoading || isSuccess}
              onClick={() => {
                handleCreateAccount().catch(console.error);
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
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
