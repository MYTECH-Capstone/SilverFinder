// Created by Rachel Townsend
// Updated: this is the Tab 2 location screen — replaces Map.js
// Pulls live locations from Supabase
// Note: name display from profiles table is wired up (see "Do Thurs" note below)

import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Platform } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useLocation } from "../../../hooks/useLocation";
import { supabase } from "../../../lib/supabase";

const DEFAULT_REGION = {
  latitude: 32.7767,
  longitude: -96.7970,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

// TODO: Replace with real group selection
// Must match ACTIVE_GROUP_ID in useLocation.js — keep them in sync
const ACTIVE_GROUP_ID = null;

function regionFrom(lat, lon) {
  return { latitude: lat, longitude: lon, latitudeDelta: 0.02, longitudeDelta: 0.02 };
}

function timeAgoLabel(iso) {
  if (!iso) return "Updated just now";
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.floor(ms / 1000));
  if (s < 60) return `Updated ${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `Updated ${m}m ago`;
  const h = Math.floor(m / 60);
  return `Updated ${h}h ago`;
}

export default function LocationScreen() {
  const mapRef = useRef(null);

  const { coords, permissionGranted, error, start } = useLocation();

  const [selectedId, setSelectedId] = useState("me");
  const [currentUserId, setCurrentUserId] = useState(null);

  // Rows from Supabase locations table
  // Expected columns: user_id, group_id, latitude, longitude, updated_at
  // Joined: profiles(display_name)  <-- add this join once profiles table is ready
  const [peopleRows, setPeopleRows] = useState([]);

  // Get logged-in user's ID so we can exclude ourselves from the "people" list
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getUser();
  }, []);

  const meRegion = useMemo(() => {
    if (!coords) return DEFAULT_REGION;
    return regionFrom(coords.latitude, coords.longitude);
  }, [coords]);

  const fetchPeople = useCallback(async () => {
    let q = supabase
      .from("locations")
      .select("user_id, group_id, latitude, longitude, updated_at");
      // TODO: once profiles table exists, change select to:
      // .select("user_id, group_id, latitude, longitude, updated_at, profiles(display_name)")

    if (ACTIVE_GROUP_ID) q = q.eq("group_id", ACTIVE_GROUP_ID);

    // Exclude own row from the people list — we render ourselves separately as "Me"
    if (currentUserId) q = q.neq("user_id", currentUserId);

    const { data, error: qErr } = await q;
    if (!qErr && data) setPeopleRows(data);
    if (qErr) console.log("fetchPeople error:", qErr.message);
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return; // wait until we know who we are
    fetchPeople();

    // Real-time subscription for group location updates
    const channel = supabase
      .channel(`realtime:locations:${ACTIVE_GROUP_ID ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "locations" },
        (payload) => {
          const next = payload.new;
          const old = payload.old;

          // Client-side group filter
          if (ACTIVE_GROUP_ID) {
            const gNew = next?.group_id;
            const gOld = old?.group_id;
            if (gNew !== ACTIVE_GROUP_ID && gOld !== ACTIVE_GROUP_ID) return;
          }

          // Don't add ourselves to the people list via realtime either
          if (next?.user_id === currentUserId) return;

          if (payload.eventType === "DELETE") {
            setPeopleRows((prev) => prev.filter((p) => p.user_id !== old.user_id));
            return;
          }

          if (!next) return;

          setPeopleRows((prev) => {
            const idx = prev.findIndex(
              (p) => p.user_id === next.user_id && p.group_id === next.group_id
            );
            if (idx === -1) return [next, ...prev];
            const copy = prev.slice();
            copy[idx] = next;
            return copy;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPeople, currentUserId]);

  // Convert DB rows into display-friendly "people"
  const people = useMemo(() => {
    return (peopleRows || [])
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        id: r.user_id,
        group_id: r.group_id,
        latitude: r.latitude,
        longitude: r.longitude,
        updatedAtLabel: timeAgoLabel(r.updated_at),
        // TODO: swap "User" for r.profiles?.display_name once profiles join is added
        name: r.profiles?.display_name ?? "User",
      }));
  }, [peopleRows]);

  const onSelect = (id) => {
    setSelectedId(id);
    if (!mapRef.current) return;

    if (id === "me" && coords) {
      mapRef.current.animateToRegion(meRegion, 600);
      return;
    }

    const p = people.find((x) => x.id === id);
    if (p) mapRef.current.animateToRegion(regionFrom(p.latitude, p.longitude), 600);
  };

  const recenter = () => onSelect(selectedId);

  return (
    <View style={styles.container}>
      <MapView
        ref={(r) => (mapRef.current = r)}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={false}
      >
        {/* Accuracy circle for own location */}
        {coords?.accuracy ? (
          <Circle
            center={{ latitude: coords.latitude, longitude: coords.longitude }}
            radius={Math.min(Math.max(coords.accuracy, 10), 120)}
            strokeWidth={1}
            strokeColor="rgba(66, 133, 244, 0.4)"
            fillColor="rgba(66, 133, 244, 0.1)"
          />
        ) : null}

        {/* Group members' markers from Supabase */}
        {people.map((p) => (
          <Marker
            key={`${p.group_id ?? "nogroup"}:${p.id}`}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            onPress={() => onSelect(p.id)}
          >
            <View style={[styles.personDot, selectedId === p.id && styles.personDotSelected]}>
              <Text style={styles.personDotText}>
                {(p.name?.[0] ?? "U").toUpperCase()}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Top status card */}
      <View style={styles.topBar}>
        <Text style={styles.title}>Location</Text>
        <Text style={styles.subtitle}>
          {error
            ? error
            : permissionGranted
              ? coords
                ? `Live tracking enabled · ${people.length} other${people.length !== 1 ? "s" : ""} visible`
                : "Getting location…"
              : "Permission needed"}
        </Text>

        {!permissionGranted && (
          <Pressable style={styles.primaryBtn} onPress={start}>
            <Text style={styles.primaryBtnText}>Enable Location</Text>
          </Pressable>
        )}
      </View>

      {/* Recenter button */}
      <Pressable style={styles.recenterBtn} onPress={recenter}>
        <Text style={styles.recenterBtnText}>◎</Text>
      </Pressable>

      {/* Bottom people drawer */}
      <View style={styles.drawer}>
        <Text style={styles.drawerTitle}>People</Text>

        {/* Own row */}
        <Pressable
          onPress={() => onSelect("me")}
          style={[styles.row, selectedId === "me" && styles.rowSelected]}
        >
          <View style={[styles.avatar, styles.avatarMe]}>
            <Text style={styles.avatarText}>ME</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>You</Text>
            <Text style={styles.rowSub}>
              {coords
                ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                : "Waiting for GPS…"}
            </Text>
          </View>
        </Pressable>

        {/* Group members */}
        <FlatList
          data={people}
          keyExtractor={(i) => `${i.group_id ?? "nogroup"}:${i.id}`}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item.id)}
              style={[styles.row, selectedId === item.id && styles.rowSelected]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.name?.[0] ?? "U").toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSub}>{item.updatedAtLabel}</Text>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {ACTIVE_GROUP_ID ? "No other members online" : "No group selected yet"}
            </Text>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    position: "absolute",
    top: Platform.select({ ios: 60, android: 30, default: 20 }),
    left: 16,
    right: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { marginTop: 2, fontSize: 12, opacity: 0.75 },

  primaryBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
  },
  primaryBtnText: { color: "white", fontWeight: "700" },

  recenterBtn: {
    position: "absolute",
    right: 16,
    top: Platform.select({ ios: 160, android: 140, default: 140 }),
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  recenterBtnText: { fontSize: 22 },

  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 320,
    paddingTop: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  drawerTitle: { fontSize: 14, fontWeight: "700", marginBottom: 10 },

  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
  },
  rowSelected: { backgroundColor: "rgba(0,0,0,0.06)" },
  rowTitle: { fontSize: 14, fontWeight: "600" },
  rowSub: { fontSize: 12, opacity: 0.7, marginTop: 2 },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarMe: { backgroundColor: "#4CAF50" },
  avatarText: { fontSize: 12, fontWeight: "800", color: "white" },

  sep: { height: 6 },

  personDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  personDotSelected: { transform: [{ scale: 1.15 }] },
  personDotText: { color: "white", fontWeight: "800", fontSize: 12 },

  emptyText: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
});