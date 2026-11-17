import { Alert } from 'react-native';

export const LESSON_XP = 100;

/**
 * Adds XP to the signed-in user's profile in Supabase.
 * Failures are shown with an Alert and never block the lesson's local unlock.
 */
export async function awardLessonXp(
  addXp: (amount: number) => Promise<unknown>,
  amount: number = LESSON_XP
): Promise<boolean> {
  try {
    await addXp(amount);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido.';
    Alert.alert('Não foi possível sincronizar seu XP', message);
    return false;
  }
}
