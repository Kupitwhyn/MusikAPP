import { Redirect, Tabs } from "expo-router"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useSession } from "../../src/session"
import { colors } from "../../src/theme"

const TAB_BAR_CONTENT_HEIGHT = 52
const TAB_BAR_BOTTOM_GAP = 3

export default function TabsLayout() {
  const { session, loading } = useSession()
  const insets = useSafeAreaInsets()
  if (loading) return <View style={styles.loading}><ActivityIndicator /></View>
  if (session && session.user.role !== "AUDIENCE") return <Redirect href="/auth" />
  const tabBarBottomPadding = Math.max(insets.bottom, 7) + TAB_BAR_BOTTOM_GAP
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.rust, tabBarInactiveTintColor: colors.subtle, tabBarLabelStyle: { fontSize: 11, fontWeight: "600" }, tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line, height: TAB_BAR_CONTENT_HEIGHT + tabBarBottomPadding, paddingTop: 7, paddingBottom: tabBarBottomPadding } }}>
    <Tabs.Screen name="index" options={{ title: "Discover", tabBarAccessibilityLabel: "Discover", tabBarIcon: ({ focused }) => <TabIcon name="discover" focused={focused} /> }} />
    <Tabs.Screen name="library" options={{ title: "Library", tabBarAccessibilityLabel: "Library", tabBarIcon: ({ focused }) => <TabIcon name="library" focused={focused} /> }} />
    <Tabs.Screen name="account" options={{ title: "Account", tabBarAccessibilityLabel: "Account", tabBarIcon: ({ focused }) => <TabIcon name="account" focused={focused} /> }} />
  </Tabs>
}

function TabIcon({ name, focused }: { name: "discover" | "library" | "account"; focused: boolean }) {
  const color = focused ? colors.rust : colors.subtle
  if (name === "discover") {
    return <View style={styles.iconFrame}>
      <View style={[styles.homeRoofLeft, { backgroundColor: color }]} />
      <View style={[styles.homeRoofRight, { backgroundColor: color }]} />
      <View style={[styles.homeBody, { borderColor: color }]}>
        <View style={[styles.homeDoor, { borderColor: color }]} />
      </View>
    </View>
  }
  if (name === "library") {
    return <View style={styles.iconFrame}>
      <View style={[styles.libraryLayer, styles.libraryTop, { borderColor: color }]} />
      <View style={[styles.libraryLayer, styles.libraryMiddle, { borderColor: color }]} />
      <View style={[styles.libraryLayer, styles.libraryBottom, { borderColor: color }]} />
    </View>
  }
  return <View style={styles.iconFrame}>
    <View style={[styles.accountHead, { borderColor: color }]} />
    <View style={[styles.accountBody, { borderColor: color }]} />
  </View>
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", backgroundColor: colors.paper, flex: 1, justifyContent: "center" },
  iconFrame: { alignItems: "center", height: 24, justifyContent: "center", position: "relative", width: 24 },
  homeRoofLeft: { borderTopLeftRadius: 1, height: 2, left: 3, position: "absolute", top: 5, transform: [{ rotate: "-45deg" }], width: 11 },
  homeRoofRight: { borderTopRightRadius: 1, height: 2, position: "absolute", right: 3, top: 5, transform: [{ rotate: "45deg" }], width: 11 },
  homeBody: { alignItems: "center", borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderBottomWidth: 2, borderLeftWidth: 2, borderRightWidth: 2, bottom: 2, height: 13, justifyContent: "flex-end", position: "absolute", width: 16 },
  homeDoor: { borderTopLeftRadius: 2, borderTopRightRadius: 2, borderWidth: 1.5, height: 7, width: 5 },
  libraryLayer: { borderRadius: 2, borderWidth: 1.8, height: 5, position: "absolute", width: 17 },
  libraryTop: { top: 3 },
  libraryMiddle: { top: 9 },
  libraryBottom: { top: 15 },
  accountHead: { borderRadius: 6, borderWidth: 1.8, height: 8, position: "absolute", top: 2, width: 8 },
  accountBody: { borderTopLeftRadius: 9, borderTopRightRadius: 9, borderWidth: 1.8, bottom: 1, height: 10, position: "absolute", width: 17 },
})
