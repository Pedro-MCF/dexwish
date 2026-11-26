import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

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

const Ctx = createContext<SessaoCtx | null>(null);

/**
 * ETAPA 1: sessão "de mentira" (só em memória) para testar as telas.
 * Na ETAPA 2 este arquivo é substituído pela versão com Supabase.
 */
export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const entrarConvidado = useCallback(async (): Promise<Resultado> => {
    setUsuario({ id: 'local', nome: 'Convidado', convidado: true });
    return {};
  }, []);
  const entrar = useCallback(async (u: string): Promise<Resultado> => {
    setUsuario({ id: 'local', nome: u, convidado: false });
    return {};
  }, []);
  const cadastrar = useCallback(async (u: string, email: string): Promise<Resultado> => {
    setUsuario({ id: 'local', nome: u, convidado: false, email });
    return {};
  }, []);
  const recuperarSenha = useCallback(async (): Promise<Resultado> => ({}), []);
  const redefinirSenha = useCallback(async (): Promise<Resultado> => ({}), []);
  const entrarComGoogle = useCallback(
    async (): Promise<Resultado> => ({ erro: 'O login com Google será ativado na Etapa 2.' }),
    [],
  );
  const sair = useCallback(async () => setUsuario(null), []);

  const valor = useMemo(
    () => ({
      usuario,
      carregando: false,
      entrarConvidado,
      entrar,
      cadastrar,
      recuperarSenha,
      redefinirSenha,
      entrarComGoogle,
      sair,
    }),
    [usuario, entrarConvidado, entrar, cadastrar, recuperarSenha, redefinirSenha, entrarComGoogle, sair],
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useSessao() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSessao precisa estar dentro de SessaoProvider');
  return v;
}
