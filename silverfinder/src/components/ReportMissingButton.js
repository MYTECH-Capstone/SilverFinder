import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function ReportMissingButton() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Button */}
      <TouchableOpacity
        style={styles.reportButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.reportText}>
          Report Missing Elder
        </Text>
      </TouchableOpacity>

      {/* Popup */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.title}>
            Report Missing Elder
          </Text>

          {/* Blank placeholder screen */}
          <Text style={styles.placeholder}>
            Placeholder for missing report form fields.
          </Text>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  reportButton: {
    backgroundColor: "#b91c1c",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    width: "75%",
    alignSelf: "center",
  },
  reportText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 20,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  placeholder: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 8,
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});