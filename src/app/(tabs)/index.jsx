
import { useRouter } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>🍄 PYTHON QUEST</Text>
            <Text style={styles.subtitle}>Sua aventura começa aqui!</Text>
          </View>

          <View style={styles.coins}>
            <Text style={styles.coinText}>🪙 000</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏰</Text>
          <Text style={styles.heroTitle}>Olá, aventureiro!</Text>
          <Text style={styles.heroText}>
            Prepare-se para explorar mundos e aprender
            Python enquanto se diverte!
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.playButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/worlds')}
          >
            <Text style={styles.playText}>
              ▶ COMEÇAR AVENTURA
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>
          ⭐ SUA JORNADA
        </Text>

        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🗺️</Text>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Mundos</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Estrelas</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🎮</Text>
            <Text style={styles.statNumber}>1</Text>
            <Text style={styles.statLabel}>Nível</Text>
          </View>
        </View>

        <View style={styles.mission}>
          <Text style={styles.missionTitle}>
            🎯 MISSÃO DO DIA
          </Text>
          <Text style={styles.missionText}>
            Descubra como fazer o computador falar com
            o comando print()!
          </Text>
          <Pressable
            style={styles.missionButton}
            onPress={() => router.push('/learn')}
          >
            <Text style={styles.missionButtonText}>
              APRENDER AGORA →
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>
          Cada linha de código é uma nova aventura!
        </Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#102D52',
  },
  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  logo: {
    color: '#FFD34E',
    fontSize: 23,
    fontWeight: '900',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 5,
  },
  coins: {
    backgroundColor: '#244A76',
    padding: 10,
    borderRadius: 15,
  },
  coinText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  hero: {
    backgroundColor: '#23568B',
    borderRadius: 25,
    padding: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#477FB4',
  },
  heroEmoji: {
    fontSize: 85,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#FFD34E',
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  heroText: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 12,
    marginBottom: 22,
  },
  playButton: {
    backgroundColor: '#F5B942',
    width: '100%',
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#B87919',
  },
  playText: {
    color: '#38264C',
    fontWeight: '900',
    fontSize: 16,
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  sectionTitle: {
    color: '#FFD34E',
    fontWeight: '900',
    fontSize: 18,
    marginTop: 28,
    marginBottom: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#23568B',
    paddingVertical: 15,
    borderRadius: 17,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 25,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 5,
  },
  statLabel: {
    color: '#D6E5F5',
    fontSize: 12,
  },
  mission: {
    backgroundColor: '#FFF0C7',
    padding: 18,
    borderRadius: 20,
    marginTop: 25,
  },
  missionTitle: {
    color: '#8B5616',
    fontSize: 16,
    fontWeight: '900',
  },
  missionText: {
    color: '#493A29',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  missionButton: {
    backgroundColor: '#E9A52D',
    padding: 13,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  missionButtonText: {
    color: '#38264C',
    fontWeight: '900',
  },
  footer: {
    color: '#AFC7E2',
    textAlign: 'center',
    marginTop: 25,
    fontSize: 12,
  },
});
