import { Stack } from "expo-router"
import { SessionProvider } from "../src/session"
import { AudioPlayerProvider } from "../src/audio-player"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { colors } from "../src/theme"

export default function Layout() {
  return <SafeAreaProvider><SessionProvider><AudioPlayerProvider><Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.ink, headerShadowVisible: false, contentStyle: { backgroundColor: colors.paper } }}>
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="auth" options={{ title: "Sign in" }} />
    <Stack.Screen name="work/[id]" options={{ title: "Work" }} />
    <Stack.Screen name="musician/[id]" options={{ title: "Musician" }} />
  </Stack></AudioPlayerProvider></SessionProvider></SafeAreaProvider>
}
