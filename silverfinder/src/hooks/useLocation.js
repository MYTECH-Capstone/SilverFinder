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
/*
// working 12:21
import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";

// 🔥 NOW TAKES groupIds ARRAY
export function useLocation(groupIds = []) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null);

  const subRef = useRef(null);
  const lastSentAtRef = useRef(0);

  // 🔥 PUSH TO ALL GROUPS
  const pushToSupabase = useCallback(async (c) => {
    if (!c || !groupIds.length) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < 2500) return;
    lastSentAtRef.current = now;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 🔥 INSERT ONE ROW PER GROUP
    const rows = groupIds.map((groupId) => ({
      user_id: user.id,
      group_id: groupId,
      latitude: c.latitude,
      longitude: c.longitude,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("locations")
      .upsert(rows, { onConflict: "user_id,group_id" });

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

  // 🔥 RE-PUSH when groupIds change
  useEffect(() => {
    if (groupIds.length && coords) {
      pushToSupabase(coords);
    }
  }, [groupIds, coords]);

  return { coords, permissionGranted, start };
}
// working mar 31
/*import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";

export function useLocation(groupId = null) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null);

  const subRef = useRef(null);
  const lastSentAtRef = useRef(0);

  const pushToSupabase = useCallback(async (c) => {
    if (!c || !groupId) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < 2500) return;
    lastSentAtRef.current = now;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("locations").upsert(
      {
        user_id: user.id,
        group_id: groupId,
        latitude: c.latitude,
        longitude: c.longitude,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,group_id" }
    );

    if (error) {
      console.log("Location upsert error:", error.message);
    }
  }, [groupId]);

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

  useEffect(() => {
    if (groupId && coords) {
      pushToSupabase(coords);
    }
  }, [groupId, coords]);

  return { coords, permissionGranted, start };
}
/*
// prev working march 23 8:36 pm
import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";
import { supabase } from "../lib/supabase";

export function useLocation(groupId = null) {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [coords, setCoords] = useState(null);

  const subRef = useRef(null);
  const lastSentAtRef = useRef(0);

  const pushToSupabase = useCallback(async (c) => {
    if (!c || !groupId) return;

    const now = Date.now();
    if (now - lastSentAtRef.current < 2500) return;
    lastSentAtRef.current = now;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("locations").upsert(
      {
        user_id: user.id,
        group_id: groupId,
        latitude: c.latitude,
        longitude: c.longitude,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,group_id" }
    );
  }, [groupId]);

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

  // 🔥 CRITICAL FIX
  useEffect(() => {
    if (groupId && coords) {
      pushToSupabase(coords);
    }
  }, [groupId, coords]);

  return { coords, permissionGranted, start };
}

*/