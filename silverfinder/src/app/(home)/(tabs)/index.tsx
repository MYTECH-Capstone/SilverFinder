// Created by Rachel Townsend
// Updated: fading status toast (3s), collapsible scrollable people drawer

import React, {
  useMemo, useRef, useState, useCallback, useEffect
} from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Platform, Animated, TouchableOpacity } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useLocation } from "../../../hooks/useLocation";
import { supabase } from "../../../lib/supabase";

const DEFAULT_REGION = {
  latitude: 32.7767,
  longitude: -96.7970,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

// TODO: Replace with real group selection when ready — must match useLocation.js
const ACTIVE_GROUP_ID = null;

// Drawer snap heights: collapsed shows just the handle + title, expanded shows people list
const DRAWER_COLLAPSED_HEIGHT = 56;
const DRAWER_EXPANDED_HEIGHT = 320;

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
  const [peopleRows, setPeopleRows] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Animated values
  const drawerHeight = useRef(new Animated.Value(DRAWER_EXPANDED_HEIGHT)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastShownForCoords = useRef(false);
  const toastTimer = useRef(null);

  // Show toast when we first get coords, then fade out after 3s
  useEffect(() => {
    if (coords && !toastShownForCoords.current) {
      toastShownForCoords.current = true;

      // Fade in
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Fade out after 3s
      toastTimer.current = setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 3000);
    }

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [coords]);

  // Animate drawer open/close
  const toggleDrawer = () => {
    const toValue = drawerOpen ? DRAWER_COLLAPSED_HEIGHT : DRAWER_EXPANDED_HEIGHT;
    Animated.spring(drawerHeight, {
      toValue,
      useNativeDriver: false,
      bounciness: 4,
    }).start();
    setDrawerOpen((prev) => !prev);
  };

  // Get logged-in user's ID to exclude self from people list
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
      // TODO: once profiles table exists:
      // .select("user_id, group_id, latitude, longitude, updated_at, profiles(display_name)")

    if (ACTIVE_GROUP_ID) q = q.eq("group_id", ACTIVE_GROUP_ID);
    if (currentUserId) q = q.neq("user_id", currentUserId);

    const { data, error: qErr } = await q;
    if (!qErr && data) setPeopleRows(data);
    if (qErr) console.log("fetchPeople error:", qErr.message);
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    fetchPeople();

    const channel = supabase
      .channel(`realtime:locations:${ACTIVE_GROUP_ID ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "locations" },
        (payload) => {
          const next = payload.new;
          const old = payload.old;

          if (ACTIVE_GROUP_ID) {
            if (next?.group_id !== ACTIVE_GROUP_ID && old?.group_id !== ACTIVE_GROUP_ID) return;
          }

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

    return () => supabase.removeChannel(channel);
  }, [fetchPeople, currentUserId]);

  const people = useMemo(() => {
    return (peopleRows || [])
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        id: r.user_id,
        group_id: r.group_id,
        latitude: r.latitude,
        longitude: r.longitude,
        updatedAtLabel: timeAgoLabel(r.updated_at),
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
      {/* Full-screen map */}
      <MapView
        ref={(r) => (mapRef.current = r)}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={false}
      >
        {coords?.accuracy ? (
          <Circle
            center={{ latitude: coords.latitude, longitude: coords.longitude }}
            radius={Math.min(Math.max(coords.accuracy, 10), 120)}
            strokeWidth={1}
            strokeColor="rgba(66, 133, 244, 0.4)"
            fillColor="rgba(66, 133, 244, 0.1)"
          />
        ) : null}

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

      {/* Fading status toast — appears on first GPS fix, fades after 3s */}
      <Animated.View style={[styles.toast, { opacity: toastOpacity }]} pointerEvents="none">
        <View style={styles.toastDot} />
        <Text style={styles.toastText}>
          {error
            ? error
            : permissionGranted
              ? coords
                ? `Live tracking enabled · ${people.length} other${people.length !== 1 ? "s" : ""} visible`
                : "Getting location…"
              : "Permission needed"}
        </Text>
      </Animated.View>

      {/* Enable location button — only shown if permission not granted */}
      {!permissionGranted && (
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Location Access Needed</Text>
          <Text style={styles.permissionSub}>
            Enable location so your home group can see where you are.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={start}>
            <Text style={styles.primaryBtnText}>Enable Location</Text>
          </Pressable>
        </View>
      )}

      {/* Recenter button — moves up when drawer is collapsed */}
      <Animated.View
        style={[
          styles.recenterBtnWrap,
          {
            bottom: Animated.add(drawerHeight, new Animated.Value(12)),
          },
        ]}
      >
        <Pressable style={styles.recenterBtn} onPress={recenter}>
          <Text style={styles.recenterBtnText}>◎</Text>
        </Pressable>
      </Animated.View>

      {/* Collapsible people drawer */}
      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>

        {/* Drag handle / header — always visible, tapping toggles drawer */}
        <TouchableOpacity
          onPress={toggleDrawer}
          style={styles.drawerHeader}
          activeOpacity={0.7}
        >
          <View style={styles.drawerHandle} />
          <Text style={styles.drawerTitle}>
            People {people.length > 0 ? `(${people.length + 1})` : ""}
          </Text>
          <Text style={styles.drawerChevron}>{drawerOpen ? "▾" : "▴"}</Text>
        </TouchableOpacity>

        {/* Scrollable content — only rendered when open to avoid layout flicker */}
        {drawerOpen && (
          <>
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

            {/* Group members — scrollable */}
            <FlatList
              data={people}
              keyExtractor={(i) => `${i.group_id ?? "nogroup"}:${i.id}`}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
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
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Fading toast replaces the old always-visible top bar
  toast: {
    position: "absolute",
    top: Platform.select({ ios: 60, android: 30, default: 20 }),
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  toastDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginRight: 8,
  },
  toastText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },

  permissionCard: {
    position: "absolute",
    top: Platform.select({ ios: 60, android: 30, default: 20 }),
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  permissionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  permissionSub: { fontSize: 13, color: "#666", marginBottom: 12 },

  primaryBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
  },
  primaryBtnText: { color: "white", fontWeight: "700" },

  recenterBtnWrap: {
    position: "absolute",
    right: 16,
  },
  recenterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recenterBtnText: { fontSize: 22 },

  // Drawer
  drawer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
  },
  drawerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  drawerTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  drawerChevron: {
    fontSize: 16,
    color: "#999",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginHorizontal: 4,
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
    paddingHorizontal: 14,
  },
});
