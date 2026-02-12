import { useState } from "react";
import {
  Modal,
  ScrollView,
  View,
  Text,
  TextInput,
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
        presentationStyle="fullScreen"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <ScrollView 
        contentContainerStyle={styles.modalContainer}
        keyboardShouldPersistTaps="handled"
        >
          
          <Text style={styles.title}>Report Missing Elder</Text>


          <View style={styles.formGroup}>
            <Text style={styles.label}>Elder Name</Text>
            <TextInput style={styles.input} placeholder="Fake Man" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Last Known Location</Text>
            <TextInput style={styles.input} placeholder="123 Main St" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date Last Seen</Text>
            <TextInput style={styles.input} placeholder="MM/DD/YYYY" />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any other relevant information"
              multiline
            />
          </View>

          {/* Buttons */} 
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
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
    flexGrow: 1,
    padding: 20,
    backgroundColor: "white",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#b91c1c",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: { 
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#b91c1c",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
  },
  submitText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
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