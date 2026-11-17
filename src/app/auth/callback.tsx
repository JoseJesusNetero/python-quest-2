import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/context/AuthContext';

const WAIT_MS = 12000;

// Landing screen for the confirmation e-mail link. When the session starts,
// the route guard sends the user straight into the app.
export default function AuthCallback() {
  const router = useRouter();
  const { linkError, clearLinkError } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), WAIT_MS);
    return () => clearTimeout(t);
  }, []);

  const failed = !!linkError || timedOut;

  const goToLogin = () => {
    clearLinkError();
    router.replace('/login');
  };

  return (
    <View style={styles.root}>
      {failed ? (
        <View style={styles.box}>
          <Text style={styles.title}>Não foi possível confirmar</Text>
          <Text style={styles.text}>
            {linkError ??
              'A confirmação demorou mais que o esperado. Tente entrar com seu e-mail e senha.'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={goToLogin} activeOpacity={0.85}>
            <Text style={styles.buttonText}>IR PARA O LOGIN</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.box}>
          <ActivityIndicator size="large" color="#FFD34E" />
          <Text style={[styles.title, { marginTop: 20 }]}>Confirmando seu e-mail…</Text>
          <Text style={styles.text}>Só um instante, já vamos te levar para a aventura.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#102D52', alignItems: 'center', justifyContent: 'center', padding: 24 },
  box: { width: '100%', maxWidth: 400, alignItems: 'center' },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  text: { color: '#D6E5F5', fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  button: {
    backgroundColor: '#F6B93B',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: 24,
  },
  buttonText: { color: '#102D52', fontWeight: '900', fontSize: 14, letterSpacing: 0.4 },
});
