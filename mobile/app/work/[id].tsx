import { useEffect, useState } from "react"
import { Link, useLocalSearchParams, useRouter } from "expo-router"
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { fetchWork, getFavoriteStatus, toggleFavorite, type PublicWorkDetail } from "../../src/api"
import { useSession } from "../../src/session"
import { useGlobalAudioPlayer } from "../../src/audio-player"
import { colors } from "../../src/theme"

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [work, setWork] = useState<PublicWorkDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [favoriteError, setFavoriteError] = useState<string | null>(null)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const { session, loading: sessionLoading } = useSession()
  const router = useRouter()
  const { track, playing, currentTime, duration, playTrack, retryTrack, pause } = useGlobalAudioPlayer()

  useEffect(() => { if (id) void fetchWork(id).then(setWork).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load work")) }, [id])
  useEffect(() => { if (session && id) void getFavoriteStatus(Number(id)).then(setFavorited).catch(() => undefined) }, [id, session])

  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable onPress={() => { setError(null); if (id) void fetchWork(id).then(setWork).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load work")) }}><Text style={styles.retry}>Try again</Text></Pressable></View>
  if (!sessionLoading && session?.user.role !== "AUDIENCE") return <View style={styles.center}><Text style={styles.title}>Sign in to listen</Text><Text style={styles.error}>Create or sign in to an audience account before opening and playing works.</Text><Pressable onPress={() => router.replace("/auth")} style={styles.authButton}><Text style={styles.authButtonText}>Sign in or register</Text></Pressable></View>
  if (!work) return <View style={styles.center}><ActivityIndicator /></View>
  const active = track?.id === work.id
  return <ScrollView style={styles.container} contentContainerStyle={styles.content}><View style={styles.artwork}>{work.artworkUrl ? <Image source={{ uri: work.artworkUrl }} style={styles.artworkImage} resizeMode="cover" /> : <Text style={styles.artworkText}>♪</Text>}</View><Text style={styles.eyebrow}>PUBLISHED WORK</Text><Text style={styles.title}>{work.title}</Text><Link href={`/musician/${work.musicianId}`} style={styles.artist}>{work.artist}</Link><View style={styles.actionRow}><Pressable disabled={favoriteLoading} onPress={() => { if (!session) { router.push("/auth"); return }; setFavoriteError(null); setFavoriteLoading(true); void toggleFavorite(work.id).then(setFavorited).catch((cause: unknown) => setFavoriteError(cause instanceof Error ? cause.message : "Unable to update library")).finally(() => setFavoriteLoading(false)) }} style={({ pressed }) => [styles.favoriteButton, pressed && styles.actionPressed, favoriteLoading && styles.disabled]}><Text style={styles.favoriteText}>{favoriteLoading ? "Updating..." : favorited ? "Saved to library" : "Add to library"}</Text></Pressable><Link href="/(tabs)/library" style={styles.libraryButton}>Library</Link></View>{favoriteError ? <Text accessibilityRole="alert" style={styles.favoriteError}>{favoriteError}</Text> : null}<Pressable accessibilityRole="button" accessibilityLabel={active && playing ? "Pause audio" : "Play audio"}   onPress={() => active ? (playing ? pause() : retryTrack()) : playTrack({ id: work.id, title: work.title, artist: work.artist, audioUrl: work.audioUrl, duration: work.duration })} style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed]}><Text style={styles.playButtonText}>{active && playing ? "Pause" : "Play"}</Text>{active && duration > 0 ? <Text style={styles.playTime}>{formatTime(currentTime)} / {formatTime(duration)}</Text> : null}</Pressable><View style={styles.metaGrid}><Meta label="Genre" value={work.genreName} /><Meta label="Project" value={work.projectTitle} /><Meta label="Created" value={work.createdDate} /><Meta label="Released" value={work.releasedDate} /><Meta label="Composer" value={work.composer} /><Meta label="Producer" value={work.producer} /><Meta label="Recording" value={work.recording} /><Meta label="Version" value={work.version} /></View>{work.lyrics ? <><Text style={styles.section}>Lyrics</Text><Text style={styles.lyrics}>{work.lyrics}</Text></> : null}</ScrollView>
}
function Meta({ label, value }: { label: string; value: string | null }) { return <View style={styles.metaItem}><Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue}>{value || "—"}</Text></View> }
function formatTime(seconds: number) { if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"; const minutes = Math.floor(seconds / 60); return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}` }
const styles = StyleSheet.create({
  container: { backgroundColor: colors.paper, flex: 1 },
  content: { alignItems: "center", padding: 22, paddingBottom: 48 },
  artwork: { alignItems: "center", alignSelf: "center", backgroundColor: colors.rustSoft, borderRadius: 8, height: 320, justifyContent: "center", marginBottom: 28, maxWidth: 360, overflow: "hidden", width: "100%" },
  artworkImage: { height: "100%", width: "100%" },
  artworkText: { color: colors.rust, fontSize: 72 },
  eyebrow: { alignSelf: "flex-start", color: colors.rust, fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  title: { alignSelf: "flex-start", color: colors.ink, fontFamily: "serif", fontSize: 36, fontWeight: "700", lineHeight: 41, marginTop: 8 },
  artist: { alignSelf: "flex-start", color: colors.rust, fontSize: 16, marginTop: 8 },
  actionRow: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 },
  favoriteButton: { borderColor: colors.line, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  libraryButton: { backgroundColor: colors.rustSoft, borderRadius: 20, color: colors.rustDark, paddingHorizontal: 15, paddingVertical: 10 },
  actionPressed: { opacity: 0.7 },
  disabled: { opacity: 0.5 },
  favoriteText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  favoriteError: { alignSelf: "flex-start", color: colors.danger, fontSize: 12, marginTop: 8 },
  playButton: { alignItems: "center", alignSelf: "stretch", backgroundColor: colors.rust, borderRadius: 13, flexDirection: "row", justifyContent: "space-between", marginTop: 23, paddingHorizontal: 20, paddingVertical: 17 },
  playButtonPressed: { backgroundColor: colors.rustDark },
  playButtonText: { color: colors.white, fontSize: 15, fontWeight: "800", letterSpacing: 0.3 },
  playTime: { color: "#F3DCCB", fontSize: 12 },
  metaGrid: { alignSelf: "stretch", backgroundColor: colors.card, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: "row", flexWrap: "wrap", marginTop: 27, padding: 17 },
  metaItem: { marginBottom: 16, width: "50%" },
  metaLabel: { color: colors.subtle, fontSize: 9, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  metaValue: { color: colors.ink, fontSize: 14, marginTop: 5 },
  section: { alignSelf: "flex-start", color: colors.ink, fontFamily: "serif", fontSize: 23, fontWeight: "700", marginTop: 24 },
  lyrics: { alignSelf: "stretch", color: colors.muted, fontSize: 15, lineHeight: 24, marginTop: 10 },
  center: { alignItems: "center", backgroundColor: colors.paper, flex: 1, justifyContent: "center", padding: 24 },
  error: { color: colors.danger, textAlign: "center" },
  retry: { color: colors.rust, marginTop: 14, textDecorationLine: "underline" },
  authButton: { backgroundColor: colors.rust, borderRadius: 12, marginTop: 20, paddingHorizontal: 17, paddingVertical: 14 },
  authButtonText: { color: colors.white, fontWeight: "700" },
})
