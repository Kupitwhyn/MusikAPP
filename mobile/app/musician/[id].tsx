import { useEffect, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router"
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { fetchMusician, type PublicMusician } from "../../src/api"
import { useSession } from "../../src/session"
import { colors } from "../../src/theme"

export default function MusicianScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [musician, setMusician] = useState<PublicMusician | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { session } = useSession()
  const router = useRouter()
  useEffect(() => { if (id) void fetchMusician(id).then(setMusician).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load musician")) }, [id])
  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
  if (!musician) return <View style={styles.center}><ActivityIndicator /></View>
  return <FlatList style={styles.container} contentContainerStyle={styles.content} data={musician.works} keyExtractor={(work) => String(work.id)} ListHeaderComponent={<><View style={styles.avatar}>{musician.profile.imageUrl ? <Image source={{ uri: musician.profile.imageUrl }} style={styles.avatarImage} /> : <Text style={styles.avatarText}>{(musician.profile.displayName ?? musician.profile.accountName).charAt(0)}</Text>}</View><Text style={styles.title}>{musician.profile.displayName ?? musician.profile.accountName}</Text><Text style={styles.genre}>{musician.profile.primaryGenre ?? "Independent musician"}</Text>{musician.profile.bio ? <Text style={styles.bio}>{musician.profile.bio}</Text> : null}<Text style={styles.section}>Published works</Text></>} renderItem={({ item }) => <Pressable onPress={() => session ? router.push(`/work/${item.id}`) : router.push("/auth")} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}><View style={styles.artwork}>{item.artworkUrl ? <Image source={{ uri: item.artworkUrl }} style={styles.artworkImage} /> : <Text style={styles.artworkPlaceholder}>♪</Text>}</View><View style={styles.workCopy}><Text numberOfLines={1} style={styles.workTitle}>{item.title}</Text><Text numberOfLines={1} style={styles.artist}>{item.artist}</Text><Text style={styles.meta}>{item.genreName ?? "Independent"}</Text></View><Text style={styles.arrow}>↗</Text></Pressable>} ListEmptyComponent={<Text style={styles.empty}>No published works yet.</Text>} />
}
const styles = StyleSheet.create({
  container: { backgroundColor: colors.paper, flex: 1 },
  content: { padding: 22, paddingBottom: 45 },
  avatar: { alignItems: "center", backgroundColor: colors.rustSoft, borderColor: colors.card, borderRadius: 54, borderWidth: 4, height: 108, justifyContent: "center", overflow: "hidden", width: 108 },
  avatarImage: { height: "100%", width: "100%" },
  avatarText: { color: colors.rust, fontFamily: "serif", fontSize: 42, fontWeight: "700" },
  title: { color: colors.ink, fontFamily: "serif", fontSize: 34, fontWeight: "700", marginTop: 18 },
  genre: { color: colors.rust, fontSize: 12, fontWeight: "700", letterSpacing: 0.7, marginTop: 7, textTransform: "uppercase" },
  bio: { color: colors.muted, fontSize: 15, lineHeight: 23, marginTop: 16 },
  section: { color: colors.ink, fontFamily: "serif", fontSize: 23, fontWeight: "700", marginBottom: 12, marginTop: 32 },
  card: { alignItems: "center", backgroundColor: colors.card, borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: "row", marginBottom: 3, paddingVertical: 13 },
  cardPressed: { opacity: 0.7 },
  artwork: { alignItems: "center", backgroundColor: colors.rustSoft, borderRadius: 9, height: 58, justifyContent: "center", overflow: "hidden", width: 58 },
  artworkImage: { height: "100%", width: "100%" },
  artworkPlaceholder: { color: colors.rust, fontSize: 25 },
  workCopy: { flex: 1, marginLeft: 12 },
  workTitle: { color: colors.ink, fontFamily: "serif", fontSize: 17, fontWeight: "700" },
  artist: { color: colors.muted, fontSize: 12, marginTop: 3 },
  meta: { color: colors.subtle, fontSize: 10, marginTop: 7 },
  arrow: { color: colors.rust, fontSize: 19, marginLeft: 8 },
  empty: { color: colors.muted },
  center: { alignItems: "center", backgroundColor: colors.paper, flex: 1, justifyContent: "center" },
  error: { color: colors.danger },
})
