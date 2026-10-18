import { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { fetchMusician, type PublicMusician } from "../../src/api"
import { useSession } from "../../src/session"

export default function MusicianScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [musician, setMusician] = useState<PublicMusician | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { session } = useSession()
  const router = useRouter()
  useEffect(() => { if (id) void fetchMusician(id).then(setMusician).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load musician")) }, [id])
  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
  if (!musician) return <View style={styles.center}><ActivityIndicator /></View>
  return <FlatList style={styles.container} contentContainerStyle={styles.content} data={musician.works} keyExtractor={(work) => String(work.id)} ListHeaderComponent={<><View style={styles.avatar}>{musician.profile.imageUrl ? <Image source={{ uri: musician.profile.imageUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{(musician.profile.displayName ?? musician.profile.accountName).charAt(0)}</Text>}</View><Text style={styles.title}>{musician.profile.displayName ?? musician.profile.accountName}</Text><Text style={styles.genre}>{musician.profile.primaryGenre ?? "Independent musician"}</Text>{musician.profile.bio ? <Text style={styles.bio}>{musician.profile.bio}</Text> : null}<Text style={styles.section}>Published works</Text></>} renderItem={({ item }) => <Pressable onPress={() => session ? router.push(`/work/${item.id}`) : router.push("/auth")} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}><Text style={styles.workTitle}>{item.title}</Text><Text style={styles.artist}>{item.artist}</Text><Text style={styles.meta}>{item.genreName ?? "Uncategorized"}</Text></Pressable>} ListEmptyComponent={<Text style={styles.empty}>No published works yet.</Text>} />
}
const styles = StyleSheet.create({ container: { backgroundColor: "#f7f5f0", flex: 1 }, content: { padding: 20, paddingBottom: 40 }, avatar: { alignItems: "center", backgroundColor: "#dedbd4", borderRadius: 52, height: 104, justifyContent: "center", overflow: "hidden", width: 104 }, avatarImage: { height: "100%", width: "100%" }, avatarText: { color: "#77736b", fontSize: 42, fontWeight: "700" }, title: { color: "#1d1c1a", fontSize: 32, fontWeight: "700", marginTop: 18 }, genre: { color: "#6b6259", fontSize: 16, marginTop: 5 }, bio: { color: "#504d47", fontSize: 15, lineHeight: 22, marginTop: 16 }, section: { color: "#1d1c1a", fontSize: 22, fontWeight: "700", marginTop: 32, marginBottom: 12 }, card: { backgroundColor: "#fff", borderColor: "#e5e1d9", borderRadius: 12, borderWidth: 1, marginBottom: 10, padding: 14 }, cardPressed: { opacity: 0.7 }, workTitle: { color: "#1d1c1a", fontSize: 17, fontWeight: "700" }, artist: { color: "#504d47", fontSize: 14, marginTop: 3 }, meta: { color: "#8b877e", fontSize: 12, marginTop: 8 }, empty: { color: "#77736b" }, center: { alignItems: "center", backgroundColor: "#f7f5f0", flex: 1, justifyContent: "center" }, error: { color: "#a33b32" } })
