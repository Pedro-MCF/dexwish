import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const chave = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** false quando o arquivo .env ainda não foi preenchido. */
export const configurado = url.startsWith('http') && chave.length > 20;

export const supabase = createClient(
  configurado ? url : 'https://exemplo.supabase.co',
  configurado ? chave : 'sem-chave-configurada',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

/** Traduz as mensagens de erro mais comuns para português. */
export function traduzirErro(msg: string | undefined | null): string {
  const m = (msg || '').toLowerCase();
  if (m.includes('invalid login')) return 'Usuário ou senha incorretos.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Esse e-mail já tem cadastro. Tente entrar.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja a caixa de entrada).';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('security purposes'))
    return 'Muitas tentativas. Espere um pouco e tente de novo.';
  if (m.includes('anonymous') && (m.includes('disabled') || m.includes('not enabled')))
    return 'O login de convidado está desligado no Supabase (Authentication > Sign In / Providers > Anonymous).';
  if (m.includes('network') || m.includes('failed to fetch')) return 'Sem conexão com a internet.';
  if (m.includes('password') && m.includes('characters')) return 'A senha precisa ter pelo menos 6 caracteres.';
  return 'Algo deu errado: ' + (msg || 'erro desconhecido');
}
