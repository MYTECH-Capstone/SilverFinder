//Created by Rachel Townsend
//gets location tracking info from Supabase

import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Platform } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useLocation } from "../../../hooks/useLocation";

const DEFAULT_REGION = {
  latitude: 32.7767,
  longitude: -96.7970,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

/*
//test block before Supabase
const MOCK_PEOPLE = [
  { id: "p1", name: "Mom", updatedAtLabel: "Updated 2m ago" },
  { id: "p2", name: "Dad", updatedAtLabel: "Updated 6m ago" },
  { id: "p3", name: "Sister", updatedAtLabel: "Updated 14m ago" }
];

function regionFrom(lat, lon) {
  return { latitude: lat, longitude: lon, latitudeDelta: 0.02, longitudeDelta: 0.02 };
}

export default function LocationScreen() {
  const mapRef = useRef(null);
  const { coords, permissionGranted, error, start } = useLocation();
  const [selectedId, setSelectedId] = useState("me");

  const meRegion = useMemo(() => {
    if (!coords) return DEFAULT_REGION;
    return regionFrom(coords.latitude, coords.longitude);
  }, [coords]);
  */

  /*
  //mock people before connecting to Supabase
  const people = useMemo(() => {
    if (!coords) {
      return MOCK_PEOPLE.map((p, idx) => ({
        ...p,
        latitude: DEFAULT_REGION.latitude + (idx + 1) * 0.0025,
        longitude: DEFAULT_REGION.longitude - (idx + 1) * 0.002,
      }));
    }
    return MOCK_PEOPLE.map((p, idx) => ({
      ...p,
      latitude: coords.latitude + (idx + 1) * 0.0025,
      longitude: coords.longitude - (idx + 1) * 0.002,
    }));
  }, [coords]);
*/

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

  const recenter = () => onSelect(selectedId === "me" ? "me" : selectedId);

  return (
    <View style={styles.container}>
      <MapView
        ref={(r) => (mapRef.current = r)}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={permissionGranted}
        showsMyLocationButton={false}
      >
        {/* accuracy circle */}
        {coords?.accuracy ? (
          <Circle
            center={{ latitude: coords.latitude, longitude: coords.longitude }}
            radius={Math.min(Math.max(coords.accuracy, 10), 120)}
            strokeWidth={1}
          />
        ) : null}

        {people.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            onPress={() => onSelect(p.id)}
          >
            <View style={[styles.personDot, selectedId === p.id && styles.personDotSelected]}>
              <Text style={styles.personDotText}>{p.name[0].toUpperCase()}</Text>
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
                ? "Live tracking enabled"
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

      {/* Bottom “people” drawer */}
      <View style={styles.drawer}>
        <Text style={styles.drawerTitle}>People</Text>

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
                ? `Lat ${coords.latitude.toFixed(5)}, Lon ${coords.longitude.toFixed(5)}`
                : "Waiting for GPS…"}
            </Text>
          </View>
        </Pressable>

        <FlatList
          data={people}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item.id)}
              style={[styles.row, selectedId === item.id && styles.rowSelected]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSub}>{item.updatedAtLabel}</Text>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
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
    backgroundColor: "black",
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
  avatarMe: { backgroundColor: "rgba(0,0,0,0.2)" },
  avatarText: { fontSize: 12, fontWeight: "800" },

  sep: { height: 6 },

  personDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  personDotSelected: { transform: [{ scale: 1.15 }] },
  personDotText: { color: "white", fontWeight: "800", fontSize: 12 },
});
