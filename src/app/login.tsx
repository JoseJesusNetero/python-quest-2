import * as Linking from 'expo-linking';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { EMAIL_PATTERN, mapAuthError, type AuthField, type MappedAuthError } from '@/lib/authErrors';
import { AUTH_CALLBACK_PATH } from '@/lib/authLink';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'signup';
type FieldErrors = Partial<Record<AuthField, string>>;
type Banner = { type: 'error' | 'warning' | 'success'; text: string } | null;
type Pending = { email: string; password: string; reason: 'signup' | 'login' } | null;

const RESEND_COOLDOWN = 30;

// Wrong e-mail vs wrong password: Supabase answers both with "invalid credentials".
// We ask the database (rpc `email_registered`) which one it was. Returns null if unavailable.
async function isEmailRegistered(email: string): Promise<boolean | null> {
  try {
    const { data, error } = await supabase.rpc('email_registered', { p_email: email });
    if (error || typeof data !== 'boolean') return null;
    return data;
  } catch {
    return null;
  }
}

export default function Login() {
  const { linkError, clearLinkError } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<Banner>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const isSignup = mode === 'signup';
  const redirectTo = Linking.createURL(AUTH_CALLBACK_PATH);

  // A failed confirmation link sends the user here with the reason
  useEffect(() => {
    if (linkError) {
      setBanner({ type: 'warning', text: linkError });
      clearLinkError();
    }
  }, [linkError, clearLinkError]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const clearFeedback = () => {
    setErrors({});
    setBanner(null);
  };

  const switchMode = (next: Mode) => {
    if (loading || next === mode) return;
    setMode(next);
    clearFeedback();
    setPassword('');
    setShowPassword(false);
  };

  const setField = (field: AuthField, setter: (v: string) => void) => (value: string) => {
    setter(value);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (banner) setBanner(null);
  };

  const validate = (): FieldErrors => {
    const found: FieldErrors = {};
    const mail = email.trim();
    if (isSignup && username.trim().length < 3) {
      found.username = 'Escolha um nome de usuário com pelo menos 3 caracteres.';
    }
    if (!mail) found.email = 'Digite seu e-mail.';
    else if (!EMAIL_PATTERN.test(mail)) found.email = 'E-mail inválido. Exemplo: voce@email.com';
    if (!password) found.password = 'Digite sua senha.';
    else if (isSignup && password.length < 6) found.password = 'A senha precisa ter pelo menos 6 caracteres.';
    return found;
  };

  const showMapped = (mapped: MappedAuthError) => {
    if (mapped.field) setErrors({ [mapped.field]: mapped.message });
    else setBanner({ type: 'error', text: mapped.message });
  };

  const goToConfirmation = (data: NonNullable<Pending>) => {
    setPending(data);
    setBanner(null);
    setErrors({});
    setCooldown(RESEND_COOLDOWN);
    setPassword('');
    setUsername('');
    setShowPassword(false);
  };

  const doSignup = async (mail: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: mail,
      password,
      options: { data: { username: username.trim() }, emailRedirectTo: redirectTo },
    });
    if (error) {
      showMapped(mapAuthError(error));
      return;
    }
    // With e-mail confirmation on, an existing e-mail comes back with no identities
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setErrors({ email: 'Este e-mail já está cadastrado. Toque em "Entrar" para acessar sua conta.' });
      return;
    }
    // No session = the account is waiting for e-mail confirmation
    if (!data.session) goToConfirmation({ email: mail, password, reason: 'signup' });
    // With a session the route guard takes the user to the app.
  };

  const doLogin = async (mail: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
    if (!error) return; // the route guard takes the user to the app

    const mapped = mapAuthError(error);

    if (mapped.kind === 'unconfirmed') {
      goToConfirmation({ email: mail, password, reason: 'login' });
      setBanner({ type: 'warning', text: mapped.message });
      return;
    }

    if (mapped.kind === 'invalid_credentials') {
      const registered = await isEmailRegistered(mail);
      if (registered === false) {
        setErrors({ email: 'Email não cadastrado. Confira o e-mail ou crie uma conta.' });
      } else if (registered === true) {
        setErrors({ password: 'Senha incorreta, tente novamente.' });
        setPassword('');
        passwordRef.current?.focus();
      } else {
        setBanner({
          type: 'error',
          text: 'E-mail não cadastrado ou senha incorreta. Confira os dados e tente novamente.',
        });
        setPassword('');
      }
      return;
    }

    showMapped(mapped);
  };

  const submit = async () => {
    if (loading) return;
    clearFeedback();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setLoading(true);
    try {
      const mail = email.trim().toLowerCase();
      if (isSignup) await doSignup(mail);
      else await doLogin(mail);
    } catch (err) {
      showMapped(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // "I already confirmed": sign in with the credentials we kept, no retyping
  const checkConfirmed = async () => {
    if (!pending || loading) return;
    setLoading(true);
    setBanner(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: pending.email,
        password: pending.password,
      });
      if (error) {
        const mapped = mapAuthError(error);
        if (mapped.kind === 'unconfirmed') {
          setBanner({
            type: 'warning',
            text: 'Ainda não recebemos sua confirmação. Abra o e-mail que enviamos e clique no link.',
          });
        } else {
          setBanner({ type: 'error', text: mapped.message });
        }
      }
      // on success the route guard takes the user to the app
    } catch (err) {
      setBanner({ type: 'error', text: mapAuthError(err).message });
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!pending || cooldown > 0 || resending) return;
    setResending(true);
    setBanner(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pending.email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        setBanner({ type: 'error', text: mapAuthError(error).message });
      } else {
        setBanner({ type: 'success', text: 'Novo e-mail de confirmação enviado. Confira sua caixa de entrada.' });
        setCooldown(RESEND_COOLDOWN);
      }
    } catch (err) {
      setBanner({ type: 'error', text: mapAuthError(err).message });
    } finally {
      setResending(false);
    }
  };

  const backToLogin = () => {
    setPending(null);
    setMode('login');
    clearFeedback();
    setPassword('');
  };

  const inputStyle = (name: AuthField) => [
    styles.input,
    focused === name && styles.inputFocused,
    !!errors[name] && styles.inputError,
  ];

  const renderBanner = () =>
    banner ? (
      <View
        style={[
          styles.banner,
          banner.type === 'error' && styles.bannerError,
          banner.type === 'warning' && styles.bannerWarning,
          banner.type === 'success' && styles.bannerSuccess,
        ]}
        accessibilityRole="alert"
      >
        <Text
          style={[
            styles.bannerText,
            banner.type === 'error' && { color: '#FFB3B3' },
            banner.type === 'warning' && { color: '#FFE08A' },
            banner.type === 'success' && { color: '#9BF0BE' },
          ]}
        >
          {banner.text}
        </Text>
      </View>
    ) : null;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.shell}>
          <View style={styles.brand}>
            <View style={styles.codeWindow}>
              <View style={styles.dots}>
                <View style={[styles.dot, { backgroundColor: '#FF8585' }]} />
                <View style={[styles.dot, { backgroundColor: '#FFD34E' }]} />
                <View style={[styles.dot, { backgroundColor: '#72E6A1' }]} />
              </View>
              <Text style={styles.code}>
                <Text style={styles.codeFn}>print</Text>
                <Text style={styles.codePunct}>(</Text>
                <Text style={styles.codeStr}>"Python Quest"</Text>
                <Text style={styles.codePunct}>)</Text>
              </Text>
            </View>
            <Text style={styles.title}>Python Quest</Text>
            <Text style={styles.subtitle}>
              {pending
                ? 'Falta só confirmar seu e-mail.'
                : isSignup
                  ? 'Crie sua conta e comece a aventura.'
                  : 'Entre para continuar sua jornada.'}
            </Text>
          </View>

          {pending ? (
            <View style={styles.card}>
              <View style={styles.mailBadge}>
                <Text style={styles.mailBadgeText}>@</Text>
              </View>
              <Text style={styles.noticeTitle}>
                {pending.reason === 'signup' ? 'Confirme seu e-mail para continuar' : 'E-mail não confirmado'}
              </Text>
              <Text style={styles.noticeText}>
                {pending.reason === 'signup'
                  ? 'Sua conta foi criada! Enviamos um link de confirmação para '
                  : 'Precisamos confirmar o endereço '}
                <Text style={styles.noticeEmail}>{pending.email}</Text>
                {pending.reason === 'signup'
                  ? '. Abra sua caixa de entrada (veja também o spam) e clique no link.'
                  : '. Confira sua caixa de entrada (e o spam) e clique no link que enviamos.'}
              </Text>
              <Text style={styles.noticeHint}>
                Ao confirmar, você entra automaticamente — sem digitar a senha de novo.
              </Text>

              {renderBanner()}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={checkConfirmed}
                disabled={loading}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#102D52" />
                ) : (
                  <Text style={styles.buttonText}>JÁ CONFIRMEI, ENTRAR</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondaryButton, (cooldown > 0 || resending) && styles.buttonDisabled]}
                onPress={resend}
                disabled={cooldown > 0 || resending}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                {resending ? (
                  <ActivityIndicator color="#FFD34E" />
                ) : (
                  <Text style={styles.secondaryText}>
                    {cooldown > 0 ? `REENVIAR E-MAIL (${cooldown}s)` : 'REENVIAR E-MAIL'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.switch} onPress={backToLogin} disabled={loading}>
                <Text style={styles.switchText}>
                  Usou o e-mail errado? <Text style={styles.switchLink}>Voltar</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.tabs}>
                {(['login', 'signup'] as Mode[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.tab, mode === m && styles.tabActive]}
                    onPress={() => switchMode(m)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                      {m === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {renderBanner()}

              {isSignup && (
                <View style={styles.field}>
                  <Text style={styles.label}>Nome de usuário</Text>
                  <TextInput
                    style={inputStyle('username')}
                    placeholder="ex: pequeno_dev"
                    placeholderTextColor="#7F96B3"
                    value={username}
                    onChangeText={setField('username', setUsername)}
                    onFocus={() => setFocused('username')}
                    onBlur={() => setFocused(null)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    editable={!loading}
                  />
                  {!!errors.username && <Text style={styles.fieldError}>{errors.username}</Text>}
                </View>
              )}

              <View style={styles.field}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  ref={emailRef}
                  style={inputStyle('email')}
                  placeholder="voce@email.com"
                  placeholderTextColor="#7F96B3"
                  value={email}
                  onChangeText={setField('email', setEmail)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  editable={!loading}
                />
                {!!errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Senha</Text>
                <View>
                  <TextInput
                    ref={passwordRef}
                    style={[inputStyle('password'), styles.passwordInput]}
                    placeholder="Mínimo de 6 caracteres"
                    placeholderTextColor="#7F96B3"
                    value={password}
                    onChangeText={setField('password', setPassword)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={submit}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.toggle}
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.toggleText}>{showPassword ? 'OCULTAR' : 'MOSTRAR'}</Text>
                  </TouchableOpacity>
                </View>
                {!!errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={submit}
                disabled={loading}
                activeOpacity={0.85}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#102D52" />
                ) : (
                  <Text style={styles.buttonText}>{isSignup ? 'CRIAR CONTA E JOGAR' : 'ENTRAR'}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switch}
                onPress={() => switchMode(isSignup ? 'login' : 'signup')}
              >
                <Text style={styles.switchText}>
                  {isSignup ? 'Já tem conta? ' : 'Novo por aqui? '}
                  <Text style={styles.switchLink}>{isSignup ? 'Entrar' : 'Criar conta'}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#102D52' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 48 },
  shell: { width: '100%', maxWidth: 440, alignSelf: 'center' },
  brand: { marginBottom: 26 },
  codeWindow: {
    backgroundColor: '#071A30',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2B4F7C',
    alignSelf: 'flex-start',
    marginBottom: 22,
  },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  code: { fontSize: 16, fontWeight: 'bold', fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) },
  codeFn: { color: '#FFD34E' },
  codePunct: { color: '#D6E5F5' },
  codeStr: { color: '#72E6A1' },
  title: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: '#D6E5F5', fontSize: 15, marginTop: 6, lineHeight: 22 },
  card: {
    backgroundColor: '#23568B',
    borderRadius: 20,
    padding: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#183D70',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: '#FFD34E' },
  tabText: { color: '#A9B5C7', fontWeight: '900', fontSize: 12, letterSpacing: 0.5 },
  tabTextActive: { color: '#102D52' },
  field: { marginBottom: 16 },
  label: { color: '#D6E5F5', fontSize: 13, fontWeight: 'bold', marginBottom: 8 },
  input: {
    backgroundColor: '#071A30',
    color: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 52,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#4779AA',
  },
  inputFocused: { borderColor: '#FFD34E' },
  inputError: { borderColor: '#FF8585' },
  fieldError: { color: '#FFB3B3', fontSize: 13, lineHeight: 18, marginTop: 7, fontWeight: '600' },
  passwordInput: { paddingRight: 92 },
  toggle: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  toggleText: { color: '#FFD34E', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  banner: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  bannerError: { backgroundColor: '#3A1C2E', borderColor: '#FF8585' },
  bannerWarning: { backgroundColor: '#3B3320', borderColor: '#FFD34E' },
  bannerSuccess: { backgroundColor: '#12392F', borderColor: '#72E6A1' },
  bannerText: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  button: {
    backgroundColor: '#F6B93B',
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#102D52', fontWeight: '900', fontSize: 15, letterSpacing: 0.4 },
  secondaryButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#FFD34E',
  },
  secondaryText: { color: '#FFD34E', fontWeight: '900', fontSize: 13, letterSpacing: 0.4 },
  switch: { alignItems: 'center', paddingTop: 18, paddingBottom: 4 },
  switchText: { color: '#D6E5F5', fontSize: 14 },
  switchLink: { color: '#FFD34E', fontWeight: 'bold' },
  mailBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#071A30',
    borderWidth: 2,
    borderColor: '#FFD34E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mailBadgeText: { color: '#FFD34E', fontSize: 26, fontWeight: '900' },
  noticeTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '900', marginBottom: 8 },
  noticeText: { color: '#D6E5F5', fontSize: 15, lineHeight: 22 },
  noticeEmail: { color: '#FFD34E', fontWeight: 'bold' },
  noticeHint: { color: '#A9C4E3', fontSize: 13, lineHeight: 19, marginTop: 10, marginBottom: 18 },
});
