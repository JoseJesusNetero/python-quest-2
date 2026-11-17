
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { awardLessonXp } from '@/lib/progress';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function Lesson2() {
  const router = useRouter();
  const { addXp } = useAuth();

  const [answer, setAnswer] = useState('');
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const checkAnswer = async () => {
    const normalized = answer
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/['"]/g, '');

    const isCorrect = normalized === 'idade=10print(idade)';

    if (isCorrect) {
      try {
        await AsyncStorage.setItem(
          '@pythonquest/unlockedWorlds',
          '3'
        );

        setFeedback('🎉 Excelente! Você aprendeu a usar variáveis!');
        setCompleted(true);
        await awardLessonXp(addXp);
      } catch (error) {
        setFeedback(
          'Não foi possível salvar seu progresso. Tente novamente.'
        );
        setCompleted(false);
      }
    } else {
      setFeedback(
        '🤔 Ainda não! Crie a variável idade com valor 10 e depois use print(idade).'
      );
      setCompleted(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        <Text style={styles.world}>🌳 MUNDO 2</Text>

        <Text style={styles.title}>
          Floresta das Variáveis
        </Text>

        <Text style={styles.subtitle}>
          Aula 1: Aprendendo a criar variáveis
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📚 O que são variáveis?
          </Text>

          <Text style={styles.description}>
            Uma variável é como uma pequena caixa onde podemos
            guardar informações.
          </Text>

          <Text style={styles.description}>
            Podemos armazenar números, textos e outros valores
            para utilizar durante um programa.
          </Text>
        </View>

        <View style={styles.example}>
          <Text style={styles.exampleTitle}>
            💻 Exemplo de código
          </Text>

          <View style={styles.code}>
            <Text style={styles.codeText}>
              idade = 10
            </Text>

            <Text style={styles.codeText}>
              print(idade)
            </Text>
          </View>

          <Text style={styles.outputTitle}>
            Resultado:
          </Text>

          <Text style={styles.output}>
            10
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🧠 Seu segundo desafio
          </Text>

          <Text style={styles.description}>
            Vamos criar uma variável chamada idade e guardar
            o número 10 nela.
          </Text>

          <Text style={styles.question}>
            Escreva duas linhas de código:
          </Text>

          <Text style={styles.target}>
            1. idade = 10
            {'\n'}
            2. print(idade)
          </Text>

          <TextInput
            style={styles.input}
            placeholder={'idade = 10\nprint(idade)'}
            placeholderTextColor="#A9B5C7"
            value={answer}
            onChangeText={(text) => {
              setAnswer(text);
              setFeedback('');
              setCompleted(false);
            }}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={checkAnswer}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              VERIFICAR CÓDIGO
            </Text>
          </TouchableOpacity>

          {feedback !== '' && (
            <Text
              style={[
                styles.feedback,
                completed ? styles.success : styles.error,
              ]}
            >
              {feedback}
            </Text>
          )}
        </View>

        {completed && (
          <View style={styles.reward}>
            <Text style={styles.rewardEmoji}>🏆</Text>

            <Text style={styles.rewardTitle}>
              FASE CONCLUÍDA!
            </Text>

            <Text style={styles.rewardDescription}>
              Você aprendeu a criar e utilizar variáveis em Python!
            </Text>

            <Text style={styles.points}>
              ⭐ +100 XP
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/worlds')}
            >
              <Text style={styles.buttonText}>
                VOLTAR AO MAPA
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ← Voltar
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
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
    paddingBottom: 50,
  },
  world: {
    color: '#FFD34E',
    fontSize: 15,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    color: '#D6E5F5',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#23568B',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },
  cardTitle: {
    color: '#FFD34E',
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 10,
  },
  example: {
    backgroundColor: '#183D70',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },
  exampleTitle: {
    color: '#FFD34E',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  code: {
    backgroundColor: '#071A30',
    padding: 18,
    borderRadius: 12,
  },
  codeText: {
    color: '#72E6A1',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  outputTitle: {
    color: '#FFFFFF',
    marginTop: 18,
    fontWeight: 'bold',
  },
  output: {
    color: '#72E6A1',
    fontSize: 17,
    marginTop: 8,
  },
  question: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 23,
  },
  target: {
    color: '#72E6A1',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 15,
    lineHeight: 30,
  },
  input: {
    backgroundColor: '#071A30',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    minHeight: 110,
    textAlignVertical: 'top',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#4779AA',
  },
  button: {
    backgroundColor: '#F6B93B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#102D52',
    fontWeight: '900',
    fontSize: 14,
  },
  feedback: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 18,
    textAlign: 'center',
  },
  success: {
    color: '#72E6A1',
  },
  error: {
    color: '#FF8585',
  },
  reward: {
    backgroundColor: '#23568B',
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  rewardEmoji: {
    fontSize: 55,
  },
  rewardTitle: {
    color: '#FFD34E',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 12,
  },
  rewardDescription: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
  },
  points: {
    color: '#72E6A1',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 15,
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
});
