import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSegments } from "expo-router"
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio"
import { useSession } from "./session"
import { isWorkAvailable } from "./api"

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

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const player = useAudioPlayer(null, {
    preferredForwardBufferDuration: 30,
    updateInterval: 1000,
  })
  const status = useAudioPlayerStatus(player)
  const [trackState, setTrackState] = useState<{ track: AudioTrack; sessionId: string } | null>(null)
  const { session } = useSession()
  const segments = useSegments()
  const isWorkDetail = segments[0] === "work"
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
        if (!available) {
          player.pause()
          setTrackState((current) => (current?.track.id === track.id ? null : current))
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
      {track && !isWorkDetail ? <MiniPlayer /> : null}
    </AudioPlayerContext.Provider>
  )
}

export function useGlobalAudioPlayer() {
  const value = useContext(AudioPlayerContext)
  if (!value) throw new Error("useGlobalAudioPlayer must be used within AudioPlayerProvider")
  return value
}

function MiniPlayer() {
  const { track, playing, buffering, currentTime, duration, retryTrack, pause, stop } = useGlobalAudioPlayer()
  if (!track) return null

  return (
    <View style={styles.miniPlayer}>
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
  miniPlayer: { alignItems: "center", backgroundColor: "#1d1c1a", bottom: 68, flexDirection: "row", left: 12, padding: 10, position: "absolute", right: 12, zIndex: 10 },
  miniCopy: { flex: 1, marginRight: 8 },
  miniTitle: { color: "#f7f5f0", fontSize: 14, fontWeight: "700" },
  miniArtist: { color: "#d8d3ca", fontSize: 11, marginTop: 3 },
  miniButton: { borderColor: "#d8d3ca", borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  miniButtonText: { color: "#f7f5f0", fontSize: 12, fontWeight: "700" },
  closeButton: { marginLeft: 8, padding: 4 },
  closeButtonText: { color: "#d8d3ca", fontSize: 22, lineHeight: 22 },
})
