//Created 11/18/2025 - Rachel Townsend
//Don't forget to install expo-location "npx install expo location"

import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";

export function useLocation() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy, heading }
  const [error, setError] = useState(null);
  const subRef = useRef(null);

  const stop = useCallback(() => {
    try {
      subRef.current?.remove?.();
    } catch (e) {
      //ignore
    }
    subRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    const ok = status === "granted";
    setPermissionGranted(ok);

    if (!ok) {
      setError("Location permission not granted.");
      return;
    }

    //Ensure we have at least one fix before map tries to center
    const first = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    setCoords({
      latitude: first.coords.latitude,
      longitude: first.coords.longitude,
      accuracy: first.coords.accuracy,
      heading: first.coords.heading,
    });

    stop();
    subRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1500,
        distanceInterval: 2,
      },
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
        });
      }
    );
  }, [stop]);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return { coords, permissionGranted, error, start, stop };
}
