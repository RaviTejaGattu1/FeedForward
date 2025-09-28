
'use client';

import { useState, useEffect, useCallback } from 'react';

type LocationData = {
  lat: number;
  lng: number;
  formattedAddress: string;
};

export function useLocation(
  onLocationSelect?: (
    lat: number,
    lng: number,
    formattedAddress: string
  ) => void,
  isGeolocateDefault = false
) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
    null
  );
  const [mapCenter, setMapCenter] = useState({
    lat: 40.7128,
    lng: -74.006,
  }); // Default to NYC
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleGeolocate = useCallback(
    (lat?: number, lng?: number) => {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = lat && lng ? { lat, lng } : null;

      const geocodeCallback = (
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus
      ) => {
        if (status === 'OK' && results?.[0]) {
          const formattedAddress = results[0].formatted_address;
          const location = results[0].geometry.location;
          const newLat = location.lat();
          const newLng = location.lng();

          const newLocation = { lat: newLat, lng: newLng, formattedAddress };
          setCurrentLocation(newLocation);
          setMapCenter({ lat: newLat, lng: newLng });
          setMarkerPosition({ lat: newLat, lng: newLng });

          if (onLocationSelect) {
            onLocationSelect(newLat, newLng, formattedAddress);
          }
        } else {
          console.error(
            'Geocode was not successful for the following reason: ' + status
          );
        }
      };

      if (latlng) {
        geocoder.geocode({ location: latlng }, geocodeCallback);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLat = position.coords.latitude;
            const newLng = position.coords.longitude;
            geocoder.geocode(
              { location: { lat: newLat, lng: newLng } },
              geocodeCallback
            );
          },
          () => {
            console.error('Error: The Geolocation service failed.');
          }
        );
      } else {
        console.error("Error: Your browser doesn't support geolocation.");
      }
    },
    [onLocationSelect]
  );

  useEffect(() => {
    if (isGeolocateDefault && typeof window.google !== 'undefined') {
      handleGeolocate();
    }
  }, [isGeolocateDefault, handleGeolocate]);

  return {
    currentLocation,
    mapCenter,
    setMapCenter,
    markerPosition,
    setMarkerPosition,
    handleGeolocate,
  };
}
