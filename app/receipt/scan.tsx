import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RelativePathString } from "expo-router";

import { ScannerOverlay } from "@/components/scanner-overlay";
import { insertReceipt } from "@/db/receipts";
import { detectQRType, parseNbsIps, parseSufPurs } from "@/lib/qr-parser";
import {
  ReceiptScraper,
  ScrapedReceiptData,
} from "@/lib/receipt-scraper";

export default function ScanReceiptScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scraperUrl, setScraperUrl] = useState<string | null>(null);
  const [rawQrData, setRawQrData] = useState<string>("");

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

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned || isProcessing) return;
    setScanned(true);
    setIsProcessing(true);

    const qrType = detectQRType(result.data);
    console.log("Scanned QR code:", result.data);
    console.log("Detected type:", qrType);

    if (qrType === "nbs-ips") {
      // Parse NBS IPS QR code directly
      const receipt = parseNbsIps(result.data);

      try {
        await insertReceipt(receipt);
        // Navigate silently to receipts screen
        router.replace("/(tabs)/receipts" as RelativePathString);
      } catch (error) {
        console.error("Failed to save receipt:", error);
        Alert.alert("Error", "Failed to save receipt", [
          { text: "OK", onPress: () => setScanned(false) },
        ]);
        setIsProcessing(false);
      }
    } else if (qrType === "suf-purs") {
      // Start WebView scraping for SUF/PURS URL
      setRawQrData(result.data);
      setScraperUrl(result.data);
      // Processing continues in handleScrapedData
    } else {
      setIsProcessing(false);
      Alert.alert("Unknown QR Code", "This QR code format is not recognized", [
        { text: "OK", onPress: () => setScanned(false) },
      ]);
    }
  };

  const handleScrapedData = async (data: ScrapedReceiptData) => {
    setScraperUrl(null);

    const receipt = parseSufPurs(data, scraperUrl!, rawQrData);

    try {
      await insertReceipt(receipt);
      // Navigate silently to receipts screen
      router.replace("/(tabs)/receipts" as RelativePathString);
    } catch (error) {
      console.error("Failed to save receipt:", error);
      Alert.alert("Error", "Failed to save receipt", [
        { text: "OK", onPress: () => setScanned(false) },
      ]);
      setIsProcessing(false);
    }
  };

  const handleScraperError = (error: string) => {
    setScraperUrl(null);
    setIsProcessing(false);
    console.error("Scraper error:", error);
    Alert.alert("Scraping Failed", error, [
      { text: "OK", onPress: () => setScanned(false) },
    ]);
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

      {/* Processing overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingText}>
            {scraperUrl ? "Loading receipt data..." : "Saving receipt..."}
          </Text>
        </View>
      )}

      {/* Hidden WebView for scraping SUF/PURS pages */}
      {scraperUrl && (
        <ReceiptScraper
          url={scraperUrl}
          onScraped={handleScrapedData}
          onError={handleScraperError}
        />
      )}
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
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#fff",
  },
});
