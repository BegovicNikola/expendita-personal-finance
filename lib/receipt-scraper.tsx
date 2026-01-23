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
      // The page has a "Журнал" section with preformatted receipt text
      // This is the most reliable source for extracting data
      // Format example:
      // ============ ФИСКАЛНИ РАЧУН ============
      //                100049486                
      //      dm drogerie markt doo Beograd      
      // ...
      // Укупан износ:                   2.184,00
      // ...
      // ПФР време:          18.01.2026. 14:57:00

      const text = document.body.textContent || '';
      
      // Extract company name from the receipt journal
      // Look for the line after the tax ID (9-digit number) in the receipt header
      let companyName = '';
      const receiptMatch = text.match(/ФИСКАЛНИ РАЧУН[=\\s]+([0-9]{9})\\s+([^\\n]+)/);
      if (receiptMatch && receiptMatch[2]) {
        companyName = receiptMatch[2].trim();
      }
      
      // Fallback: try to find "Предузеће:" in the print preview section
      if (!companyName) {
        const companyMatch = text.match(/Предузеће:\\s*([^\\n]+)/);
        if (companyMatch) {
          companyName = companyMatch[1].trim();
        }
      }

      // Extract total from "Укупан износ:" in the receipt journal
      // Format: "2.184,00" (Serbian: dot for thousands, comma for decimal)
      let total = 0;
      const totalMatch = text.match(/Укупан износ:\\s*([0-9.,]+)/);
      if (totalMatch) {
        // Convert Serbian format (1.234,56) to number
        total = parseFloat(totalMatch[1].replace(/\\./g, '').replace(',', '.'));
      }

      // Extract datetime from "ПФР време:" in the receipt journal
      // Format: "18.01.2026. 14:57:00"
      let dateTime = '';
      const dateMatch = text.match(/ПФР време:\\s*(\\d{1,2}\\.\\d{1,2}\\.\\d{4}\\.\\s*\\d{2}:\\d{2}:\\d{2})/);
      if (dateMatch) {
        dateTime = dateMatch[1].trim();
      }

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
