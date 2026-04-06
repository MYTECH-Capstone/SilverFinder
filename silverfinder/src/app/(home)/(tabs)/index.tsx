import React, {
  useMemo, useRef, useState, useCallback, useEffect
} from "react";
import {
  View, Text, StyleSheet, Pressable,
  FlatList, Animated, TouchableOpacity
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useLocation } from "../../../hooks/useLocation";
import { supabase } from "../../../lib/supabase";

// add geofencing import 
import { useGeofencing } from "../../../hooks/useGeofencing";



const DEFAULT_REGION = {
  latitude: 32.7767,
  longitude: -96.7970,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const DRAWER_COLLAPSED_HEIGHT = 70;
const DRAWER_EXPANDED_HEIGHT = 320;

function regionFrom(lat, lon) {
  return { latitude: lat, longitude: lon, latitudeDelta: 0.02, longitudeDelta: 0.02 };
}

function timeAgoLabel(iso) {
  if (!iso) return "Just now";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function LocationScreen() {
  const mapRef = useRef(null);

  const [groupIds, setGroupIds] = useState([]);
  //const { coords, permissionGranted, start } = useLocation(groupIds[0] || null);
  const { coords, permissionGranted, start } = useLocation(groupIds);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [peopleRows, setPeopleRows] = useState([]);

  const drawerHeight = useRef(new Animated.Value(DRAWER_EXPANDED_HEIGHT)).current;
  const [drawerOpen, setDrawerOpen] = useState(true);

  // ✅ HELPER: attach usernames
  const attachProfiles = async (locations) => {
    if (!locations?.length) return [];

    const userIds = [...new Set(locations.map(l => l.user_id))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", userIds);

    return locations.map((loc) => {
      const profile = profiles?.find(p => p.id === loc.user_id);
      return {
        ...loc,
        username: profile?.username || "User",
      };
    });
  };

  // 🔥 GET USER + GROUPS
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      setGroupIds(data?.map(g => g.group_id) || []);
    };

    init();
  }, []);

  // 🔥 FETCH PEOPLE
  const fetchPeople = useCallback(async () => {
    if (!groupIds.length) return;

    const { data: locations, error } = await supabase
      .from("locations")
      .select("*")
      .in("group_id", groupIds)
      .neq("user_id", currentUserId);

    if (error) {
      console.log("fetch error:", error.message);
      return;
    }

    const merged = await attachProfiles(locations);
    setPeopleRows(merged);
  }, [groupIds, currentUserId]);

  // 🔥 REALTIME (FIXED)
  useEffect(() => {
    if (!groupIds.length) return;

    fetchPeople();

    const channel = supabase
      .channel("locations-multi")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "locations",
        },
        async (payload) => {
          const next = payload.new;
          if (!next) return;

          if (!groupIds.includes(next.group_id)) return;
          if (next.user_id === currentUserId) return;

          // ✅ attach profile BEFORE inserting
          const [withProfile] = await attachProfiles([next]);

          setPeopleRows((prev) => {
            const idx = prev.findIndex(p => p.user_id === next.user_id);
            if (idx === -1) return [withProfile, ...prev];

            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...withProfile }; // preserve data
            return copy;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [groupIds, currentUserId]);

  // 🔥 CLEAN PEOPLE
  const people = useMemo(() => {
    const unique = Object.values(
      Object.fromEntries(peopleRows.map(p => [p.user_id, p]))
    );

    return unique
      .filter(r => r.latitude && r.longitude)
      .map(r => ({
        id: r.user_id,
        latitude: r.latitude,
        longitude: r.longitude,
        updatedAt: timeAgoLabel(r.updated_at),
        name: r.username || "User",
      }));
  }, [peopleRows]);

  // Geofencing hook
  const {geofences} = useGeofencing(groupIds, people, { id: currentUserId });

  // 🔥 CENTER ON FIRST LOAD ONLY
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    if (coords && mapRef.current && !hasCenteredRef.current) {
      mapRef.current.animateToRegion(regionFrom(coords.latitude, coords.longitude), 800);
      hasCenteredRef.current = true;
    }
  }, [coords]);

  const onSelect = (p) => {
    if (!mapRef.current) return;

    mapRef.current.animateToRegion(
      regionFrom(p.latitude, p.longitude),
      600
    );
  };

  const onSelectMe = () => {
    if (!coords || !mapRef.current) return;

    mapRef.current.animateToRegion(
      regionFrom(coords.latitude, coords.longitude),
      600
    );
  };

  const toggleDrawer = () => {
    Animated.spring(drawerHeight, {
      toValue: drawerOpen ? DRAWER_COLLAPSED_HEIGHT : DRAWER_EXPANDED_HEIGHT,
      useNativeDriver: false,
    }).start();
    setDrawerOpen(!drawerOpen);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={(r) => (mapRef.current = r)}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={permissionGranted}
      >
        {coords && (
          <Circle
            center={coords}
            radius={coords.accuracy || 20}
          />
        )}

        {people.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.name}
          />
        ))}
        {/* ✅ GEOFENCE CIRCLES */}
        {geofences.map((g) => (
          <Circle
            key={g.id}
            center={{
              latitude: g.latitude,
              longitude: g.longitude,
            }}
            radius={g.radius}
            strokeWidth={2}
          />
        ))}






      </MapView>

      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.header}>
          <View style={styles.handle} />
          <Text style={styles.title}>People ({people.length + 1})</Text>
        </TouchableOpacity>

        {drawerOpen && (
          <>
            <Pressable style={styles.meRow} onPress={onSelectMe}>
              <Text style={styles.name}>You</Text>
              <Text style={styles.sub}>
                {coords
                  ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`
                  : "Locating..."}
              </Text>
            </Pressable>

            <FlatList
              data={people}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => onSelect(item)}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.sub}>{item.updatedAt}</Text>
                </Pressable>
              )}
            />
          </>
        )}
      </Animated.View>

      {!permissionGranted && (
        <Pressable onPress={start}>
          <Text>Enable Location</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    alignItems: "center",
    padding: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    marginBottom: 6,
  },
  title: {
    fontWeight: "700",
  },
  row: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  meRow: {
    padding: 14,
    backgroundColor: "#f5f5f5",
  },
  name: {
    fontWeight: "600",
  },
  sub: {
    fontSize: 12,
    color: "#666",
  },
});
/*
// Rachels index file
import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Animated,
  TouchableOpacity,
  Image,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useLocation } from "../../../hooks/useLocation";
import { supabase } from "../../../lib/supabase";

const DEFAULT_REGION = {
  latitude: 32.7767,
  longitude: -96.7970,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const DRAWER_COLLAPSED_HEIGHT = 70;
const DRAWER_EXPANDED_HEIGHT = 320;

function regionFrom(lat, lon) {
  return {
    latitude: lat,
    longitude: lon,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };
}

function timeAgoLabel(iso) {
  if (!iso) return "Just now";
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function LocationScreen() {
  const mapRef = useRef(null);

  const [groupIds, setGroupIds] = useState([]);
  const { coords, permissionGranted, start } = useLocation(groupIds);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [peopleRows, setPeopleRows] = useState([]);

  const drawerHeight = useRef(
    new Animated.Value(DRAWER_EXPANDED_HEIGHT)
  ).current;
  const [drawerOpen, setDrawerOpen] = useState(true);

  const attachProfiles = async (locations) => {
    if (!locations?.length) return [];

    const userIds = [...new Set(locations.map((l) => l.user_id))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", userIds);

    return locations.map((loc) => {
      const profile = profiles?.find((p) => p.id === loc.user_id);
      let avatarUrl = null;

      if (profile?.avatar_url) {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(profile.avatar_url);

        avatarUrl = data?.publicUrl || null;
      }

      return {
        ...loc,
        username: profile?.username || "User",
        avatar: avatarUrl,
      };
    });
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setCurrentUserId(user.id);

      const { data } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      setGroupIds(data?.map((g) => g.group_id) || []);
    };

    init();
  }, []);

  const fetchPeople = useCallback(async () => {
    if (!groupIds.length) return;

    const { data: locations, error } = await supabase
      .from("locations")
      .select("*")
      .in("group_id", groupIds)
      .neq("user_id", currentUserId);

    if (error) {
      console.log("fetch error:", error.message);
      return;
    }

    const merged = await attachProfiles(locations);
    setPeopleRows(merged);
  }, [groupIds, currentUserId]);

  useEffect(() => {
    if (!groupIds.length) return;

    fetchPeople();

    const channel = supabase
      .channel("locations-multi")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "locations",
        },
        async (payload) => {
          const next = payload.new;
          if (!next) return;

          if (!groupIds.includes(next.group_id)) return;
          if (next.user_id === currentUserId) return;

          const [withProfile] = await attachProfiles([next]);

          setPeopleRows((prev) => {
            const idx = prev.findIndex((p) => p.user_id === next.user_id);
            if (idx === -1) return [withProfile, ...prev];

            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...withProfile };
            return copy;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [groupIds, currentUserId, fetchPeople]);

  const people = useMemo(() => {
    const unique = Object.values(
      Object.fromEntries(peopleRows.map((p) => [p.user_id, p]))
    );

    return unique
      .filter((r) => r.latitude && r.longitude)
      .map((r) => ({
        id: r.user_id,
        latitude: r.latitude,
        longitude: r.longitude,
        updatedAt: timeAgoLabel(r.updated_at),
        name: r.username || "User",
        avatar: r.avatar || null,
      }));
  }, [peopleRows]);

  const hasCenteredRef = useRef(false);

  useEffect(() => {
    if (coords && mapRef.current && !hasCenteredRef.current) {
      mapRef.current.animateToRegion(
        regionFrom(coords.latitude, coords.longitude),
        800
      );
      hasCenteredRef.current = true;
    }
  }, [coords]);

  const onSelect = (p) => {
    if (!mapRef.current) return;

    mapRef.current.animateToRegion(
      regionFrom(p.latitude, p.longitude),
      600
    );
  };

  const onSelectMe = () => {
    if (!coords || !mapRef.current) return;

    mapRef.current.animateToRegion(
      regionFrom(coords.latitude, coords.longitude),
      600
    );
  };

  const toggleDrawer = () => {
    Animated.spring(drawerHeight, {
      toValue: drawerOpen
        ? DRAWER_COLLAPSED_HEIGHT
        : DRAWER_EXPANDED_HEIGHT,
      useNativeDriver: false,
    }).start();
    setDrawerOpen(!drawerOpen);
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={(r) => (mapRef.current = r)}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={permissionGranted}
      >
        {coords && (
          <Circle
            center={{
              latitude: coords.latitude,
              longitude: coords.longitude,
            }}
            radius={coords.accuracy || 20}
          />
        )}

        {people.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            tracksViewChanges={false}
          >
            {p.avatar ? (
              <Image
                source={{ uri: p.avatar }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {p.name?.[0]?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </Marker>
        ))}
      </MapView>

      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.header}>
          <View style={styles.handle} />
          <Text style={styles.title}>People ({people.length + 1})</Text>
        </TouchableOpacity>

        {drawerOpen && (
          <>
            <Pressable style={styles.meRow} onPress={onSelectMe}>
              <Text style={styles.name}>You</Text>
              <Text style={styles.sub}>
                {coords
                  ? `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(
                      4
                    )}`
                  : "Locating..."}
              </Text>
            </Pressable>

            <FlatList
              data={people}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => onSelect(item)}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.sub}>{item.updatedAt}</Text>
                </Pressable>
              )}
            />
          </>
        )}
      </Animated.View>

      {!permissionGranted && (
        <Pressable onPress={start}>
          <Text>Enable Location</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    alignItems: "center",
    padding: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    marginBottom: 6,
  },
  title: {
    fontWeight: "700",
  },
  row: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  meRow: {
    padding: 14,
    backgroundColor: "#f5f5f5",
  },
  name: {
    fontWeight: "600",
  },
  sub: {
    fontSize: 12,
    color: "#666",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "white",
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  avatarText: {
    color: "white",
    fontWeight: "700",
  },
});
*/