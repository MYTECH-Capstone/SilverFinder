import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";

export function useLocation(groupIds = []) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null);

  const subRef = useRef(null);
  const lastSentAtRef = useRef(0);

  const pushToSupabase = useCallback(async (c) => {
    if (!c || !groupIds.length) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < 2500) return;
    lastSentAtRef.current = now;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // ✅ 1. DEDUPE GROUP IDS
    const uniqueGroupIds = [...new Set(groupIds)];

    // ✅ 2. BUILD ROWS
    const rows = uniqueGroupIds.map((groupId) => ({
      user_id: user.id,
      group_id: groupId,
      latitude: c.latitude,
      longitude: c.longitude,
      updated_at: new Date().toISOString(),
    }));

    // ✅ 3. EXTRA SAFETY: DEDUPE ROWS (paranoid but safe)
    const uniqueRows = Object.values(
      Object.fromEntries(
        rows.map((r) => [`${r.user_id}-${r.group_id}`, r])
      )
    );

    if (uniqueRows.length === 0) return;

    const { error } = await supabase
      .from("locations")
      .upsert(uniqueRows, {
        onConflict: "user_id,group_id",
      });

    if (error) {
      console.log("Location upsert error:", error.message);
    }
  }, [groupIds]);

  const start = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    setPermissionGranted(true);

    const pos = await Location.getCurrentPositionAsync({});
    setCoords(pos.coords);
    pushToSupabase(pos.coords);

    subRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced },
      (p) => {
        setCoords(p.coords);
        pushToSupabase(p.coords);
      }
    );
  }, [pushToSupabase]);

  useEffect(() => {
    start();
    return () => subRef.current?.remove();
  }, [start]);

  // 🔥 re-send when groups change
  useEffect(() => {
    if (groupIds.length && coords) {
      pushToSupabase(coords);
    }
  }, [groupIds, coords]);

  return { coords, permissionGranted, start };
}
