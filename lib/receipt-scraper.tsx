import { useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import WebView, { WebViewMessageEvent } from "react-native-webview";

export interface ScrapedReceiptData {
  companyName: string;
  total: number;
  dateTime: string;
}

interface ReceiptScraperProps {
  url: string;
  onScraped: (data: ScrapedReceiptData) => void;
  onError: (error: string) => void;
}

/**
 * JavaScript to inject into the WebView to extract receipt data from SUF/PURS page
 *
 * Known page elements:
 * - Company: "Предузеће" field (e.g., "LC WAIKIKI Retail RS d.o.o.")
 * - Total: "Укупан износ" / "За уплату" field (e.g., "2.812,00")
 * - DateTime: "ПФР време" field (e.g., "17.1.2026. 13:56:17")
 */
const EXTRACTION_SCRIPT = `
  (function() {
    try {
      // TODO: Add selectors based on page structure
      // These selectors need to be determined by inspecting the actual page
      const companyName = ''; // TODO: Extract from page (look for "Предузеће" label)
      const total = 0;        // TODO: Extract "Укупан износ" or "За уплату" value
      const dateTime = '';    // TODO: Extract "ПФР време" value

      window.ReactNativeWebView.postMessage(JSON.stringify({
        success: true,
        data: {
          companyName,
          total,
          dateTime,
        }
      }));
    } catch (error) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        success: false,
        error: error.message || 'Failed to extract data'
      }));
    }
  })();
  true;
`;

/**
 * Hidden WebView component that scrapes receipt data from SUF/PURS verification page
 */
export function ReceiptScraper({ url, onScraped, onError }: ReceiptScraperProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const result = JSON.parse(event.nativeEvent.data);

      if (result.success) {
        onScraped(result.data);
      } else {
        onError(result.error || "Unknown error");
      }
    } catch {
      onError("Failed to parse scraped data");
    }
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
    // Inject extraction script after page loads
    webViewRef.current?.injectJavaScript(EXTRACTION_SCRIPT);
  };

  const handleError = () => {
    setIsLoading(false);
    onError("Failed to load verification page");
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        onMessage={handleMessage}
        javaScriptEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
