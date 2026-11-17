
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const XP_PER_LEVEL = 500;

export default function Profile() {
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = async () => {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setSigningOut(false);
      Alert.alert('Não foi possível sair', error.message);
    }
    // On success, the auth guard sends the user to /login.
  };

  if (profileLoading && !profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FFD34E" />
      </View>
    );
  }

  const username = profile?.username ?? user?.user_metadata?.username ?? 'Pequeno Programador';
  const xp = profile?.xp ?? 0;
  const stars = profile?.stars ?? 0;
  const level = profile?.level ?? 1;
  const xpIntoLevel = xp % XP_PER_LEVEL;
  const progress = Math.min(xpIntoLevel / XP_PER_LEVEL, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Meu Perfil</Text>

      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{username.trim().charAt(0).toUpperCase() || '?'}</Text>
        </View>
        <Text style={styles.name}>{username}</Text>
        {!!user?.email && <Text style={styles.email}>{user.email}</Text>}
      </View>

      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <Text style={styles.levelLabel}>NÍVEL {level}</Text>
          <Text style={styles.levelXp}>
            {xpIntoLevel} / {XP_PER_LEVEL} XP
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.max(progress * 100, 2)}%` }]} />
        </View>
        <Text style={styles.levelHint}>
          Faltam {XP_PER_LEVEL - xpIntoLevel} XP para o nível {level + 1}
        </Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>XP TOTAL</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stars}</Text>
          <Text style={styles.statLabel}>ESTRELAS</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>NÍVEL</Text>
        </View>
      </View>

      {!profile && (
        <TouchableOpacity style={styles.retry} onPress={refreshProfile} activeOpacity={0.8}>
          <Text style={styles.retryText}>Não carregamos seus dados. Toque para tentar de novo.</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.logout, signingOut && { opacity: 0.7 }]}
        onPress={handleLogout}
        disabled={signingOut}
        activeOpacity={0.85}
      >
        {signingOut ? (
          <ActivityIndicator color="#FF8585" />
        ) : (
          <Text style={styles.logoutText}>SAIR DA CONTA</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#102D52' },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, width: '100%', maxWidth: 560, alignSelf: 'center' },
  title: { color: '#FFD34E', fontSize: 25, fontWeight: '900' },
  hero: { alignItems: 'center', marginTop: 28 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFD34E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#23568B',
  },
  avatarText: { color: '#102D52', fontSize: 42, fontWeight: '900' },
  name: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', marginTop: 14 },
  email: { color: '#A9B5C7', fontSize: 14, marginTop: 4 },
  levelCard: { backgroundColor: '#23568B', padding: 20, borderRadius: 20, marginTop: 28 },
  levelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  levelLabel: { color: '#FFD34E', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  levelXp: { color: '#D6E5F5', fontSize: 14, fontWeight: 'bold' },
  track: { height: 12, backgroundColor: '#071A30', borderRadius: 6, marginTop: 14, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#FFD34E', borderRadius: 6 },
  levelHint: { color: '#D6E5F5', fontSize: 13, marginTop: 12 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 16 },
  stat: { flex: 1, backgroundColor: '#183D70', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  statValue: { color: '#FFFFFF', fontSize: 26, fontWeight: '900' },
  statLabel: { color: '#A9B5C7', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.6, marginTop: 4 },
  retry: { marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: '#183D70' },
  retryText: { color: '#FFD34E', textAlign: 'center', fontSize: 13, fontWeight: 'bold' },
  logout: {
    marginTop: 32,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FF8585',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: { color: '#FF8585', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
});
