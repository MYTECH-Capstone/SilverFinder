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

/* ============================= */
/* TYPES                         */
/* ============================= */

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

interface ElderWithProfile {
  id: string;
  profiles: Profile[]; // Supabase returns relation as array
}

/* ============================= */
/* COMPONENT                     */
/* ============================= */

export default function ReportMissingButton() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [elders, setElders] = useState<ElderWithProfile[]>([]);
  const [selectedElder, setSelectedElder] =
    useState<ElderWithProfile | null>(null);

  const [lastSeenLocation, setLastSeenLocation] = useState("");
  const [description, setDescription] = useState("");
  const [lastSeenTime, setLastSeenTime] = useState("");

  /* ============================= */
  /* FETCH ELDERS                 */
  /* ============================= */

  useEffect(() => {
    if (visible) fetchElders();
  }, [visible]);

  const fetchElders = async () => {
    const { data, error } = await supabase
      .from("elders")
      .select(
        `
        id,
        profiles (
          id,
          full_name,
          avatar_url,
          role
        )
      `
      );

    if (error) {
      console.error(error);
      Alert.alert("Error loading elders");
      return;
    }

    setElders((data as ElderWithProfile[]) || []);
  };

  /* ============================= */
  /* DEV MOCK PROFILE (OPTION 1)  */
  /* ============================= */

  const profile: Profile =
    selectedElder?.profiles?.[0] ?? {
      id: "mock-id",
      full_name: "John Doe",
      avatar_url: "https://i.pravatar.cc/300",
      role: "elder",
    };

  /* ============================= */
  /* SUBMIT REPORT                */
  /* ============================= */

  const submitReport = async () => {
    if (!selectedElder?.profiles?.[0]) {
      Alert.alert("Select an elder first");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("missing_reports").insert([
      {
        elder_id: selectedElder.id,
        last_seen_location: lastSeenLocation,
        last_seen_time: lastSeenTime,
        description,
      },
    ]);

    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert("Failed to submit report");
      return;
    }

    Alert.alert("Report submitted successfully");
  };

  /* ============================= */
  /* GENERATE POSTER HTML         */
  /* ============================= */

  const generatePosterHTML = () => {
    return `
      <html>
        <body style="font-family: Arial; text-align:center; padding:40px;">
          <h1 style="color:red;">MISSING ELDER</h1>
          <img src="${profile.avatar_url ?? ""}" 
               style="width:250px;height:250px;border-radius:10px;object-fit:cover;" />
          <h2>${profile.full_name ?? "Unknown"}</h2>
          <p><strong>Last Seen:</strong> ${lastSeenTime || "2:30 PM"}</p>
          <p><strong>Location:</strong> ${lastSeenLocation || "Central Park"}</p>
          <p>${description || "Wearing blue jacket and jeans."}</p>
        </body>
      </html>
    `;
  };

  /* ============================= */
  /* EXPORT PDF                   */
  /* ============================= */

  const exportToPDF = async () => {
    if (!selectedElder?.profiles?.[0]) {
      Alert.alert("Select an elder first");
      return;
    }

    const { uri } = await Print.printToFileAsync({
      html: generatePosterHTML(),
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  };

  /* ============================= */
  /* UI                           */
  /* ============================= */

  return (
    <>
      <Pressable
        style={styles.button}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.buttonText}>Report Missing Elder</Text>
      </Pressable>

      <Modal visible={visible} animationType="slide">
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Create Missing Report</Text>

            {/* Elder Selection */}
            {elders.map((elder) => (
              <Pressable
                key={elder.id}
                style={[
                  styles.elderCard,
                  selectedElder?.id === elder.id && styles.selectedCard,
                ]}
                onPress={() => setSelectedElder(elder)}
              >
                {elder.profiles?.[0]?.avatar_url && (
                  <Image
                    source={{ uri: elder.profiles[0].avatar_url }}
                    style={styles.avatar}
                  />
                )}
                <Text style={styles.elderName}>
                  {elder.profiles?.[0]?.full_name}
                </Text>
              </Pressable>
            ))}

            {/* FORM */}
            <TextInput
              placeholder="Last Seen Time"
              value={lastSeenTime}
              onChangeText={setLastSeenTime}
              style={styles.input}
            />

            <TextInput
              placeholder="Last Seen Location"
              value={lastSeenLocation}
              onChangeText={setLastSeenLocation}
              style={styles.input}
            />

            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { height: 100 }]}
              multiline
            />

            {/* POSTER PREVIEW (ALWAYS RENDERS) */}
            <View style={styles.posterPreview}>
              <Text style={styles.posterTitle}>MISSING</Text>

              {profile.avatar_url && (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.posterImage}
                />
              )}

              <Text style={styles.posterName}>
                {profile.full_name}
              </Text>

              <Text>Last Seen: {lastSeenTime || "2:30 PM"}</Text>
              <Text>Location: {lastSeenLocation || "Central Park"}</Text>
              <Text>
                {description || "Wearing blue jacket and jeans."}
              </Text>
            </View>

            {loading && <ActivityIndicator />}

            <Pressable style={styles.submitBtn} onPress={submitReport}>
              <Text style={styles.submitText}>Submit Report</Text>
            </Pressable>

            <Pressable style={styles.exportBtn} onPress={exportToPDF}>
              <Text style={styles.submitText}>Export Poster (PDF)</Text>
            </Pressable>

            <Pressable
              style={styles.closeBtn}
              onPress={() => setVisible(false)}
            >
              <Text>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

/* ============================= */
/* STYLES                        */
/* ============================= */

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#b00020",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    margin: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  elderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedCard: {
    borderColor: "#b00020",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  elderName: {
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  posterPreview: {
    marginTop: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#000",
    alignItems: "center",
  },
  posterTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "red",
  },
  posterImage: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
  posterName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  submitBtn: {
    backgroundColor: "#b00020",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  exportBtn: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeBtn: {
    alignItems: "center",
    marginTop: 20,
  },
});