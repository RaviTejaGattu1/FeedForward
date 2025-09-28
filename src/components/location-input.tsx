
'use client';

import { useState, useRef, useEffect, type ComponentProps } from 'react';
import {
  Autocomplete,
  GoogleMap,
  Marker,
} from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
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
  variant?: 'input' | 'textarea';
} & Omit<ComponentProps<'input'>, 'value' | 'onChange'> &
  Omit<ComponentProps<'textarea'>, 'value' | 'onChange'>;

export function LocationInput({
  value,
  onValueChange,
  onLocationSelect,
  isGeolocateDefault = false,
  variant = 'textarea',
  ...props
}: LocationInputProps) {
  const {
    mapCenter,
    setMapCenter,
    markerPosition,
    setMarkerPosition,
  } = useLocation(true, onValueChange, onLocationSelect, isGeolocateDefault);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const formattedAddress = place.formatted_address ?? '';

        setMapCenter({ lat, lng });
        setMarkerPosition({ lat, lng });
        onValueChange?.(formattedAddress);
        if (onLocationSelect) {
          onLocationSelect(lat, lng, formattedAddress);
        }
      }
    }
  };

  const InputComponent = variant === 'textarea' ? Textarea : Input;

  return (
    <div className="relative">
      <Autocomplete
        onLoad={(ref) => (autocompleteRef.current = ref)}
        onPlaceChanged={handlePlaceChanged}
        className="w-full"
      >
        <InputComponent
          value={value}
          onChange={(e) => onValueChange?.(e.target.value)}
          placeholder="Enter an address"
          {...(props as any)}
        />
      </Autocomplete>
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1"
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
