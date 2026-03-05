// Created 11/18/2025 - Rachel Townsend
// Updated: no more hardcoded null

import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";

// groupId is passed in from the screen once the user's profile is loaded
// Until it's provided, location is tracked on-device but NOT written to Supabase
export function useLocation(groupId = null) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const subRef = useRef(null);
  const lastSentAtRef = useRef(0);

  const stop = useCallback(() => {
    try {
      subRef.current?.remove?.();
    } catch (e) {
      // ignore
    }
    subRef.current = null;
  }, []);

  const pushToSupabase = useCallback(async (c) => {
    if (!c) return;
    if (!groupId) return; // no group yet — skip DB write silently

    const now = Date.now();
    if (now - lastSentAtRef.current < 2500) return; // throttle to ~every 2.5s
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
            group_id: groupId,
            latitude: c.latitude,
            longitude: c.longitude,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "group_id,user_id" }
        );

      if (upsertErr) throw upsertErr;
    } catch (e) {
      console.log("Supabase location upsert failed:", e?.message ?? e);
    }
  }, [groupId]);

  const start = useCallback(async () => {
    setError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();
    const ok = status === "granted";
    setPermissionGranted(ok);

    if (!ok) {
      setError("Location permission not granted.");
      return;
    }

    // Get an initial fix immediately so the map can center
    const first = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const firstCoords = {
      latitude: first.coords.latitude,
      longitude: first.coords.longitude,
      accuracy: first.coords.accuracy,
      heading: first.coords.heading,
    };

    setCoords(firstCoords);
    pushToSupabase(firstCoords);

    stop();
    subRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1500,
        distanceInterval: 2,
      },
      (pos) => {
        const updated = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading,
        };
        setCoords(updated);
        pushToSupabase(updated);
      }
    );
  }, [stop, pushToSupabase]);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  // Re-push to Supabase when groupId becomes available (user just joined/created a group)
  useEffect(() => {
    if (groupId && coords) {
      pushToSupabase(coords);
    }
  }, [groupId]);

  return { coords, permissionGranted, error, start, stop };
}