
'use client';

import {
  GoogleMap,
  Marker,
} from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import {
  type ComponentProps,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLocation } from '@/hooks/use-location';

type LocationInputProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  onLocationSelect?: (
    lat: number,
    lng: number,
    formattedAddress: string
  ) => void;
  isGeolocateDefault?: boolean;
  onGeolocateError?: (message: string) => void;
} & Omit<ComponentProps<'input'>, 'value' | 'onChange'>;

export function LocationInput({
  value,
  onValueChange,
  onLocationSelect,
  isGeolocateDefault = false,
  onGeolocateError,
  ...props
}: LocationInputProps) {
  const { mapCenter, setMapCenter, markerPosition, setMarkerPosition } =
    useLocation(true, onValueChange, onLocationSelect, isGeolocateDefault, onGeolocateError);

  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  
  useEffect(() => {
    if (inputRef.current && !autocomplete) {
      const newAutocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: ['geometry', 'formatted_address'],
        }
      );
      setAutocomplete(newAutocomplete);

      return () => {
        if (newAutocomplete) {
          window.google.maps.event.clearInstanceListeners(newAutocomplete);
        }
      };
    }
  }, [autocomplete]);

  useEffect(() => {
    if (autocomplete) {
      const listener = autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const formattedAddress = place.formatted_address ?? '';
          
          onValueChange?.(formattedAddress);
          setMapCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          if (onLocationSelect) {
            onLocationSelect(lat, lng, formattedAddress);
          }
        }
      });

      return () => {
        if (listener) {
          window.google.maps.event.removeListener(listener);
        }
      };
    }
  }, [autocomplete, onValueChange, onLocationSelect, setMapCenter, setMarkerPosition]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.(e.target.value);
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder="Enter an address"
        {...props}
      />
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-8 w-8"
          >
            <MapPin className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Select Location</DialogTitle>
          </DialogHeader>
          <div className="h-[400px] w-full rounded-md overflow-hidden">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={15}
              onClick={(e) => {
                if (e.latLng) {
                  setMarkerPosition({
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                  });
                }
              }}
            >
              {markerPosition && <Marker position={markerPosition} />}
            </GoogleMap>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (markerPosition) {
                  // Manually geocode the selected pin position
                  const geocoder = new window.google.maps.Geocoder();
                  geocoder.geocode({ location: markerPosition }, (results, status) => {
                     if (status === 'OK' && results?.[0]) {
                        const formattedAddress = results[0].formatted_address;
                        onValueChange?.(formattedAddress);
                        if (onLocationSelect) {
                           onLocationSelect(markerPosition.lat, markerPosition.lng, formattedAddress);
                        }
                     }
                  });
                }
                setIsMapOpen(false);
              }}
            >
              Confirm Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="text-xs text-muted-foreground mt-1">
        You can also use the map pin to select your precise location.
      </p>
    </div>
  );
}

    