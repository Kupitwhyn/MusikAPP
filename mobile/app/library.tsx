import { useCallback, useState } from "react"
import { Link, useFocusEffect, useRouter } from "expo-router"
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native"
import { fetchLibrary, type PublicWork } from "../src/api"
import { useSession } from "../src/session"

export default function LibraryScreen() {
  const [works, setWorks] = useState<PublicWork[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { session } = useSession()
  const router = useRouter()
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
  if (!session) return <View style={styles.container}><Text style={styles.eyebrow}>YOUR LIBRARY</Text><Text style={styles.title}>Saved works</Text><Text style={styles.error}>Sign in to access your library.</Text><Pressable onPress={() => router.push("/auth")}><Text style={styles.retry}>Sign in</Text></Pressable></View>
  return <View style={styles.container}><Text style={styles.eyebrow}>YOUR LIBRARY</Text><Text style={styles.title}>Saved works</Text>{loading ? <ActivityIndicator style={styles.center} /> : error ? <View><Text style={styles.error}>{error}</Text><Pressable onPress={() => { setLoading(true); void load() }}><Text style={styles.retry}>Try again</Text></Pressable></View> : <FlatList data={works} keyExtractor={(work) => String(work.id)} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyTitle}>Your library is empty</Text><Text style={styles.emptyCopy}>Save a work from its detail page to find it here.</Text><Pressable onPress={() => router.replace("/(tabs)") } style={styles.discoverButton}><Text style={styles.discoverButtonText}>Explore works</Text></Pressable></View>} renderItem={({ item }) => <Link href={`/work/${item.id}`} asChild><Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}><Text style={styles.workTitle}>{item.title}</Text><Text style={styles.artist}>{item.artist}</Text><Text style={styles.meta}>{item.genreName ?? "Uncategorized"}</Text></Pressable></Link>} />}</View>
}

const styles = StyleSheet.create({ container: { backgroundColor: "#f7f5f0", flex: 1, paddingHorizontal: 20, paddingTop: 32 }, eyebrow: { color: "#77736b", fontSize: 11, fontWeight: "600", letterSpacing: 2 }, title: { color: "#1d1c1a", fontSize: 32, fontWeight: "700", marginBottom: 20, marginTop: 10 }, list: { gap: 12, paddingBottom: 180 }, card: { backgroundColor: "#fff", borderColor: "#e5e1d9", borderRadius: 12, borderWidth: 1, padding: 16 }, cardPressed: { opacity: 0.7 }, workTitle: { color: "#1d1c1a", fontSize: 18, fontWeight: "700" }, artist: { color: "#504d47", marginTop: 4 }, meta: { color: "#8b877e", fontSize: 12, marginTop: 8 }, center: { marginTop: 40 }, error: { color: "#a33b32", marginTop: 24 }, retry: { color: "#6b6259", marginTop: 14, textDecorationLine: "underline" }, empty: { alignItems: "center", paddingHorizontal: 20, paddingTop: 40 }, emptyTitle: { color: "#1d1c1a", fontSize: 18, fontWeight: "700", textAlign: "center" }, emptyCopy: { color: "#77736b", lineHeight: 20, marginTop: 8, textAlign: "center" }, discoverButton: { backgroundColor: "#1d1c1a", borderRadius: 8, marginTop: 18, paddingHorizontal: 16, paddingVertical: 12 }, discoverButtonText: { color: "#f7f5f0", fontWeight: "700" } })
