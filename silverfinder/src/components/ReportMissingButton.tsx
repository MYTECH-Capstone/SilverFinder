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

function getAvatarUrl(path: string | null) {
  if (!path) return null;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
interface ElderProfile {
  id: string;
  username: string;
  avatar_url: string | null;
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
        .map((item: any) => ({
          ...item.profiles,
          avatar_url: getAvatarUrl(item?.profiles.avatar_url), // pull full URL,
          assigned_group_id: item.group_id, //Store which group they belong to
        }));

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

  // submit missing person to timeline

  async function submitTimelineEvent(user) {
    const type = "missing";
    const label = "Report Missing";

    const details = `ALERT: ${selectedElder?.username} has been reported missing.\n   >Last seen: ${lastSeenTime || "Unknown"}\n   >Last known location: ${lastSeenLocation || "Unknown"}\n   >Recent Description: ${description || "Unknown"}`;

    const { error } = await supabase.from("timeline_events").insert([
      {
        group_id: selectedElder?.assigned_group_id,
        user_id: user?.id,
        type,
        label,
        details: details || null,
      },
    ]);

    if (error) {
      Alert.alert("Failed to add timeline event", error.message);
    }
  }

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
      submitTimelineEvent(user);

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
      <head>
        <style>
          body { font-family: Arial; margin: 0; padding: 20px; background-color: white; }
          .poster { background-color: white; max-width: 800px; margin: 0 auto; overflow: hidden; }
          p { margin: 0; }
        </style>
      </head>
      <body>
        <div class="poster" style="border: 20px solid #cc0000; margin-bottom: 10px;">
          
          <div style="text-align: center; padding: 40px 20px 20px 20px; ">
            <h1 style="color: #cc0000; font-size: 85px; font-weight: 1000; margin: 0; letter-spacing: 15px; line-height: 1;">MISSING</h1>
          </div>

          <div style="padding: 30px; color: black;">
            
            <div style="display: flex; gap: 20px; margin-bottom: 30px;">
              <img src="${selectedElder.avatar_url}" style="width: 250px; height: 300px; border: 5px solid black; object-fit: cover; border-radius: 4px;" />
              
              <div style="flex: 1;">
                <h2 style="font-size: 42px; font-weight: 900; margin: 0; color: #1a1a1a; border-bottom: 8px solid #cc0000; padding-bottom: 10px; text-transform: uppercase;">
                  ${selectedElder.username}
                </h2>
                <div style="margin-top: 20px; font-size: 19px; line-height: 1.8; color: black">
                  <p><strong>AGE:</strong> ${selectedElder.age || "—"}</p>
                  <p><strong>HEIGHT:</strong> ${selectedElder.height || "—"}</p>
                  <p><strong>WEIGHT:</strong> ${selectedElder.weight || "—"}</p>
                  <p style="color: #cc0000; margin-top: 10px;"><strong>MEDICAL CONDITIONS:</strong> ${selectedElder.conditions || "None Listed"}</p>
                </div>
              </div>
            </div>

            <div style="background-color: white; color: black; margin-bottom: 25px;">
              <p style="letter-spacing: 2px; font-size: 14px; font-weight: 900; color: #cc0000;">LAST SEEN DETAILS</p>
              <p style="font-size: 20px; margin-top: 5px; font-weight: 500;">
                ${lastSeenTime || "Not Specified"} at ${lastSeenLocation || "Location Not Specified"}
              </p>
            </div>

            <div>
              <p style="letter-spacing: 2px; font-size: 14px; font-weight: 900; color: #cc0000; text-transform: uppercase; margin-bottom: 5px; ">Physical Description / Details</p>
              <p style="font-size: 18px; line-height: 1.5; color: #000000; font-weight: 500;">${description || "No specific details provided."}</p>
            </div>

          </div>

          <div style="background-color: white; color: black; text-align: center; padding: 30px; border-top: 2px solid #eee;">
            <p style="letter-spacing: 3px; margin: 0; color: #000000;">IF SEEN, PLEASE IMMEDIATELY CALL</p>
            <h1 style="font-size: 60px; font-weight: 900; margin: 5px 0; letter-spacing: 5px; color: #cc0000;">911</h1>
            <p style="margin: 0; color: #666; font-size: 11px;">Created by: Silver Finder App </p>
          </div>

        </div>
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };
  /* UI RENDERING                 */

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
                    source={{ uri: elder.avatar_url }}
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
  buttonText: {
    color: "#fff",
    textTransform: "uppercase",
    fontWeight: 700,
    width: "100%",
    textAlign: "center",
  },
  modalContainer: { flex: 1, backgroundColor: "#fff8f3" },
  scrollContent: { padding: 25 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, paddingTop: 60 },
  label: { fontWeight: "bold", marginBottom: 10 },
  elderList: { marginBottom: 20 },
  elderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#f0d5be",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    shadowColor: "#ff5f15",
    shadowOffset: { width: 0, height: 2 },
  },
  selectedCard: { borderColor: "#ff5f15", backgroundColor: "#ffdac0" },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#f0d5be",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    color: "#333",
    backgroundColor: "#fff",
  },
  submitBtn: {
    backgroundColor: "#e85d04",
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
