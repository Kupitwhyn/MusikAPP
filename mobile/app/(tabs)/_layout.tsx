import { Redirect, Tabs } from "expo-router"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useSession } from "../../src/session"

export default function TabsLayout() {
  const { session, loading } = useSession()
  if (loading) return <View style={styles.loading}><ActivityIndicator /></View>
  if (session && session.user.role !== "AUDIENCE") return <Redirect href="/auth" />
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#1d1c1a", tabBarInactiveTintColor: "#8b877e", tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#e5e1d9" } }}>
    <Tabs.Screen name="index" options={{ title: "Discover" }} />
    <Tabs.Screen name="library" options={{ title: "Library" }} />
    <Tabs.Screen name="account" options={{ title: "Account" }} />
  </Tabs>
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", backgroundColor: "#f7f5f0", flex: 1, justifyContent: "center" },
})
