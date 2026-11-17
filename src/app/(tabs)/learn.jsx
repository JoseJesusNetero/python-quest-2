
import { StyleSheet, Text, View } from 'react-native';

export default function Learn() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💻 Escola Python</Text>
      <Text style={styles.text}>
        Bem-vindo à escola dos programadores!
      </Text>
      <View style={styles.card}>
        <Text style={styles.heading}>📘 Primeira aula</Text>
        <Text style={styles.text}>
          Vamos aprender o comando print().
        </Text>
        <View style={styles.code}>
          <Text style={styles.codeText}>
            print("Olá, mundo!")
          </Text>
        </View>
        <Text style={styles.result}>Olá, mundo!</Text>
        <Text style={styles.text}>
          Esse comando mostra uma mensagem na tela.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#102D52', padding: 20, paddingTop: 60 },
  title: { color: '#FFD34E', fontSize: 25, fontWeight: '900' },
  text: { color: '#FFFFFF', fontSize: 15, marginTop: 15, lineHeight: 23 },
  card: { backgroundColor: '#23568B', padding: 20, borderRadius: 20, marginTop: 25 },
  heading: { color: '#FFD34E', fontSize: 20, fontWeight: 'bold' },
  code: { backgroundColor: '#101B2B', padding: 18, borderRadius: 12, marginTop: 20 },
  codeText: { color: '#8FE3A0', fontSize: 16, fontWeight: 'bold' },
  result: { color: '#8FE3A0', fontSize: 19, fontWeight: 'bold', marginTop: 18 },
});
