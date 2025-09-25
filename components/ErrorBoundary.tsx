import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, errorMessage: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, errorMessage: message };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error("ErrorBoundary caught error", { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <FallbackView message={this.state.errorMessage ?? "Unexpected error"} onReset={() => this.reset()} />;
    }
    return this.props.children;
  }

  reset() {
    try {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.reload();
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { DevSettings } = require("react-native");
      DevSettings.reload();
    } catch (e) {
      console.warn("Failed to reload app from ErrorBoundary", e);
    }
    this.setState({ hasError: false, errorMessage: null });
  }
}

function FallbackView({ message, onReset }: { message: string; onReset: () => void }) {
  const router = useRouter();
  return (
    <View style={styles.container} testID="error-boundary-fallback">
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message} numberOfLines={3}>{message}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onReset} style={styles.button} testID="btn-reload-app">
          <Text style={styles.buttonText}>Reload App</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/")} style={styles.buttonSecondary} testID="btn-go-home">
          <Text style={styles.buttonTextSecondary}>Go Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#0B1220" },
  title: { fontSize: 20, fontWeight: "700" as const, color: "#FFFFFF", marginBottom: 8, textAlign: "center" as const },
  message: { fontSize: 14, color: "#B0B7C3", textAlign: "center" as const },
  actions: { flexDirection: "row" as const, gap: 12, marginTop: 20 },
  button: { backgroundColor: "#2563EB", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  buttonText: { color: "#FFFFFF", fontWeight: "600" as const },
  buttonSecondary: { backgroundColor: "#1F2937", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  buttonTextSecondary: { color: "#E5E7EB", fontWeight: "600" as const },
});
