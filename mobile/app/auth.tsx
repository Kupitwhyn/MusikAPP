import { useState } from "react"
import { useRouter } from "expo-router"
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from "react-native"
import { signIn, signUp } from "../src/api"
import { useSession } from "../src/session"
import { colors } from "../src/theme"

export default function AuthScreen() {
  const router = useRouter()
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { refreshSession, signOut } = useSession()

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      if (mode === "sign-up") await signUp(name.trim(), email.trim(), password)
      else await signIn(email.trim(), password)
      const currentSession = await refreshSession()
      if (currentSession?.user.role !== "AUDIENCE") {
        await signOut()
        throw new Error("This account is for the web application. Use an AUDIENCE account on mobile.")
      }
      router.replace("/(tabs)")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to complete authentication")
    } finally {
      setLoading(false)
    }
  }

  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}><Text style={styles.eyebrow}>REVERB AUDIENCE</Text><Text style={styles.title}>{mode === "sign-in" ? "Welcome back" : "Create listener account"}</Text><Text style={styles.subtitle}>{mode === "sign-in" ? "Sign in to access your saved works." : "Create an audience account to save and play music."}</Text>{mode === "sign-up" ? <TextInput value={name} onChangeText={setName} placeholder="Your name" autoComplete="name" style={styles.input} /> : null}<TextInput value={email} onChangeText={setEmail} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={styles.input} /><TextInput value={password} onChangeText={setPassword} placeholder="Password (at least 8 characters)" secureTextEntry autoComplete={mode === "sign-up" ? "new-password" : "current-password"} style={styles.input} /><Pressable disabled={loading} onPress={() => void submit()} style={({ pressed }) => [styles.button, pressed && styles.pressed, loading && styles.disabled]}><Text style={styles.buttonText}>{loading ? "Loading..." : mode === "sign-in" ? "Sign in" : "Create audience account"}</Text></Pressable>{error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}<Pressable onPress={() => { setMode(mode === "sign-in" ? "sign-up" : "sign-in"); setError(null) }}><Text style={styles.switch}>{mode === "sign-in" ? "Need an account? Create one" : "Already registered? Sign in"}</Text></Pressable></KeyboardAvoidingView>
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.paper, flex: 1, padding: 25, paddingTop: 58 },
  eyebrow: { color: colors.rust, fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  title: { color: colors.ink, fontFamily: "serif", fontSize: 35, fontWeight: "700", marginTop: 12 },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 22, marginBottom: 27, marginTop: 9 },
  input: { backgroundColor: colors.card, borderColor: colors.line, borderRadius: 12, borderWidth: 1, color: colors.ink, fontSize: 15, marginBottom: 12, paddingHorizontal: 15, paddingVertical: 14 },
  button: { alignItems: "center", backgroundColor: colors.rust, borderRadius: 24, marginTop: 8, paddingVertical: 15 },
  buttonText: { color: colors.white, fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.5 },
  error: { color: colors.danger, marginTop: 16 },
  switch: { color: colors.rust, fontSize: 13, fontWeight: "600", marginTop: 24, textAlign: "center", textDecorationLine: "underline" },
})
