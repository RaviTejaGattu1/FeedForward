
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useLocation(
  isMapsLoaded: boolean,
  onValueChange?: (value: string) => void,
  onLocationSelect?: (
    lat: number,
    lng: number,
    formattedAddress: string
  ) => void,
  isGeolocateDefault = false,
  onGeolocateError?: (message: string) => void
) {
  const [mapCenter, setMapCenter] = useState({
    lat: 40.7128,
    lng: -74.006,
  }); // Default to NYC
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
       onGeolocateError?.("Your browser doesn't support geolocation.");
       return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLng = position.coords.longitude;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { location: { lat: newLat, lng: newLng } },
          (results, status) => {
            if (status === 'OK' && results?.[0]) {
              const formattedAddress = results[0].formatted_address;
              setMapCenter({ lat: newLat, lng: newLng });
              setMarkerPosition({ lat: newLat, lng: newLng });

              onValueChange?.(formattedAddress);
              onLocationSelect?.(newLat, newLng, formattedAddress);
            } else {
              onGeolocateError?.('Could not determine address from your location.');
            }
          }
        );
      },
      () => {
        onGeolocateError?.('Geolocation permission denied. Please enable it in your browser settings.');
      }
    );
  }, [onValueChange, onLocationSelect, onGeolocateError]);

  useEffect(() => {
    if (isGeolocateDefault && isMapsLoaded) {
      handleGeolocate();
    }
  }, [isGeolocateDefault, isMapsLoaded, handleGeolocate]);

  return {
    mapCenter,
    setMapCenter,
    markerPosition,
    setMarkerPosition,
    handleGeolocate,
  };
}

    