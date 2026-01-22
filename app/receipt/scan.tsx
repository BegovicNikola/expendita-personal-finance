import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ScannerOverlay } from "@/components/scanner-overlay";

export default function ScanReceiptScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // Loading state while checking permissions
  if (!permission) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={styles.loadingText}>Checking camera permissions...</Text>
      </View>
    );
  }

  // Permission not granted - show request UI
  if (!permission.granted) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan receipt QR codes
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.permissionButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    // TODO: Process the QR code data (e.g., fetch receipt details)
    console.log("Scanned QR code:", result.data);

    router.back();
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <ScannerOverlay scanned={scanned} onScanAgain={() => setScanned(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#151718",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9BA1A6",
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#ECEDEE",
    marginBottom: 12,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 16,
    color: "#9BA1A6",
    textAlign: "center",
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  cancelButtonText: {
    color: "#9BA1A6",
    fontSize: 16,
  },
});
