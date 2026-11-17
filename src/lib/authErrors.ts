// Translates Supabase auth errors into friendly Portuguese messages.

export type AuthField = 'username' | 'email' | 'password';

export type MappedAuthError = {
  kind:
    | 'unconfirmed'
    | 'invalid_credentials'
    | 'already_registered'
    | 'invalid_email'
    | 'weak_password'
    | 'rate_limit'
    | 'network'
    | 'other';
  field?: AuthField;
  message: string;
};

type ErrorLike = { message?: string; code?: string; status?: number; name?: string } | null | undefined;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function mapAuthError(error: unknown): MappedAuthError {
  const e = (error ?? {}) as NonNullable<ErrorLike>;
  const code = (e.code ?? '').toLowerCase();
  const msg = (e.message ?? '').toLowerCase();

  if (code === 'email_not_confirmed' || /email not confirmed/.test(msg)) {
    return {
      kind: 'unconfirmed',
      message:
        'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e o spam) e clique no link de confirmação.',
    };
  }

  if (code === 'invalid_credentials' || /invalid login credentials/.test(msg)) {
    return { kind: 'invalid_credentials', message: 'E-mail ou senha incorretos.' };
  }

  if (code === 'user_already_exists' || code === 'email_exists' || /already registered|already been registered/.test(msg)) {
    return {
      kind: 'already_registered',
      field: 'email',
      message: 'Este e-mail já está cadastrado. Toque em "Entrar" para acessar sua conta.',
    };
  }

  if (
    code === 'email_address_invalid' ||
    code === 'validation_failed' ||
    /invalid format|unable to validate email|email address .* is invalid|invalid email/.test(msg)
  ) {
    return { kind: 'invalid_email', field: 'email', message: 'E-mail inválido. Confira se digitou corretamente.' };
  }

  if (code === 'weak_password' || /password should be|password is too|weak password/.test(msg)) {
    return {
      kind: 'weak_password',
      field: 'password',
      message: 'Senha muito fraca. Use pelo menos 6 caracteres, misturando letras e números.',
    };
  }

  if (
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    e.status === 429 ||
    /rate limit|too many requests|security purposes/.test(msg)
  ) {
    return {
      kind: 'rate_limit',
      message: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente novamente.',
    };
  }

  if (code === 'signup_disabled' || /signups not allowed/.test(msg)) {
    return { kind: 'other', message: 'O cadastro de novas contas está desativado no momento.' };
  }

  if (
    e.name === 'AuthRetryableFetchError' ||
    e.status === 0 ||
    /network|failed to fetch|fetch failed|load failed/.test(msg)
  ) {
    return {
      kind: 'network',
      message: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
    };
  }

  return { kind: 'other', message: 'Algo deu errado. Tente novamente em instantes.' };
}

// Messages for links opened from the confirmation e-mail that failed.
export function mapLinkError(code: string | null, description: string | null): string {
  const c = (code ?? '').toLowerCase();
  const d = (description ?? '').toLowerCase();
  if (c === 'otp_expired' || /expired|invalid/.test(d)) {
    return 'O link de confirmação expirou ou já foi usado. Entre com seu e-mail e senha — se ainda precisar confirmar, pediremos um novo link.';
  }
  return 'Não foi possível confirmar seu e-mail por este link. Tente entrar com seu e-mail e senha.';
}
