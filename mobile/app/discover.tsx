import { useCallback, useEffect, useState } from "react"
import { Link, useRouter } from "expo-router"
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native"
import { fetchWorks, type PublicWork } from "../src/api"
import { useSession } from "../src/session"

export default function HomeScreen() {
  const [works, setWorks] = useState<PublicWork[]>([])
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { session } = useSession()
  const router = useRouter()
  const loadWorks = useCallback(async (search?: string) => {
    setLoading(true)
    setError(null)
    try { setWorks(await fetchWorks(search)) } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load works") } finally { setLoading(false) }
  }, [])
  useEffect(() => {
    let active = true
    void fetchWorks()
      .then((results) => {
        if (!active) return
        setWorks(results)
        setError(null)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load works")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])
  return <View style={styles.container}>{session ? <Link href="/(tabs)/account" style={styles.avatarLink}>{session.user.image ? <Image source={{ uri: session.user.image }} style={styles.headerAvatar} /> : <Text style={styles.headerInitial}>{session.user.name.charAt(0).toUpperCase()}</Text>}</Link> : <Link href="/auth" style={styles.authLink}>Sign in</Link>}<Text style={styles.eyebrow}>DIGITAL MUSIC ARCHIVE</Text><Text style={styles.title}>Discover finished works</Text><Text style={styles.helper}>{session ? "Tap a work to open its details and play the audio." : "Sign in to open works and play audio."}</Text><TextInput value={query} onChangeText={setQuery} onSubmitEditing={() => { setLoading(true); void loadWorks(query) }} placeholder="Search works, artists, projects" returnKeyType="search" style={styles.search} />{loading ? <ActivityIndicator style={styles.center} /> : error ? <View style={styles.errorState}><Text style={styles.errorTitle}>Discover is temporarily unavailable</Text><Text style={styles.errorCopy}>Check your connection or make sure the server is running, then try again.</Text><Pressable onPress={() => { setLoading(true); void loadWorks(query) }} style={styles.retryButton}><Text style={styles.retryButtonText}>Try again</Text></Pressable></View> : <FlatList data={works} keyExtractor={(work) => String(work.id)} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { setLoading(true); void loadWorks(query) }} />} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No published works found.</Text>} renderItem={({ item }) => <Pressable onPress={() => session ? router.push(`/work/${item.id}`) : router.push("/auth")} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}><View style={styles.artwork}>{item.artworkUrl ? <Image source={{ uri: item.artworkUrl }} style={styles.artworkImage} /> : <Text style={styles.artworkText}>♪</Text>}</View><View style={styles.cardContent}><Text style={styles.workTitle}>{item.title}</Text><Text style={styles.artist}>{item.artist}</Text><Text style={styles.meta}>{item.genreName ?? "Uncategorized"}{item.projectTitle ? ` · ${item.projectTitle}` : ""}</Text><Text style={styles.listen}>{session ? "Open to listen ›" : "Sign in to listen ›"}</Text></View></Pressable>} />}</View>
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: "#f7f5f0", paddingTop: 32, paddingHorizontal: 20 }, avatarLink: { alignItems: "center", alignSelf: "flex-end", backgroundColor: "#dedbd4", borderRadius: 999, height: 44, justifyContent: "center", marginBottom: 20, overflow: "hidden", width: 44 }, headerAvatar: { borderRadius: 999, height: "100%", width: "100%" }, headerInitial: { color: "#1d1c1a", fontSize: 18, fontWeight: "700", lineHeight: 44, textAlign: "center", width: 44 }, errorState: { alignItems: "center", paddingHorizontal: 20, paddingTop: 48 }, errorTitle: { color: "#1d1c1a", fontSize: 18, fontWeight: "700", textAlign: "center" }, errorCopy: { color: "#77736b", lineHeight: 20, marginTop: 8, textAlign: "center" }, retryButton: { backgroundColor: "#1d1c1a", borderRadius: 8, marginTop: 18, paddingHorizontal: 16, paddingVertical: 12 }, retryButtonText: { color: "#f7f5f0", fontWeight: "700" }, authLink: { alignItems: "center", alignSelf: "flex-end", color: "#6b6259", fontSize: 14, justifyContent: "center", marginBottom: 20, minHeight: 44, minWidth: 64, paddingHorizontal: 8, textAlign: "center", textDecorationLine: "underline" }, eyebrow: { color: "#77736b", fontSize: 11, letterSpacing: 2, fontWeight: "600" }, title: { color: "#1d1c1a", fontSize: 32, fontWeight: "700", marginTop: 10 }, helper: { color: "#6b6259", fontSize: 14, lineHeight: 20, marginBottom: 18, marginTop: 8 }, search: { backgroundColor: "#fff", borderColor: "#dedbd4", borderRadius: 10, borderWidth: 1, fontSize: 16, paddingHorizontal: 14, paddingVertical: 12 }, list: { gap: 12, paddingBottom: 24, paddingTop: 20 }, card: { alignItems: "center", backgroundColor: "#fff", borderColor: "#e5e1d9", borderRadius: 12, borderWidth: 1, flexDirection: "row", padding: 12 }, cardPressed: { opacity: 0.7 }, artwork: { alignItems: "center", backgroundColor: "#dedbd4", borderRadius: 8, height: 64, justifyContent: "center", overflow: "hidden", width: 64 }, artworkImage: { height: "100%", width: "100%" }, artworkText: { color: "#77736b", fontSize: 28 }, cardContent: { flex: 1, marginLeft: 14 }, workTitle: { color: "#1d1c1a", fontSize: 17, fontWeight: "700" }, artist: { color: "#504d47", fontSize: 14, marginTop: 3 }, meta: { color: "#8b877e", fontSize: 12, marginTop: 8 }, listen: { color: "#6b6259", fontSize: 12, marginTop: 8 }, center: { marginTop: 40 }, error: { color: "#a33b32", marginTop: 24 }, empty: { color: "#77736b", paddingTop: 24, textAlign: "center" } })
