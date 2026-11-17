
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { awardLessonXp } from '@/lib/progress';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Lesson3() {
  const router = useRouter();
  const { addXp } = useAuth();

  const [answer, setAnswer] = useState('');
  const [completed, setCompleted] = useState(false);
  const [feedback, setFeedback] = useState('');

  const checkAnswer = async () => {
    const normalized = answer
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const expected =
      'idade12ifidade10printpodeentrarelseprintaindanaopode';

    const isCorrect = normalized === expected;

    if (isCorrect) {
      try {
        await AsyncStorage.setItem(
          '@pythonquest/unlockedWorlds',
          '4'
        );

        setFeedback(
          '🎉 Excelente! Você dominou as decisões em Python!'
        );
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
        '🤔 Ainda não! Confira a variável, a condição if e a alternativa else.'
      );
      setCompleted(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.world}>🏰 MUNDO 3</Text>

        <Text style={styles.title}>Castelo das Decisões</Text>

        <Text style={styles.subtitle}>
          Aula 1: Aprendendo if e else
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📚 O que são if e else?
          </Text>

          <Text style={styles.description}>
            Em Python, usamos if para verificar uma condição.
            Se ela for verdadeira, o programa executa uma ação.
          </Text>

          <Text style={styles.description}>
            Já o else representa uma alternativa: ele executa
            outra ação quando a condição do if não é verdadeira.
          </Text>
        </View>

        <View style={styles.example}>
          <Text style={styles.exampleTitle}>
            💻 Exemplo de código
          </Text>

          <View style={styles.code}>
            <Text style={styles.codeText}>idade = 12</Text>
            <Text style={styles.codeText}>if idade >= 10:</Text>
            <Text style={styles.codeText}>    print("Pode entrar")</Text>
            <Text style={styles.codeText}>else:</Text>
            <Text style={styles.codeText}>    print("Ainda não pode")</Text>
          </View>

          <Text style={styles.outputTitle}>Resultado:</Text>
          <Text style={styles.output}>Pode entrar</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🧠 Seu terceiro desafio
          </Text>

          <Text style={styles.description}>
            Imagine que você está protegendo a entrada de um
            castelo. Somente pessoas com 10 anos ou mais podem entrar.
          </Text>

          <Text style={styles.question}>
            Escreva um código que:
          </Text>

          <Text style={styles.target}>
            1. Crie a variável idade = 12.
            {'\n'}
            2. Use if para verificar se idade >= 10.
            {'\n'}
            3. Mostre "Pode entrar".
            {'\n'}
            4. Use else para mostrar "Ainda não pode".
          </Text>

          <TextInput
            style={styles.input}
            placeholder={'Digite seu código Python aqui...'}
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
              Você aprendeu a tomar decisões usando if e else!
            </Text>

            <Text style={styles.points}>⭐ +100 XP</Text>

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
          <Text style={styles.backText}>← Voltar</Text>
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
    fontSize: 15,
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
    fontSize: 15,
    marginVertical: 15,
    lineHeight: 27,
  },
  input: {
    backgroundColor: '#071A30',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    minHeight: 150,
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
