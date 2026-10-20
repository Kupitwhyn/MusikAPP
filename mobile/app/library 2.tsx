import { useCallback, useState } from "react"
import { Link, useFocusEffect, useRouter } from "expo-router"
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { fetchLibrary, type PublicWork } from "../src/api"
import { useSession } from "../src/session"
import { colors } from "../src/theme"

export default function LibraryScreen() {
  const [works, setWorks] = useState<PublicWork[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { session } = useSession()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const containerStyle = [styles.container, { paddingTop: insets.top + 16 }]
  const load = useCallback(async () => {
    setError(null)
    try { setWorks(await fetchLibrary()) } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load library") } finally { setLoading(false) }
  }, [])
  useFocusEffect(useCallback(() => {
    if (!session) {
      setWorks([])
      setLoading(false)
      return
    }
    setLoading(true)
    void load()
  }, [load, session]))
  if (!session) return <View style={containerStyle}><Text style={styles.eyebrow}>YOUR LIBRARY</Text><Text style={styles.title}>Saved works</Text><Text style={styles.error}>Sign in to access your library.</Text><Pressable onPress={() => router.push("/auth")}><Text style={styles.retry}>Sign in</Text></Pressable></View>
  return <View style={containerStyle}><Text style={styles.wordmark}>REVERB<Text style={styles.wordmarkDot}>.</Text></Text><Text style={styles.eyebrow}>YOUR PERSONAL COLLECTION</Text><Text style={styles.title}>Saved works</Text>{loading ? <ActivityIndicator style={styles.center} color={colors.rust} /> : error ? <View><Text style={styles.error}>{error}</Text><Pressable onPress={() => { setLoading(true); void load() }}><Text style={styles.retry}>Try again</Text></Pressable></View> : <FlatList data={works} keyExtractor={(work) => String(work.id)} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyMark}>♪</Text><Text style={styles.emptyTitle}>A space for the songs you keep.</Text><Text style={styles.emptyCopy}>Save a work from its detail page to find it here.</Text><Pressable onPress={() => router.replace("/(tabs)") } style={styles.discoverButton}><Text style={styles.discoverButtonText}>Explore the archive  ↗</Text></Pressable></View>} renderItem={({ item }) => <Link href={`/work/${item.id}`} asChild><Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}><View style={styles.artwork}>{item.artworkUrl ? <Image source={{ uri: item.artworkUrl }} style={styles.artworkImage} /> : <Text style={styles.artworkPlaceholder}>♪</Text>}</View><View style={styles.cardContent}><Text numberOfLines={1} style={styles.workTitle}>{item.title}</Text><Text numberOfLines={1} style={styles.artist}>{item.artist}</Text><Text style={styles.meta}>{item.genreName ?? "Independent"}</Text></View><Text style={styles.arrow}>↗</Text></Pressable></Link>} />}</View>
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.paper, flex: 1, paddingHorizontal: 21 },
  wordmark: { color: colors.ink, fontSize: 17, fontWeight: "900", letterSpacing: 3, marginBottom: 26 },
  wordmarkDot: { color: colors.rust },
  eyebrow: { color: colors.rust, fontSize: 10, fontWeight: "700", letterSpacing: 1.8 },
  title: { color: colors.ink, fontFamily: "serif", fontSize: 34, fontWeight: "700", marginBottom: 19, marginTop: 9 },
  list: { gap: 3, paddingBottom: 180 },
  card: { alignItems: "center", backgroundColor: colors.card, borderBottomColor: colors.line, borderBottomWidth: 1, flexDirection: "row", paddingVertical: 13 },
  cardPressed: { opacity: 0.7 },
  artwork: { alignItems: "center", backgroundColor: colors.rustSoft, borderRadius: 9, height: 62, justifyContent: "center", overflow: "hidden", width: 62 },
  artworkImage: { height: "100%", width: "100%" },
  artworkPlaceholder: { color: colors.rust, fontSize: 27 },
  cardContent: { flex: 1, marginLeft: 13 },
  workTitle: { color: colors.ink, fontFamily: "serif", fontSize: 17, fontWeight: "700" },
  artist: { color: colors.muted, fontSize: 12, marginTop: 3 },
  meta: { color: colors.subtle, fontSize: 10, marginTop: 7 },
  arrow: { color: colors.rust, fontSize: 19, marginLeft: 8 },
  center: { marginTop: 40 },
  error: { color: colors.danger, marginTop: 24 },
  retry: { color: colors.rust, marginTop: 14, textDecorationLine: "underline" },
  empty: { alignItems: "center", backgroundColor: colors.card, borderRadius: 18, marginTop: 22, paddingHorizontal: 20, paddingVertical: 34 },
  emptyMark: { color: colors.rust, fontSize: 35 },
  emptyTitle: { color: colors.ink, fontFamily: "serif", fontSize: 21, fontWeight: "700", marginTop: 10, textAlign: "center" },
  emptyCopy: { color: colors.muted, lineHeight: 20, marginTop: 8, textAlign: "center" },
  discoverButton: { backgroundColor: colors.rust, borderRadius: 22, marginTop: 18, paddingHorizontal: 17, paddingVertical: 12 },
  discoverButtonText: { color: colors.white, fontSize: 12, fontWeight: "700" },
})
