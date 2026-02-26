//Created 11/18/2025 - Rachel Townsend
//Don't forget to install expo-location "npx install expo-location"

import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase"; //correct path?

const ACTIVE_GROUP_ID = null;

export function useLocation() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy, heading }
  const [error, setError] = useState(null);
  const subRef = useRef(null);

  const lastSentAtRef = useRef(0); //don't write too often

  const stop = useCallback(() => {
    try {
      subRef.current?.remove?.();
    } catch (e) {
      //ignore
    }
    subRef.current = null;
  }, []);

  const pushToSupabasae = useCallback(async (c) => {
    if(!c) return;
    //does DB require group_id not NULL?
    if (!ACTIVE_GROUP_ID) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < 2500) return; // send max ~every 2.5s
    lastSentAtRef.current = now;

    try {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userRes?.user;
      if (!user) return;

      const { error: upsertErr } = await supabase
        .from("locations")
        .upsert(
          {
            user_id: user.id,
            group_id: ACTIVE_GROUP_ID,
            latitude: c.latitude,
            longitude: c.longitude,
            updated_at: new Date().toISOString(),
          },
          //Thurs: add UNIQUE(group_id, user_id) in DB
          { onConflict: "group_id,user_id" }
        );

      if (upsertErr) throw upsertErr;
    } catch (e) {
      console.log("Supabase location upsert failed:", e?.message ?? e);
    }
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
