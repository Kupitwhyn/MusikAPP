import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSegments } from "expo-router"
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSession } from "./session"
import { isWorkAvailable } from "./api"
import { colors } from "./theme"

export type AudioTrack = {
  id: number
  title: string
  artist: string
  audioUrl: string
  duration: number | null
}

type AudioPlayerContextValue = {
  track: AudioTrack | null
  playing: boolean
  buffering: boolean
  currentTime: number
  duration: number
  playTrack: (track: AudioTrack) => void
  retryTrack: () => void
  pause: () => void
  stop: () => void
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null)
const TAB_PLAYER_BOTTOM_OFFSET = 60

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer(null, {
    preferredForwardBufferDuration: 30,
    updateInterval: 1000,
  })
  const status = useAudioPlayerStatus(player)
  const [trackState, setTrackState] = useState<{ track: AudioTrack; sessionId: string } | null>(null)
  const availabilityErrorLogged = useRef(false)
  const { session } = useSession()
  const segments = useSegments()
  const isWorkDetail = segments[0] === "work"
  const isTabScreen = segments[0] === "(tabs)"
  const track =
    session?.user.role === "AUDIENCE" && trackState?.sessionId === session.session.id
      ? trackState.track
      : null

  useEffect(() => {
    if (!session || session.user.role !== "AUDIENCE") {
      player.pause()
    }
  }, [player, session])

  useEffect(() => {
    if (!track || !session) return
    const interval = setInterval(() => {
      void isWorkAvailable(track.id).then((available) => {
        availabilityErrorLogged.current = false
        if (!available) {
          player.pause()
          setTrackState((current) => (current?.track.id === track.id ? null : current))
        }
      }).catch((cause: unknown) => {
        if (!availabilityErrorLogged.current) {
          console.error("Unable to verify audio availability. Check the API connection.", cause)
          availabilityErrorLogged.current = true
        }
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [player, session, track])

  const playTrack = useCallback((nextTrack: AudioTrack) => {
    if (!session || session.user.role !== "AUDIENCE") return
    if (track?.id !== nextTrack.id) {
      player.replace(nextTrack.audioUrl)
      setTrackState({ track: nextTrack, sessionId: session.session.id })
    }
    player.play()
  }, [player, session, track?.id])

  const retryTrack = useCallback(() => {
    if (!track) return
    if (status.currentTime <= 0) player.replace(track.audioUrl)
    player.play()
  }, [player, status.currentTime, track])

  const pause = useCallback(() => {
    player.pause()
  }, [player])

  const stop = useCallback(() => {
    player.pause()
    setTrackState(null)
  }, [player])

  const value = useMemo(
    () => ({
      track,
      playing: status.playing,
      buffering: status.isBuffering,
      currentTime: status.currentTime,
      duration: status.duration || track?.duration || 0,
      playTrack,
      retryTrack,
      pause,
      stop,
    }),
    [pause, playTrack, retryTrack, status.currentTime, status.duration, status.isBuffering, status.playing, stop, track],
  )

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      {track && !isWorkDetail ? <MiniPlayer isTabScreen={isTabScreen} /> : null}
    </AudioPlayerContext.Provider>
  )
}

export function useGlobalAudioPlayer() {
  const value = useContext(AudioPlayerContext)
  if (!value) throw new Error("useGlobalAudioPlayer must be used within AudioPlayerProvider")
  return value
}

function MiniPlayer({ isTabScreen }: { isTabScreen: boolean }) {
  const { track, playing, buffering, currentTime, duration, retryTrack, pause, stop } = useGlobalAudioPlayer()
  const insets = useSafeAreaInsets()
  if (!track) return null

  return (
    <View style={[styles.miniPlayer, { bottom: Math.max(insets.bottom, 10) + (isTabScreen ? TAB_PLAYER_BOTTOM_OFFSET : 8), left: Math.max(insets.left, 12), right: Math.max(insets.right, 12) }]}>
      <View style={styles.miniCopy}>
        <Text numberOfLines={1} style={styles.miniTitle}>{track.title}</Text>
        <Text numberOfLines={1} style={styles.miniArtist}>{buffering ? "Buffering audio…" : `${track.artist}${duration > 0 ? ` · ${formatTime(currentTime)} / ${formatTime(duration)}` : ""}`}</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={playing ? "Pause audio" : "Play audio"} onPress={() => playing ? pause() : retryTrack()} style={styles.miniButton}>
        <Text style={styles.miniButtonText}>{playing ? "Pause" : "Play"}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Stop audio" onPress={stop} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>×</Text>
      </Pressable>
    </View>
  )
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00"
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`
}

const styles = StyleSheet.create({
  miniPlayer: { alignItems: "center", backgroundColor: colors.dark, borderColor: "#58483B", borderRadius: 34, borderWidth: 1, elevation: 7, flexDirection: "row", left: 12, minHeight: 66, paddingHorizontal: 16, paddingVertical: 9, position: "absolute", right: 12, shadowColor: colors.ink, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 8, zIndex: 10 },
  miniCopy: { flex: 1, marginRight: 8 },
  miniTitle: { color: colors.white, fontFamily: "serif", fontSize: 14, fontWeight: "700" },
  miniArtist: { color: colors.darkMuted, fontSize: 10, marginTop: 3 },
  miniButton: { backgroundColor: colors.rust, borderRadius: 20, minWidth: 72, paddingHorizontal: 14, paddingVertical: 9 },
  miniButtonText: { color: colors.white, fontSize: 12, fontWeight: "700", textAlign: "center" },
  closeButton: { alignItems: "center", justifyContent: "center", marginLeft: 9, minHeight: 36, minWidth: 28 },
  closeButtonText: { color: colors.darkMuted, fontSize: 22, lineHeight: 25 },
})
