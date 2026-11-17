
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const worlds = [
  ['🌱', 'Mundo 1', 'Vila dos Algoritmos', 'print() e primeiros comandos'],
  ['🌳', 'Mundo 2', 'Floresta das Variáveis', 'Variáveis e cálculos'],
  ['🏰', 'Mundo 3', 'Castelo das Decisões', 'if e else'],
  ['🔁', 'Mundo 4', 'Reino dos Loops', 'Repetições'],
  ['🐉', 'Mundo 5', 'Desafio Final', 'Funções e projetos'],
];

export default function Worlds() {
  const router = useRouter();

  const [unlockedWorlds, setUnlockedWorlds] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await AsyncStorage.getItem(
          '@pythonquest/unlockedWorlds'
        );

        if (savedProgress !== null) {
          const progress = Number.parseInt(savedProgress, 10);

          if (Number.isFinite(progress) && progress >= 1) {
            setUnlockedWorlds(Math.min(progress, worlds.length));
          }
        }
      } catch (error) {
        console.log('Erro ao carregar progresso:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    loadProgress();
  }, []);

  const openWorld = (index) => {
    if (index === 0) {
      router.push('/lesson');
    } else if (index === 1) {
      router.push('/lesson2');
    } else if (index === 2) {
      router.push('/lesson3');
    } else if (index === 3) {
      router.push('/lesson4');
    } else if (index === 4) {
      router.push('/lesson5');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗺️ Mapa das Aventuras</Text>

      {worlds.map((world, index) => {
        const unlocked = index < unlockedWorlds;
        const disabled = !unlocked || loadingProgress;

        return (
          <TouchableOpacity
            key={index}
            style={[styles.card, !unlocked && styles.lockedCard]}
            disabled={disabled}
            activeOpacity={0.7}
            onPress={() => openWorld(index)}
          >
            <Text style={styles.emoji}>{world[0]}</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {world[1]}: {world[2]}
              </Text>

              <Text style={styles.description}>
                {world[3]}
              </Text>
            </View>

            <Text style={styles.lock}>
              {unlocked ? '▶' : '🔒'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#102D52',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    color: '#FFD34E',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#23568B',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  lockedCard: {
    opacity: 0.6,
  },
  emoji: {
    fontSize: 34,
  },
  name: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  description: {
    color: '#D6E5F5',
    fontSize: 12,
    marginTop: 5,
  },
  lock: {
    fontSize: 22,
  },
});
