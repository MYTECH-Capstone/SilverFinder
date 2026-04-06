import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";

function getDistanceMeters(a: any, b: any) {
  const R = 6371000;
  const dLat = (b.latitude - a.latitude) * Math.PI / 180;
  const dLon = (b.longitude - a.longitude) * Math.PI / 180;

  const lat1 = a.latitude * Math.PI / 180;
  const lat2 = b.latitude * Math.PI / 180;

  const x = dLon * Math.cos((lat1 + lat2) / 2);
  const y = dLat;

  return Math.sqrt(x * x + y * y) * R;
}

export function useGeofencing(groupIds: string[], people: any[], user: any) {
  const [geofences, setGeofences] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchGeofences = useCallback(async () => {
    if (!groupIds.length) return;

    const { data, error } = await supabase
      .from("geofences")
      .select("*")
      .in("group_id", groupIds);

    if (error) {
      console.log("fetch error:", error.message);
      return;
    }

    setGeofences(data || []);
  }, [groupIds]);

  useEffect(() => {
    fetchGeofences();
  }, [fetchGeofences]);

  useEffect(() => {
    const channel = supabase
      .channel("geofences-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "geofences" },
        fetchGeofences
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchGeofences]);

  useEffect(() => {
    if (!people.length || !geofences.length) return;

    const newAlerts: any[] = [];

    people.forEach((person) => {
      const fence = geofences.find(
        (g) => g.elderly_user_id === person.id
      );

      if (!fence) return;

      const dist = getDistanceMeters(
        {
          latitude: person.latitude,
          longitude: person.longitude,
        },
        {
          latitude: fence.latitude,
          longitude: fence.longitude,
        }
      );

      if (dist > fence.radius) {
        newAlerts.push({
          userId: person.id,
          name: person.name,
          distance: Math.round(dist),
        });
      }
    });

    setAlerts(newAlerts);
  }, [people, geofences]);

  const saveGeofence = useCallback(
    async (person: any, radius: number) => {
      const { error } = await supabase.from("geofences").upsert(
        {
          elderly_user_id: person.id,
          caretaker_user_id: user.id,
          group_id: person.group_id,
          latitude: person.latitude,
          longitude: person.longitude,
          radius,
        },
        {
          onConflict: "elderly_user_id",
        }
      );

      if (error) {
        console.log("upsert error:", error.message);
      }
    },
    [user]
  );

  return {
    geofences,
    alerts,
    saveGeofence,
  };
}