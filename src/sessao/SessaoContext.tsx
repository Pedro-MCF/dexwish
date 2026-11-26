import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase, traduzirErro } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type Usuario = {
  id: string;
  nome: string;
  convidado: boolean;
  email?: string | null;
  avatarUrl?: string | null;
};

/** Resultado das ações: `erro` aparece em vermelho, `aviso` é uma informação (ex.: "confirme seu e-mail"). */
export type Resultado = { erro?: string; aviso?: string };

type SessaoCtx = {
  usuario: Usuario | null;
  carregando: boolean;
  entrarConvidado: () => Promise<Resultado>;
  entrar: (usuario: string, senha: string) => Promise<Resultado>;
  cadastrar: (usuario: string, email: string, senha: string) => Promise<Resultado>;
  /** Passo 1 da recuperação: envia um código de 6 dígitos para o e-mail. */
  recuperarSenha: (email: string) => Promise<Resultado>;
  /** Passo 2: confere o código e define a nova senha. */
  redefinirSenha: (email: string, codigo: string, novaSenha: string) => Promise<Resultado>;
  entrarComGoogle: () => Promise<Resultado>;
  sair: () => Promise<void>;
};

type PerfilLinha = { usuario: string | null; avatar_url: string | null };

const Ctx = createContext<SessaoCtx | null>(null);

export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<PerfilLinha | null>(null);
  const [carregando, setCarregando] = useState(true);

  // 1) Sessão salva no aparelho + avisos de login/logout.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user ?? null);
      setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento: string, sessao: any) => {
      setUser(sessao?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2) Perfil (nome de usuário e foto) da pessoa logada.
  useEffect(() => {
    if (!user) {
      setPerfil(null);
      return;
    }
    let vivo = true;
    const buscar = async (tentativa: number) => {
      const { data } = await supabase.from('perfil').select('usuario, avatar_url').eq('id', user.id).maybeSingle();
      if (!vivo) return;
      if (data) setPerfil(data as PerfilLinha);
      else if (tentativa < 4) setTimeout(() => buscar(tentativa + 1), 700); // o gatilho do banco pode demorar um instante
    };
    buscar(0);
    return () => {
      vivo = false;
    };
  }, [user?.id]);

  const usuario: Usuario | null = useMemo(() => {
    if (!user) return null;
    const convidado = !!user.is_anonymous;
    const nome = perfil?.usuario || (convidado ? 'Convidado' : (user.email || '').split('@')[0] || 'Usuário');
    return { id: user.id, nome, convidado, email: user.email ?? null, avatarUrl: perfil?.avatar_url ?? null };
  }, [user, perfil]);

  const entrarConvidado = useCallback(async (): Promise<Resultado> => {
    const { error } = await supabase.auth.signInAnonymously();
    return error ? { erro: traduzirErro(error.message) } : {};
  }, []);

  const entrar = useCallback(async (nome: string, senha: string): Promise<Resultado> => {
    let email = nome.trim();
    if (!email.includes('@')) {
      const { data, error } = await supabase.rpc('email_do_usuario', { p_usuario: email });
      if (error) return { erro: traduzirErro(error.message) };
      if (!data) return { erro: 'Usuário ou senha incorretos.' };
      email = data as string;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    return error ? { erro: traduzirErro(error.message) } : {};
  }, []);

  const cadastrar = useCallback(async (nome: string, email: string, senha: string): Promise<Resultado> => {
    const { data: livre, error: e0 } = await supabase.rpc('usuario_disponivel', { p_usuario: nome });
    if (e0) return { erro: traduzirErro(e0.message) };
    if (!livre) return { erro: 'Esse nome de usuário já está em uso.' };
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { usuario: nome.trim() } },
    });
    if (error) return { erro: traduzirErro(error.message) };
    if (!data.session) return { aviso: 'Conta criada! Confirme seu e-mail e depois faça login.' };
    return {};
  }, []);

  const recuperarSenha = useCallback(async (email: string): Promise<Resultado> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return error ? { erro: traduzirErro(error.message) } : {};
  }, []);

  const redefinirSenha = useCallback(async (email: string, codigo: string, novaSenha: string): Promise<Resultado> => {
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'recovery' });
    if (error) return { erro: 'Código inválido ou expirado. Peça um novo.' };
    const { error: e2 } = await supabase.auth.updateUser({ password: novaSenha });
    return e2 ? { erro: traduzirErro(e2.message) } : {};
  }, []);

  const entrarComGoogle = useCallback(async (): Promise<Resultado> => {
    const redirectTo = Linking.createURL('auth');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data?.url) return { erro: 'O login com Google não está configurado no Supabase.' };
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type !== 'success') return {}; // a pessoa fechou a janela
    const trecho = res.url.split('#')[1] ?? res.url.split('?')[1] ?? '';
    const p = new URLSearchParams(trecho);
    const acesso = p.get('access_token');
    const renovar = p.get('refresh_token');
    if (!acesso || !renovar) return { erro: 'Não foi possível concluir o login com Google.' };
    const { error: e2 } = await supabase.auth.setSession({ access_token: acesso, refresh_token: renovar });
    return e2 ? { erro: traduzirErro(e2.message) } : {};
  }, []);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrarConvidado, entrar, cadastrar, recuperarSenha, redefinirSenha, entrarComGoogle, sair }),
    [usuario, carregando, entrarConvidado, entrar, cadastrar, recuperarSenha, redefinirSenha, entrarComGoogle, sair],
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSessao() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSessao precisa estar dentro de SessaoProvider');
  return v;
}
