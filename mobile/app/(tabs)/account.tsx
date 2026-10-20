import { useState } from "react"
import { useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import { Bookmark, ChevronRight, LogOut, Pencil } from "lucide-react-native"
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View, type AlertButton } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { deleteProfileImage, updateProfileImage } from "../../src/api"
import { useSession } from "../../src/session"
import { colors } from "../../src/theme"

export default function AccountScreen() {
  const router = useRouter()
  const { session, loading, signOut, refreshSession } = useSession()
  const insets = useSafeAreaInsets()
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

  async function removeImage() {
    setImageError(null)
    setUploadingImage(true)
    try {
      await deleteProfileImage()
      await refreshSession()
    } catch (cause) {
      setImageError(cause instanceof Error ? cause.message : "Unable to remove profile image")
    } finally {
      setUploadingImage(false)
    }
  }

  function showImageOptions() {
    const options: AlertButton[] = [
      { text: "Change profile image", onPress: () => void chooseImage() },
    ]
    if (session?.user.image) {
      options.push({
        text: "Remove profile image",
        style: "destructive",
        onPress: () => Alert.alert(
          "Remove profile image?",
          "Your avatar will return to your initial.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Remove image", style: "destructive", onPress: () => void removeImage() },
          ],
        ),
      })
    }
    options.push({ text: "Cancel", style: "cancel" })
    Alert.alert("Profile image", "Choose an action.", options)
  }

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>
  if (!session) return <View style={[styles.container, { paddingTop: insets.top + 32 }]}><Text style={styles.eyebrow}>ACCOUNT</Text><Text style={styles.title}>Make your library personal</Text><Text style={styles.body}>Sign in to save works and access your library across sessions.</Text><Pressable onPress={() => router.push("/auth")} style={styles.button}><Text style={styles.buttonText}>Sign in</Text></Pressable></View>

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.profile, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 130 }]}
    >
      <View style={styles.profileHeader}>
        <View style={styles.profileCopy}>
          <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text numberOfLines={1} style={styles.title}>{session.user.name}</Text>
          <Text numberOfLines={1} style={styles.email}>{session.user.email}</Text>
        </View>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            {session.user.image
              ? <Image source={{ uri: session.user.image }} style={styles.avatarImage} />
              : <Text style={styles.avatarText}>{session.user.name.charAt(0).toUpperCase()}</Text>}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile image options"
            onPress={showImageOptions}
            disabled={uploadingImage}
            style={[styles.editAvatar, uploadingImage && styles.disabled]}
          >
            <Pencil color={colors.white} size={14} />
          </Pressable>
        </View>
      </View>
      {imageError ? <Text accessibilityRole="alert" style={styles.imageError}>{imageError}</Text> : null}
      <Text style={styles.sectionTitle}>Your Reverb</Text>
      <View style={styles.menu}>
        <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/library")} style={styles.menuRow}>
          <View style={styles.menuIcon}><Bookmark color={colors.ink} size={20} /></View>
          <View style={styles.menuCopy}>
            <Text style={styles.menuTitle}>Saved works</Text>
            <Text style={styles.menuSubtitle}>Return to your personal collection</Text>
          </View>
          <ChevronRight color={colors.subtle} size={20} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={signingOut}
          onPress={() => { setSigningOut(true); void signOut().then(() => router.replace("/(tabs)")).finally(() => setSigningOut(false)) }}
          style={[styles.menuRow, styles.signOutRow, signingOut && styles.disabled]}
        >
          <View style={[styles.menuIcon, styles.signOutIcon]}><LogOut color={colors.rust} size={20} /></View>
          <View style={styles.menuCopy}>
            <Text style={styles.signOutTitle}>{signingOut ? "Signing out..." : "Sign out"}</Text>
            <Text style={styles.menuSubtitle}>Sign out of this account</Text>
          </View>
          <ChevronRight color={colors.subtle} size={20} />
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.paper, flex: 1 },
  container: { backgroundColor: colors.paper, flex: 1, padding: 24 },
  profile: { flexGrow: 1, paddingHorizontal: 22 },
  profileHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
  profileCopy: { flex: 1, minWidth: 0, paddingRight: 8 },
  welcome: { color: colors.muted, fontSize: 14, marginTop: 14 },
  avatarWrap: { height: 100, marginLeft: 4, position: "relative", width: 100 },
  avatar: { alignItems: "center", backgroundColor: colors.card, borderColor: colors.card, borderRadius: 50, borderWidth: 3, height: 96, justifyContent: "center", overflow: "hidden", width: 96 },
  avatarImage: { height: "100%", width: "100%" },
  avatarText: { color: colors.rust, fontFamily: "serif", fontSize: 36, fontWeight: "700" },
  editAvatar: { alignItems: "center", backgroundColor: colors.ink, borderColor: colors.rustSoft, borderRadius: 17, borderWidth: 2, bottom: 0, height: 34, justifyContent: "center", position: "absolute", right: 0, width: 34 },
  imageError: { color: colors.danger, marginTop: 14, textAlign: "center" },
  center: { alignItems: "center", backgroundColor: colors.paper, flex: 1, justifyContent: "center" },
  eyebrow: { color: colors.rust, fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  title: { color: colors.ink, fontFamily: "serif", fontSize: 29, fontWeight: "700", marginTop: 4 },
  email: { color: colors.muted, fontSize: 12, marginTop: 5 },
  body: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 22, textAlign: "center" },
  sectionTitle: { color: colors.ink, fontFamily: "serif", fontSize: 23, fontWeight: "700", marginBottom: 13, marginTop: 31 },
  menu: { backgroundColor: colors.card, borderRadius: 20, paddingHorizontal: 15 },
  menuRow: { alignItems: "center", flexDirection: "row", minHeight: 80, paddingVertical: 12 },
  menuIcon: { alignItems: "center", backgroundColor: colors.rustSoft, borderRadius: 23, height: 46, justifyContent: "center", width: 46 },
  menuCopy: { flex: 1, marginLeft: 13, minWidth: 0 },
  menuTitle: { color: colors.ink, fontSize: 15, fontWeight: "600" },
  menuSubtitle: { color: colors.muted, fontSize: 11, marginTop: 4 },
  signOutRow: { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
  signOutIcon: { backgroundColor: colors.paper },
  signOutTitle: { color: colors.rust, fontSize: 15, fontWeight: "600" },
  button: { alignItems: "center", backgroundColor: colors.ink, borderRadius: 24, marginTop: 28, paddingVertical: 14 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "500", letterSpacing: 1 },
  disabled: { opacity: 0.5 },
})
