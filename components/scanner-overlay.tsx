import { Pressable, StyleSheet, Text, View } from "react-native";

const SCAN_AREA_SIZE = 280;
const CORNER_SIZE = 40;
const CORNER_THICKNESS = 4;
const CORNER_RADIUS = 16;

interface ScannerOverlayProps {
  scanned?: boolean;
  onScanAgain?: () => void;
  instructionText?: string;
}

export function ScannerOverlay({
  scanned = false,
  onScanAgain,
  instructionText = "Position QR code inside the frame",
}: ScannerOverlayProps) {
  return (
    <View style={styles.overlay}>
      {/* Top overlay */}
      <View style={styles.overlayTop} />

      {/* Middle row with scan window */}
      <View style={styles.overlayMiddle}>
        {/* Left overlay */}
        <View style={styles.overlaySide} />

        {/* Scan window with corner brackets */}
        <View style={styles.scanWindow}>
          {/* Top-left corner */}
          <View style={[styles.corner, styles.cornerTopLeft]}>
            <View style={[styles.cornerHorizontal, styles.cornerTop]} />
            <View style={[styles.cornerVertical, styles.cornerLeft]} />
          </View>

          {/* Top-right corner */}
          <View style={[styles.corner, styles.cornerTopRight]}>
            <View style={[styles.cornerHorizontal, styles.cornerTop]} />
            <View style={[styles.cornerVertical, styles.cornerRight]} />
          </View>

          {/* Bottom-left corner */}
          <View style={[styles.corner, styles.cornerBottomLeft]}>
            <View style={[styles.cornerHorizontal, styles.cornerBottom]} />
            <View style={[styles.cornerVertical, styles.cornerLeft]} />
          </View>

          {/* Bottom-right corner */}
          <View style={[styles.corner, styles.cornerBottomRight]}>
            <View style={[styles.cornerHorizontal, styles.cornerBottom]} />
            <View style={[styles.cornerVertical, styles.cornerRight]} />
          </View>
        </View>

        {/* Right overlay */}
        <View style={styles.overlaySide} />
      </View>

      {/* Bottom overlay with instruction text */}
      <View style={styles.overlayBottom}>
        <Text style={styles.instructionText}>{instructionText}</Text>
        {scanned && onScanAgain && (
          <Pressable
            style={({ pressed }) => [
              styles.scanAgainButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onScanAgain}
          >
            <Text style={styles.scanAgainText}>Tap to scan again</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  overlayMiddle: {
    flexDirection: "row",
  },
  overlaySide: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  scanWindow: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderRadius: CORNER_RADIUS,
    position: "relative",
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    paddingTop: 32,
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  scanAgainButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  scanAgainText: {
    color: "#fff",
    fontSize: 14,
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
  },
  cornerHorizontal: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_THICKNESS,
    backgroundColor: "#fff",
  },
  cornerVertical: {
    position: "absolute",
    width: CORNER_THICKNESS,
    height: CORNER_SIZE,
    backgroundColor: "#fff",
  },
  cornerTop: {
    top: 0,
    borderTopLeftRadius: CORNER_RADIUS,
    borderTopRightRadius: CORNER_RADIUS,
  },
  cornerBottom: {
    bottom: 0,
    borderBottomLeftRadius: CORNER_RADIUS,
    borderBottomRightRadius: CORNER_RADIUS,
  },
  cornerLeft: {
    left: 0,
    borderTopLeftRadius: CORNER_RADIUS,
    borderBottomLeftRadius: CORNER_RADIUS,
  },
  cornerRight: {
    right: 0,
    borderTopRightRadius: CORNER_RADIUS,
    borderBottomRightRadius: CORNER_RADIUS,
  },
});
