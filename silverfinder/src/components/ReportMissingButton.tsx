import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { supabase } from "../lib/supabase";

// TYPES

interface ElderProfile {
  id: string;
  username: string;
  avatar_url: string;
  age: number;
  height: string;
  weight: string;
  blood_type: string;
  conditions: string;
  role: string;
  assigned_group_id: string; //
}

export default function ReportMissingButton() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elders, setElders] = useState<ElderProfile[]>([]);
  const [selectedElder, setSelectedElder] = useState<ElderProfile | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);

  //Form State
  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [description, setDescription] = useState("");
  const [lastSeenTime, setLastSeenTime] = useState("");

  useEffect(() => {
    if (visible) loadInitialData();
  }, [visible]);

  //DATA FETCHING

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get all groups this user belongs to
      const { data: memberships, error: groupErr } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (groupErr) throw groupErr;

      if (!memberships || memberships.length === 0) {
        Alert.alert(
          "No Groups",
          "You aren't assigned to any family groups yet.",
        );
        return;
      }

      // Extract just the IDs into an array
      const groupIds = memberships.map((m) => m.group_id);

      //Fetch all elders belonging to any of those group IDs
      const { data: memberList, error: elderErr } = await supabase
        .from("group_members")
        .select(
          `
        group_id,
        profiles:user_id (
          id, username, avatar_url, age, height, weight, conditions, role
        )
      `,
        )
        .in("group_id", groupIds);
      if (elderErr) throw elderErr;
      console.log("RAW MEMBER LIST:", JSON.stringify(memberList, null, 2));

      //Filter for elders and attach their group context
      const elderProfiles = memberList
        ?.filter((item: any) => {
          const role = item.profiles?.role?.toLowerCase().trim();
          console.log(
            `Checking User: ${item.profiles?.username}, Role: ${role}`,
          );
          return role === "elderly";
        })
        .map((item: any) => {
          // 1. Get the raw JPEG name from the database
          const rawAvatar = item.profiles?.avatar_url;

          // 2. Build the full Supabase URL
          // (Make sure "avatars" matches your actual Supabase storage bucket name!)
          const fullAvatarUrl = rawAvatar
            ? supabase.storage.from("avatars").getPublicUrl(rawAvatar).data
                .publicUrl
            : null;

          return {
            ...item.profiles,
            avatar_url: fullAvatarUrl, // Replace the JPEG name with the full HTTPS link
            assigned_group_id: item.group_id, //Store which group they belong to
          };
        });

      setElders(elderProfiles || []);

      if (elderProfiles?.length === 0) {
        Alert.alert(
          "No Elders Found",
          "You are in groups, but none of them have members marked as 'elderly'.",
        );
      }
    } catch (err: any) {
      Alert.alert("Load Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    if (!selectedElder) {
      Alert.alert("Error", "Please select an elder.");
      return;
    }

    setLoading(true);
    try {
      const { data: loc } = await supabase
        .from("locations")
        .select("latitude, longitude")
        .eq("user_id", selectedElder.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: reportErr } = await supabase
        .from("missing_reports")
        .insert([
          {
            reported_user_id: selectedElder.id,
            reporter_id: user?.id,
            group_id: selectedElder.assigned_group_id, //
            last_seen_time: lastSeenTime,
            last_seen_place: lastSeenLocation,
            description: description,
            captured_lat: loc?.latitude || null,
            captured_long: loc?.longitude || null,
            status: "active",
          },
        ]);

      if (reportErr) throw reportErr;

      Alert.alert("Success", `Report filed for ${selectedElder.username}`);
      setVisible(false);
    } catch (err: any) {
      Alert.alert("Submission Failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  //GENERATE POSTER

  const exportToPDF = async () => {
    if (!selectedElder) return;

    const html = `
      <html>
        <body style="font-family: Arial; text-align:center; padding:40px; border: 20px solid #b00020;">
          <h1 style="color:#b00020; font-size: 50px; margin-bottom:0;">MISSING</h1>
          <h2 style="font-size: 30px;">${selectedElder.username}</h2>
          <img src="${selectedElder.avatar_url || `https://ui-avatars.com/api/?name=${selectedElder.username}&size=300&background=b00020&color=fff`}" style="width:300px; height:300px; border-radius:10px; border: 5px solid black; object-fit: cover;" />
          
          <div style="margin: 20px 0; font-size: 20px;">
            <p><strong>Age:</strong> ${selectedElder.age || "N/A"} | <strong>Height:</strong> ${selectedElder.height || "N/A"}</p>
            <p><strong>Medical:</strong> ${selectedElder.conditions || "None listed"}</p>
          </div>

          <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; text-align: left;">
            <p><strong>Last Seen:</strong> ${lastSeenTime} at ${lastSeenLocation}</p>
            <p><strong>Description:</strong> ${description}</p>
          </div>
          <h3 style="color: #b00020; margin-top: 30px;">PLEASE CONTACT AUTHORITIES IMMEDIATELY</h3>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  // UI RENDERING

  return (
    <>
      <Pressable style={styles.button} onPress={() => setVisible(true)}>
        <Text style={styles.buttonText}>Report Missing Elder</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>New Missing Report</Text>

            {loading && <ActivityIndicator color="#b00020" />}

            <Text style={styles.label}>Select Elder:</Text>
            <View style={styles.elderList}>
              {elders.map((elder) => (
                <Pressable
                  key={elder.id}
                  style={[
                    styles.elderCard,
                    selectedElder?.id === elder.id && styles.selectedCard,
                  ]}
                  onPress={() => setSelectedElder(elder)}
                >
                  <Image
                    source={{
                      uri: elder.avatar_url
                        ? elder.avatar_url
                        : `https://ui-avatars.com/api/?name=${encodeURIComponent(elder.username)}&background=b00020&color=fff`,
                    }}
                    style={styles.avatar}
                  />
                  <Text>{elder.username}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              placeholder="Last Seen Time (e.g. 2:00 PM)"
              placeholderTextColor="#999"
              value={lastSeenTime}
              onChangeText={setLastSeenTime}
              style={styles.input}
            />
            <TextInput
              placeholder="Last Seen Location"
              placeholderTextColor="#999"
              value={lastSeenLocation}
              onChangeText={setLastSeenLocation}
              style={styles.input}
            />
            <TextInput
              placeholder="Description (Clothing, direction of travel...)"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { height: 80 }]}
              multiline
            />

            <Pressable style={styles.submitBtn} onPress={submitReport}>
              <Text style={styles.submitText}>Submit & Notify Group</Text>
            </Pressable>

            <Pressable style={styles.exportBtn} onPress={exportToPDF}>
              <Text style={styles.submitText}>Generate Poster (PDF)</Text>
            </Pressable>

            <Pressable
              onPress={() => setVisible(false)}
              style={styles.closeBtn}
            >
              <Text>Cancel</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#b00020",
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 25 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  label: { fontWeight: "bold", marginBottom: 10 },
  elderList: { marginBottom: 20 },
  elderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCard: { borderColor: "#b00020", backgroundColor: "#fff5f5" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    color: "#333",
    backgroundColor: "#fff",
  },
  submitBtn: {
    backgroundColor: "#b00020",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  exportBtn: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  submitText: { color: "#fff", fontWeight: "bold" },
  closeBtn: { alignItems: "center", marginTop: 10 },
});
