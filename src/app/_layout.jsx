if (typeof document !== 'undefined' && String(console.error).indexOf('gvSvgOrigin') < 0) {
  var __gvConsoleError = console.error;
  console.error = function gvSvgOrigin() {
    var __gvMsg = Array.prototype.join.call(arguments, ' ');
    if (__gvMsg.indexOf('Invalid DOM property') >= 0 && __gvMsg.indexOf('transform-origin') >= 0) return;
    return __gvConsoleError.apply(console, Array.prototype.slice.call(arguments));
  };
}

if (typeof document !== 'undefined' && !document.getElementById('genvibe-inspector')) {
  var __gvInspector = document.createElement('script');
  __gvInspector.id = 'genvibe-inspector';
  __gvInspector.src = 'https://genvibe.pro/inspector-script.js?v=e2b-reload1';
  document.head.appendChild(__gvInspector);
}


import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';

function AuthGate() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const onLogin = segments[0] === 'login';
  // /auth/callback is where the confirmation e-mail link lands
  const onAuthCallback = segments[0] === 'auth';
  const loggedIn = !!session;
  const onPublic = onLogin || onAuthCallback;

  useEffect(() => {
    if (loading) return;
    if (!loggedIn && !onPublic) {
      router.replace('/login');
    } else if (loggedIn && onPublic) {
      // Logged in (also right after confirming the e-mail): straight to the app
      router.replace('/(tabs)');
    }
  }, [loading, loggedIn, onPublic, router]);

  // Cover the screen until we know where the user belongs (avoids flashing protected content)
  const blocking = loading || (!loggedIn && !onPublic) || (loggedIn && onPublic);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="lesson" />
      </Stack>
      {blocking && (
        <View style={styles.splash}>
          <ActivityIndicator size="large" color="#FFD34E" />
        </View>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#102D52' },
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#102D52',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
