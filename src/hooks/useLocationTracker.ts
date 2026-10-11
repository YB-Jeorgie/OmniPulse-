import { useState, useEffect, useCallback, useRef } from 'react';
import { LocationData } from '../types';

const DEFAULT_LOCATION: LocationData = {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 15,
  altitude: 12,
  speed: null,
  heading: null,
  address: 'Market St, San Francisco, California, USA',
  city: 'San Francisco',
  country: 'USA',
  status: 'idle',
  lastUpdated: null,
};

export function useLocationTracker() {
  const [location, setLocation] = useState<LocationData>(() => {
    try {
      const saved = localStorage.getItem('omnipulse_location');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LOCATION;
  });

  const watchIdRef = useRef<number | null>(null);
  const lastGeocodeCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    // Only re-geocode if moved by > 0.001 deg (~110m) to save requests
    if (
      lastGeocodeCoordsRef.current &&
      Math.abs(lastGeocodeCoordsRef.current.lat - lat) < 0.0008 &&
      Math.abs(lastGeocodeCoordsRef.current.lng - lng) < 0.0008
    ) {
      return;
    }

    try {
      lastGeocodeCoordsRef.current = { lat, lng };
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        setLocation((prev) => {
          const updated = {
            ...prev,
            address: data.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
            city: data.city || prev.city || 'Nearby',
            country: data.country || prev.country || '',
            lastUpdated: Date.now(),
          };
          try {
            localStorage.setItem('omnipulse_location', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocation((prev) => ({
        ...prev,
        status: 'error',
        errorMessage: 'Geolocation is not supported by your browser.',
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, status: 'requesting' }));

    const onSuccess: PositionCallback = (pos) => {
      const { latitude, longitude, accuracy, altitude, speed, heading } = pos.coords;
      setLocation((prev) => ({
        ...prev,
        latitude,
        longitude,
        accuracy,
        altitude,
        speed,
        heading,
        status: 'active',
        lastUpdated: Date.now(),
      }));

      reverseGeocode(latitude, longitude);
    };

    const onError: PositionErrorCallback = (err) => {
      console.warn('Geolocation watch error:', err.message);
      if (err.code === 1) {
        // Permission denied
        setLocation((prev) => ({
          ...prev,
          status: 'denied',
          errorMessage: 'Location permission was denied. Using simulated location.',
        }));
      } else {
        setLocation((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: err.message || 'Unable to retrieve location.',
        }));
      }
    };

    try {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      });
    } catch (e: any) {
      onError({
        code: 2,
        message: e?.message || 'Failed to start geolocation',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError);
    }
  }, [reverseGeocode]);

  // Set preset location for manual testing or demo
  const setPresetLocation = useCallback(
    (name: string, lat: number, lng: number, address: string, city: string, country: string) => {
      const updated: LocationData = {
        latitude: lat,
        longitude: lng,
        accuracy: 10,
        altitude: 20,
        speed: 1.2,
        heading: 90,
        address,
        city,
        country,
        status: 'active',
        lastUpdated: Date.now(),
      };
      setLocation(updated);
      try {
        localStorage.setItem('omnipulse_location', JSON.stringify(updated));
      } catch {}
    },
    []
  );

  useEffect(() => {
    startTracking();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startTracking]);

  return {
    location,
    startTracking,
    setPresetLocation,
  };
}
