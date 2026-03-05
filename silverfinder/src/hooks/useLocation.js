// Created 11/18/2025 - Rachel Townsend
// Updated 3/4/26: supabase integration

import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";

// TODO: Replace with real group selection when ready
// Set ACTIVE_GROUP_ID to a real value (e.g. from auth context or props) to enable DB writes
// While null, location will still display on-device but will NOT be saved to Supabase
const ACTIVE_GROUP_ID = null;

export function useLocation() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null); // { latitude, longitude, accuracy, heading }
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

  // Fixed: was "pushToSupabasae" (typo) — renamed and actually called below
  const pushToSupabase = useCallback(async (c) => {
    if (!c) return;
    // Location writes require a group_id — skip until group is selected
    if (!ACTIVE_GROUP_ID) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < 2500) return; // max ~every 2.5s
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
          // Requires UNIQUE(group_id, user_id) constraint in DB
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

    // Get an initial fix so the map can center immediately
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
    pushToSupabase(firstCoords); // Fixed: was never called for initial fix

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
        pushToSupabase(updated); // Fixed: was never called in the watch callback
      }
    );
  }, [stop, pushToSupabase]);

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  return { coords, permissionGranted, error, start, stop };
}