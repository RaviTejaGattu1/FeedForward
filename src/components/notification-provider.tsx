
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useListings, type Listing } from '@/hooks/use-listings';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

type NotificationContextType = {};

const NotificationContext = createContext<NotificationContextType>({});

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { listings } = useListings();
  const [notification, setNotification] = useState<Listing | null>(null);
  const router = useRouter();

  // Use a ref to track the listings we've already notified the user about in this session.
  const notifiedListingIds = useRef(new Set<string>());

  useEffect(() => {
    if (user && listings.length > 0) {
      const myAwaitingListings = listings.filter(
        (listing) =>
          listing.userId === user.uid &&
          listing.status === 'awaiting approval' &&
          !notifiedListingIds.current.has(listing.id)
      );

      if (myAwaitingListings.length > 0) {
        // Just show the first new notification.
        const nextNotification = myAwaitingListings[0];
        setNotification(nextNotification);
        // Add to the set to prevent re-notifying for the same listing in the same session.
        notifiedListingIds.current.add(nextNotification.id);
      }
    }
  }, [listings, user]);

  const handleClose = () => {
    setNotification(null);
  };
  
  const handleGoToListings = () => {
    router.push('/listings');
    setNotification(null);
  }

  return (
    <NotificationContext.Provider value={{}}>
      {children}
      {notification && (
        <AlertDialog open={!!notification} onOpenChange={() => setNotification(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>You have a new reservation request!</AlertDialogTitle>
              <AlertDialogDescription>
                Someone has requested your listing for "{notification.foodName}". Please review the request on your listings page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={handleClose}>Close</Button>
              <AlertDialogAction onClick={handleGoToListings}>
                Go to My Listings
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
