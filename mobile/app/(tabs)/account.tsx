import { useState } from "react"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { deleteProfileImage, updateProfileImage } from "../../src/api"
import { useSession } from "../../src/session"

export default function AccountScreen() {
  const router = useRouter()
  const { session, loading, signOut, refreshSession } = useSession()
  const [signingOut, setSigningOut] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  async function chooseImage() {
    setImageError(null)
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) { setImageError("Allow photo access to choose a profile image."); return }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8, base64: true })
    if (result.canceled || !result.assets[0]?.base64) { if (!result.canceled) setImageError("The selected image could not be read. Please choose another image."); return }
    setUploadingImage(true)
    try { await updateProfileImage(result.assets[0].base64, result.assets[0].mimeType ?? "image/jpeg"); await refreshSession() } catch (cause) { setImageError(cause instanceof Error ? cause.message : "Unable to update profile image") } finally { setUploadingImage(false) }
  }

  function confirmRemoveImage() {
    Alert.alert("Remove profile image?", "Your avatar will return to your initial.", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => void removeImage() },
    ])
  }

  async function removeImage() {
    setImageError(null)
    setUploadingImage(true)
    try { await deleteProfileImage(); await refreshSession() } catch (cause) { setImageError(cause instanceof Error ? cause.message : "Unable to remove profile image") } finally { setUploadingImage(false) }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>
  if (!session) return <View style={styles.container}><Text style={styles.eyebrow}>ACCOUNT</Text><Text style={styles.title}>Make your library personal</Text><Text style={styles.body}>Sign in to save works and access your library across sessions.</Text><Pressable onPress={() => router.push("/auth")} style={styles.button}><Text style={styles.buttonText}>Sign in</Text></Pressable></View>

  return <View style={styles.container}><Text style={styles.eyebrow}>ACCOUNT</Text><Pressable accessibilityRole="button" accessibilityLabel="Change profile image" onPress={() => void chooseImage()} disabled={uploadingImage} style={styles.avatar}>{session.user.image ? <Image source={{ uri: session.user.image }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{session.user.name.charAt(0).toUpperCase()}</Text>}</Pressable><View style={styles.imageActions}><Pressable disabled={uploadingImage} onPress={() => void chooseImage()}><Text style={styles.changeImage}>{uploadingImage ? "Updating..." : "Change image"}</Text></Pressable>{session.user.image ? <Pressable disabled={uploadingImage} onPress={confirmRemoveImage}><Text style={styles.removeImage}>Remove image</Text></Pressable> : null}</View>{imageError ? <Text accessibilityRole="alert" style={styles.imageError}>{imageError}</Text> : null}<Text style={styles.title}>{session.user.name}</Text><Text style={styles.email}>{session.user.email}</Text><Text style={styles.body}>Your saved works are available in Library.</Text><Pressable disabled={signingOut} onPress={() => { setSigningOut(true); void signOut().then(() => router.replace("/(tabs)")).finally(() => setSigningOut(false)) }} style={[styles.button, signingOut && styles.disabled]}><Text style={styles.buttonText}>{signingOut ? "Signing out..." : "Sign out"}</Text></Pressable></View>
}

const styles = StyleSheet.create({ container: { backgroundColor: "#f7f5f0", flex: 1, padding: 24, paddingTop: 32 }, imageActions: { alignItems: "center", flexDirection: "row", gap: 18, marginTop: 10 }, avatar: { alignItems: "center", backgroundColor: "#dedbd4", borderRadius: 56, height: 112, justifyContent: "center", marginTop: 20, overflow: "hidden", width: 112 }, avatarImage: { height: "100%", width: "100%" }, avatarText: { color: "#1d1c1a", fontSize: 44, fontWeight: "700" }, changeImage: { color: "#6b6259", fontSize: 12 }, removeImage: { color: "#a33b32", fontSize: 12 }, imageError: { color: "#a33b32", marginTop: 10 }, center: { alignItems: "center", backgroundColor: "#f7f5f0", flex: 1, justifyContent: "center" }, eyebrow: { color: "#77736b", fontSize: 11, fontWeight: "600", letterSpacing: 2 }, title: { color: "#1d1c1a", fontSize: 32, fontWeight: "700", marginTop: 10 }, email: { color: "#6b6259", fontSize: 16, marginTop: 6 }, body: { color: "#504d47", fontSize: 16, lineHeight: 24, marginTop: 20 }, button: { alignItems: "center", backgroundColor: "#1d1c1a", borderRadius: 10, marginTop: 28, paddingVertical: 14 }, buttonText: { color: "#f7f5f0", fontSize: 16, fontWeight: "700" }, disabled: { opacity: 0.5 } })
