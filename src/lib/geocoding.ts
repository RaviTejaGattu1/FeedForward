
'use client';

export const getCoordsFromAddress = (address: string): Promise<{ lat: number; lng: number } | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.google || !window.google.maps || !window.google.maps.Geocoder) {
      console.error("Google Maps Geocoder not available.");
      return resolve(null);
    }
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const location = results[0].geometry.location;
        resolve({ lat: location.lat(), lng: location.lng() });
      } else {
        // Don't log ZERO_RESULTS as an error, it's a valid (no result) search outcome.
        if (status !== 'ZERO_RESULTS') {
            console.error('Geocode was not successful for the following reason: ' + status);
        }
        resolve(null);
      }
    });
  });
};
