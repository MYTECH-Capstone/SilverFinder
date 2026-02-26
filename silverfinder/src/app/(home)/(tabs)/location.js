//Created by Rachel Townsend
//gets location tracking info from Supabase

import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Platform } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { useLocation } from "../../../hooks/useLocation";
import { supabase } from "../../../lib/supabase";
import { useEffect } from "react";


const DEFAULT_REGION = {
  latitude: 32.7767,
  longitude: -96.7970,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const [people, setPeople] = useState([]);

async function fetchPeople(){
  const {data, error} = await supabase
    .from("user_locations")
    .select("*");
  if(!error && data){
    setPeople(data);
  }
}

useEffect(() => {
  fetchPeople();

  const channel = supabase
    .channel("realtime-locations")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "user_locations" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          setPeople((prev) => 
          prev.filter((p) => p.user_id !== payload.old.user_id)
        );
      }else{
        setPeople((prev) => {
          const filtered = prev.filter(
            (p) => p.user_id !== payload.new.user_id
          );
        return [...filtered, payload.new];
        });
      }
    }
    )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
}, []);


  const onSelect = (id) => {
    setSelectedId(id);

    if (!mapRef.current) return;

    if (id === "me" && coords) {
      mapRef.current.animateToRegion(meRegion, 600);
      return;
    }

    const p = people.find((x) => x.user_id === id);
    if (p) mapRef.current.animateToRegion(regionFrom(p.lat, p.lng), 600);
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
            key={p.user_id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            onPress={() => onSelect(p.user_id)}
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
