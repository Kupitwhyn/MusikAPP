import { Stack } from "expo-router"
import { SessionProvider } from "../src/session"
import { AudioPlayerProvider } from "../src/audio-player"

export default function Layout() {
  return <SessionProvider><AudioPlayerProvider><Stack screenOptions={{ headerStyle: { backgroundColor: "#f7f5f0" }, headerTintColor: "#1d1c1a", headerShadowVisible: false }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="auth" options={{ title: "Sign in" }} />
    <Stack.Screen name="work/[id]" options={{ title: "Work" }} />
    <Stack.Screen name="musician/[id]" options={{ title: "Musician" }} />
  </Stack></AudioPlayerProvider></SessionProvider>
}
