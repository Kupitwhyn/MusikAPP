import { useCallback, useState } from "react"
import { Link, useFocusEffect, useRouter } from "expo-router"
import { Bookmark, ChevronRight, Heart, Music2 } from "lucide-react-native"
import { ActivityIndicator, FlatList, Image, ImageBackground, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { fetchLibrary, toggleFavorite, type PublicWork } from "../src/api"
import { useSession } from "../src/session"
import { colors } from "../src/theme"

const LIBRARY_HERO_IMAGE: ImageSourcePropType = require("../assets/hero.jpg")

function formatDuration(duration: number | null) {
  if (duration === null || !Number.isFinite(duration) || duration < 0) return null
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60).toString().padStart(2, "0")
  return `${minutes}:${seconds}`
}

export default function LibraryScreen() {
  const [works, setWorks] = useState<PublicWork[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [favoriteActionId, setFavoriteActionId] = useState<number | null>(null)
  const [favoriteError, setFavoriteError] = useState<string | null>(null)
  const { session } = useSession()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const containerStyle = [styles.container, { paddingTop: insets.top + 16 }]
  const load = useCallback(async () => {
    setError(null)
    try { setWorks(await fetchLibrary()) } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load library") } finally { setLoading(false) }
  }, [])
  const removeFavorite = useCallback(async (workId: number) => {
    setFavoriteError(null)
    setFavoriteActionId(workId)
    try {
      const favorited = await toggleFavorite(workId)
      if (!favorited) setWorks((current) => current.filter((work) => work.id !== workId))
    } catch (cause) {
      setFavoriteError(cause instanceof Error ? cause.message : "Unable to update your library")
    } finally {
      setFavoriteActionId(null)
    }
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

  if (!session) {
    return (
      <View style={containerStyle}>
        <Text style={styles.wordmark}>REVERB<Text style={styles.wordmarkDot}></Text></Text>
        <Text style={styles.eyebrow}>YOUR PERSONAL COLLECTION</Text>
        <Text style={styles.title}>Saved works</Text>
        <Text style={styles.body}>Sign in to keep your favorite works together in one place.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push("/auth")} style={styles.signInButton}>
          <Text style={styles.signInButtonText}>Sign in</Text>
          <ChevronRight color={colors.white} size={18} />
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.brandRow}>
          <Text style={styles.wordmark}>REVERB<Text style={styles.wordmarkDot}></Text></Text>
          <Link href="/(tabs)/account" accessibilityLabel="Open account" asChild>
            <Pressable style={styles.avatar}>
              {session.user.image
                ? <Image source={{ uri: session.user.image }} style={styles.avatarImage} />
                : <Text style={styles.avatarInitial}>{session.user.name.charAt(0).toUpperCase()}</Text>}
            </Pressable>
          </Link>
        </View>
        <ImageBackground source={LIBRARY_HERO_IMAGE} resizeMode="cover" style={styles.hero}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>YOUR PERSONAL COLLECTION</Text>
            <Text style={styles.heroTitle}>Saved works</Text>
            <Text style={styles.heroBody}>The works you have saved, gathered in one place.</Text>
          </View>
        </ImageBackground>
        {!loading && !error ? (
          <View style={styles.countPill}>
            <Bookmark color={colors.rust} size={16} />
            <Text style={styles.countText}>{works.length} {works.length === 1 ? "work" : "works"} saved</Text>
          </View>
        ) : null}
      </View>
      {loading ? <ActivityIndicator style={styles.center} color={colors.rust} /> : error ? (
        <View style={styles.errorState}>
          <Text style={styles.error}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => { setLoading(true); void load() }} style={styles.retryButton}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={works}
          keyExtractor={(work) => String(work.id)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={works.length || favoriteError ? (
            <View>
              {works.length ? <Text style={styles.sectionTitle}>Recently saved</Text> : null}
              {favoriteError ? <Text accessibilityRole="alert" style={styles.favoriteError}>{favoriteError}</Text> : null}
            </View>
          ) : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}><Bookmark color={colors.rust} size={25} /></View>
              <Text style={styles.emptyTitle}>A place for the works you want to keep.</Text>
              <Text style={styles.emptyCopy}>Save a work from its detail page and it will be waiting here.</Text>
              <Pressable accessibilityRole="button" onPress={() => router.replace("/(tabs)")} style={styles.discoverButton}>
                <Text style={styles.discoverButtonText}>Explore the archive</Text>
                <ChevronRight color={colors.white} size={17} />
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title} by ${item.artist}`}
                onPress={() => router.push(`/work/${item.id}`)}
                style={({ pressed }) => [styles.cardMain, pressed && styles.cardPressed]}
              >
                <View style={styles.artwork}>
                  {item.artworkUrl ? <Image source={{ uri: item.artworkUrl }} style={styles.artworkImage} /> : <Music2 color={colors.rust} size={25} />}
                </View>
                <View style={styles.cardContent}>
                  <Text numberOfLines={1} style={styles.workTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.artist}>{item.artist}</Text>
                  <View style={styles.workMeta}>
                    <Music2 color={colors.subtle} size={13} />
                    <Text numberOfLines={1} style={styles.metaText}>
                      {[item.genreName, formatDuration(item.duration)].filter(Boolean).join(" · ") || "Saved work"}
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title} from saved works`}
                accessibilityState={{ disabled: favoriteActionId !== null }}
                disabled={favoriteActionId !== null}
                onPress={() => void removeFavorite(item.id)}
                style={({ pressed }) => [styles.favoriteButton, pressed && styles.cardPressed, favoriteActionId !== null && styles.disabled]}
              >
                <Heart color={colors.rust} fill={colors.rust} size={22} />
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.paper, flex: 1, paddingHorizontal: 21 },
  header: { paddingBottom: 5 },
  brandRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  wordmark: { color: colors.ink, fontSize: 19, fontWeight: "900", letterSpacing: 3 },
  wordmarkDot: { color: colors.rust },
  avatar: { alignItems: "center", backgroundColor: colors.rustSoft, borderRadius: 22, height: 44, justifyContent: "center", overflow: "hidden", width: 44 },
  avatarImage: { height: "100%", width: "100%" },
  avatarInitial: { color: colors.rustDark, fontSize: 17, fontWeight: "700" },
  hero: { backgroundColor: colors.ink, height: 220, justifyContent: "flex-end", marginHorizontal: -21, padding: 20 },
  heroCopy: { maxWidth: "82%" },
  eyebrow: { color: colors.white, fontSize: 10, fontWeight: "700", letterSpacing: 1.8 },
  title: { color: colors.ink, fontFamily: "serif", fontSize: 36, fontWeight: "700", marginTop: 9 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  heroTitle: { color: colors.white, fontFamily: "serif", fontSize: 36, fontWeight: "700", marginTop: 9 },
  heroBody: { color: colors.white, fontSize: 14, lineHeight: 21, marginTop: 8 },
  countPill: { alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.card, borderRadius: 18, flexDirection: "row", gap: 8, marginTop: 16, paddingHorizontal: 13, paddingVertical: 9 },
  countText: { color: colors.rustDark, fontSize: 12, fontWeight: "700" },
  sectionTitle: { color: colors.ink, fontFamily: "serif", fontSize: 18, fontWeight: "700", marginBottom: 13, marginTop: 17 },
  list: { gap: 10, paddingBottom: 150 },
  card: { alignItems: "center", backgroundColor: colors.card, borderRadius: 20, flexDirection: "row", minHeight: 104, paddingHorizontal: 13, paddingVertical: 12, elevation: 1, shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  cardMain: { alignItems: "center", flex: 1, flexDirection: "row", minWidth: 0 },
  cardPressed: { opacity: 0.7 },
  artwork: { alignItems: "center", backgroundColor: colors.rustSoft, borderRadius: 14, height: 75, justifyContent: "center", overflow: "hidden", width: 75 },
  artworkImage: { height: "100%", width: "100%" },
  cardContent: { flex: 1, marginLeft: 13, minWidth: 0 },
  workTitle: { color: colors.ink, fontFamily: "serif", fontSize: 14, fontWeight: "700" },
  artist: { color: colors.muted, fontSize: 12, marginTop: 4 },
  workMeta: { alignItems: "center", flexDirection: "row", gap: 5, marginTop: 4 },
  metaText: { color: colors.subtle, flexShrink: 1, fontSize: 10 },
  favoriteButton: { alignItems: "center", height: 44, justifyContent: "center", marginLeft: 6, width: 38 },
  disabled: { opacity: 0.5 },
  favoriteError: { color: colors.danger, fontSize: 12, marginBottom: 6, textAlign: "center" },
  center: { marginTop: 40 },
  errorState: { alignItems: "center", backgroundColor: colors.card, borderRadius: 18, marginTop: 24, padding: 22 },
  error: { color: colors.danger, lineHeight: 20, textAlign: "center" },
  retryButton: { backgroundColor: colors.rustSoft, borderRadius: 18, marginTop: 14, paddingHorizontal: 15, paddingVertical: 9 },
  retry: { color: colors.rustDark, fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", backgroundColor: colors.card, borderRadius: 22, marginTop: 12, paddingHorizontal: 24, paddingVertical: 30 },
  emptyIcon: { alignItems: "center", backgroundColor: colors.rustSoft, borderRadius: 25, height: 50, justifyContent: "center", width: 50 },
  emptyTitle: { color: colors.ink, fontFamily: "serif", fontSize: 22, fontWeight: "700", marginTop: 14, textAlign: "center" },
  emptyCopy: { color: colors.muted, lineHeight: 20, marginTop: 8, textAlign: "center" },
  discoverButton: { alignItems: "center", backgroundColor: colors.rust, borderRadius: 22, flexDirection: "row", gap: 5, marginTop: 19, paddingHorizontal: 17, paddingVertical: 12 },
  discoverButtonText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  signInButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: colors.rust, borderRadius: 22, flexDirection: "row", gap: 8, marginTop: 22, paddingHorizontal: 18, paddingVertical: 12 },
  signInButtonText: { color: colors.white, fontSize: 13, fontWeight: "700" },
})
