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
// prev working march 23 8:36 pm
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

  const [groupId, setGroupId] = useState(null);
  const { coords, permissionGranted, error, start } = useLocation(groupId);

  const [selectedId, setSelectedId] = useState("me");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [peopleRows, setPeopleRows] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const drawerHeight = useRef(new Animated.Value(DRAWER_EXPANDED_HEIGHT)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastShownForCoords = useRef(false);

  // ✅ FETCH USER + GROUP
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);

      const { data } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .limit(1);

      if (data && data.length > 0) {
        console.log("GroupId:", data[0].group_id);
        setGroupId(data[0].group_id);
      }
    };

    init();
  }, []);

  // ✅ TOAST
  useEffect(() => {
    if (coords && !toastShownForCoords.current) {
      toastShownForCoords.current = true;

      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }, 3000);
    }
  }, [coords]);

  // ✅ FETCH PEOPLE
  const fetchPeople = useCallback(async () => {
    if (!groupId) return;

    const { data, error } = await supabase
      .from("locations")
      .select(`
        user_id,
        group_id,
        latitude,
        longitude,
        updated_at,
        profiles(username)
      `)
      .eq("group_id", groupId);

    if (error) {
      console.log("fetchPeople error:", error.message);
      return;
    }

    if (data) setPeopleRows(data);
  }, [groupId]);

  // ✅ REALTIME
  useEffect(() => {
    if (!groupId) return;

    fetchPeople();

    const channel = supabase
      .channel(`locations-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "locations",
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          const next = payload.new;
          if (!next) return;

          setPeopleRows((prev) => {
            const idx = prev.findIndex((p) => p.user_id === next.user_id);
            if (idx === -1) return [next, ...prev];
            const copy = [...prev];
            copy[idx] = next;
            return copy;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [groupId]);

  const people = useMemo(() => {
    return (peopleRows || [])
      .filter((r) => r.latitude && r.longitude)
      .map((r) => ({
        id: r.user_id,
        latitude: r.latitude,
        longitude: r.longitude,
        updatedAtLabel: timeAgoLabel(r.updated_at),
        name: r.profiles?.username ?? "User",
      }));
  }, [peopleRows]);

  const meRegion = useMemo(() => {
    if (!coords) return DEFAULT_REGION;
    return regionFrom(coords.latitude, coords.longitude);
  }, [coords]);

  // ✅ AUTO CENTER ON SELF
  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(meRegion, 800);
    }
  }, [coords]);

  const onSelect = (id) => {
    setSelectedId(id);

    if (!mapRef.current) return;

    if (id === "me" && coords) {
      mapRef.current.animateToRegion(meRegion, 600);
      return;
    }

    const p = people.find((x) => x.id === id);
    if (p) {
      mapRef.current.animateToRegion(regionFrom(p.latitude, p.longitude), 600);
    }
  };

  const toggleDrawer = () => {
    const toValue = drawerOpen ? DRAWER_COLLAPSED_HEIGHT : DRAWER_EXPANDED_HEIGHT;

    Animated.spring(drawerHeight, {
      toValue,
      useNativeDriver: false,
    }).start();

    setDrawerOpen(!drawerOpen);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={(r) => (mapRef.current = r)}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={permissionGranted}
      >
        {coords?.accuracy && (
          <Circle
            center={{ latitude: coords.latitude, longitude: coords.longitude }}
            radius={coords.accuracy}
          />
        )}

        {people.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            onPress={() => onSelect(p.id)}
          />
        ))}
      </MapView>

      
      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
        <TouchableOpacity onPress={toggleDrawer} style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>People ({people.length + 1})</Text>
        </TouchableOpacity>

        {drawerOpen && (
          <>
            <Pressable onPress={() => onSelect("me")} style={styles.row}>
              <Text>You</Text>
            </Pressable>

            <FlatList
              data={people}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <Pressable onPress={() => onSelect(item.id)} style={styles.row}>
                  <Text>{item.name}</Text>
                  <Text>{item.updatedAtLabel}</Text>
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
  container: { flex: 1 },
  drawer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
  },
  drawerHeader: {
    padding: 10,
  },
  drawerTitle: {
    fontWeight: "bold",
  },
  row: {
    padding: 10,
  },
});
*/
