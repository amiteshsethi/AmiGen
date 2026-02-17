import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, Image, TouchableOpacity, Alert, View, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [imageUrl, setImageUrl] = useState("https://picsum.photos/400/400?random=1");
  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleGenerateImage = () => {
    setIsLoading(true);
    const newUrl = `https://picsum.photos/400/400?random=${Math.random()}`;
    setImageUrl(newUrl);
    setIsGenerated(true);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleDownloadImage = async () => {
    try {
      setIsDownloading(true);

      // Create a temporary file path
      const fileUri = (FileSystem.cacheDirectory || "") + `AmiGen_${Date.now()}.jpg`;

      // Download the file
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

      if (downloadResult.status === 200) {
        // Request permissions specifically for media library
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        if (status !== "granted") {
          Alert.alert("Permission Required", "Please allow access to your media library to save images.");
          return;
        }

        // Save to gallery
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        Alert.alert("Success!", "Image has been saved to your gallery.");
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save image. Expo Go might have restrictions on gallery access.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.background}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>AmiGen</Text>
            <Text style={styles.subtitle}>AI-Powered Image Explorer</Text>
          </View>

          <View style={styles.imageContainer}>
            {isLoading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#38bdf8" />
              </View>
            )}
            <Image source={{ uri: imageUrl }} style={[styles.image, isLoading && { opacity: 0 }]} onLoad={handleImageLoad} />
            {!isGenerated && !isLoading && (
              <View style={styles.placeholderContainer}>
                <Ionicons name="image-outline" size={64} color="#475569" />
                <Text style={styles.placeholderText}>Tap below to generate</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.mainButton} onPress={handleGenerateImage} activeOpacity={0.8}>
              <LinearGradient colors={["#38bdf8", "#0284c7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
                <Ionicons name="sparkles" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Generate New Magic</Text>
              </LinearGradient>
            </TouchableOpacity>

            {isGenerated && (
              <TouchableOpacity style={[styles.secondaryButton, isDownloading && styles.disabledButton]} onPress={handleDownloadImage} disabled={isDownloading} activeOpacity={0.7}>
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#38bdf8" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={20} color="#38bdf8" style={styles.buttonIcon} />
                    <Text style={styles.secondaryButtonText}>Download to Phone</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          <StatusBar style="light" />
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  imageContainer: {
    width: width - 40,
    height: width - 40,
    backgroundColor: "#1e293b",
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loaderContainer: {
    position: "absolute",
    zIndex: 1,
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderText: {
    color: "#64748b",
    marginTop: 12,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  mainButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
  },
  gradientButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56, 189, 248, 0.1)",
  },
  secondaryButtonText: {
    color: "#38bdf8",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
