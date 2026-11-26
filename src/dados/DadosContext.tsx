import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, traduzirErro } from '../lib/supabase';
import { useSessao, Resultado } from '../sessao/SessaoContext';
import { Categoria, Item, itemDeLinha, Prioridade, Selo } from '../tipos';
import { normalizar } from '../util/formatar';

export type SubForm = { id?: string; nome: string };
export type DadosCategoria = { id?: string; nome: string; pai?: string | null; subs?: SubForm[] };

export type DadosItem = {
  id?: string;
  nome: string;
  descricao: string;
  categoria: string | null;
  prioridade: Prioridade;
  preco: number | null;
  link: string;
  imagem: string;
};

type DadosCtx = {
  ultimaExclusao: { id: string; nome: string } | null;
  salvarItem: (d: DadosItem) => Promise<Resultado & { id?: string }>;
  excluirItem: (id: string) => Promise<Resultado>;
  desfazerExclusao: () => Promise<void>;
  limparExclusao: () => void;
  categorias: Categoria[];
  itens: Item[];
  selos: Selo[];
  carregando: boolean;
  erro: string;
  recarregar: () => Promise<void>;
  // consultas
  categoria: (id: string | null | undefined) => Categoria | undefined;
  principais: () => Categoria[];
  filhas: (id: string) => Categoria[];
  caminho: (id: string | null | undefined) => string;
  /** a própria categoria + as subcategorias dela */
  idsDe: (id: string) => string[];
  itensDe: (id: string) => Item[];
  // ações de categoria
  salvarCategoria: (d: DadosCategoria) => Promise<Resultado & { id?: string }>;
  excluirCategoria: (id: string) => Promise<Resultado>;
};

const Ctx = createContext<DadosCtx | null>(null);

const porNome = (a: { nome: string }, b: { nome: string }) => a.nome.localeCompare(b.nome, 'pt-BR');

export function DadosProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useSessao();
  const uid = usuario?.id;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [selos, setSelos] = useState<Selo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [ultimaExclusao, setUltimaExclusao] = useState<{ id: string; nome: string } | null>(null);

  const recarregar = useCallback(async () => {
    if (!uid) {
      setCategorias([]);
      setItens([]);
      setSelos([]);
      return;
    }
    setCarregando(true);
    const [c, i, s] = await Promise.all([
      supabase.from('categoria').select('id, nome, id_categoria_pai'),
      supabase.from('item').select('*').is('excluido_em', null).order('criado_em', { ascending: false }),
      supabase.from('selo').select('id, nome').order('criado_em', { ascending: true }),
    ]);
    const falha = c.error || i.error || s.error;
    if (falha) {
      setErro(traduzirErro(falha.message));
    } else {
      setErro('');
      setCategorias(((c.data ?? []) as any[]).map((l) => ({ id: l.id, nome: l.nome, pai: l.id_categoria_pai ?? null })));
      setItens(((i.data ?? []) as any[]).map(itemDeLinha));
      setSelos(((s.data ?? []) as any[]).map((l) => ({ id: l.id, nome: l.nome })));
    }
    setCarregando(false);
  }, [uid]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // ---------- consultas ----------
  const categoria = useCallback((id: string | null | undefined) => categorias.find((c) => c.id === id), [categorias]);
  const principais = useCallback(() => categorias.filter((c) => !c.pai).sort(porNome), [categorias]);
  const filhas = useCallback((id: string) => categorias.filter((c) => c.pai === id).sort(porNome), [categorias]);
  const caminho = useCallback(
    (id: string | null | undefined) => {
      const c = categoria(id);
      if (!c) return 'Sem categoria';
      const p = categoria(c.pai);
      return p ? `${p.nome} > ${c.nome}` : c.nome;
    },
    [categoria],
  );
  const idsDe = useCallback((id: string) => [id, ...categorias.filter((c) => c.pai === id).map((c) => c.id)], [categorias]);
  const itensDe = useCallback(
    (id: string) => {
      const ids = idsDe(id);
      return itens.filter((i) => i.categoria && ids.includes(i.categoria));
    },
    [itens, idsDe],
  );

  // ---------- categorias ----------
  const salvarCategoria = useCallback(
    async (d: DadosCategoria): Promise<Resultado & { id?: string }> => {
      const nome = d.nome.trim();
      if (!nome) return { erro: 'Faltou o nome.' };
      const pai = d.id ? (categorias.find((c) => c.id === d.id)?.pai ?? null) : (d.pai ?? null);

      const irmas = categorias.filter((c) => c.pai === pai && c.id !== d.id);
      if (irmas.some((c) => normalizar(c.nome) === normalizar(nome))) {
        return { erro: pai ? 'Já existe uma subcategoria com esse nome.' : 'Já existe uma categoria com esse nome.' };
      }

      const subs = (d.subs ?? []).map((s) => ({ id: s.id, nome: s.nome.trim() })).filter((s) => s.nome);
      const vistos = new Set<string>();
      for (const s of subs) {
        const k = normalizar(s.nome);
        if (vistos.has(k)) return { erro: 'Duas subcategorias estão com o mesmo nome.' };
        vistos.add(k);
      }

      let id = d.id;
      if (id) {
        const { error } = await supabase.from('categoria').update({ nome }).eq('id', id);
        if (error) return { erro: traduzirErro(error.message) };
      } else {
        const { data, error } = await supabase
          .from('categoria')
          .insert({ nome, id_categoria_pai: pai })
          .select('id')
          .single();
        if (error || !data) return { erro: traduzirErro(error?.message) };
        id = data.id as string;
      }

      // Só categorias principais têm subcategorias (um nível).
      if (!pai) {
        const mantidas = new Set(subs.filter((s) => s.id).map((s) => s.id as string));
        const removidas = categorias.filter((c) => c.pai === id && !mantidas.has(c.id)).map((c) => c.id);
        if (removidas.length) {
          // os desejos das subcategorias removidas voltam para a categoria principal
          await supabase.from('item').update({ id_categoria: id }).in('id_categoria', removidas);
          const { error } = await supabase.from('categoria').delete().in('id', removidas);
          if (error) return { erro: traduzirErro(error.message) };
        }
        for (const s of subs) {
          if (!s.id) continue;
          const atual = categorias.find((c) => c.id === s.id);
          if (atual && atual.nome !== s.nome) {
            const { error } = await supabase.from('categoria').update({ nome: s.nome }).eq('id', s.id);
            if (error) return { erro: traduzirErro(error.message) };
          }
        }
        const novas = subs.filter((s) => !s.id).map((s) => ({ nome: s.nome, id_categoria_pai: id }));
        if (novas.length) {
          const { error } = await supabase.from('categoria').insert(novas);
          if (error) return { erro: traduzirErro(error.message) };
        }
      }

      await recarregar();
      return { id };
    },
    [categorias, recarregar],
  );

  const excluirCategoria = useCallback(
    async (id: string): Promise<Resultado> => {
      // As subcategorias somem junto; os desejos ficam sem categoria (regra do banco).
      const { error } = await supabase.from('categoria').delete().eq('id', id);
      if (error) return { erro: traduzirErro(error.message) };
      await recarregar();
      return {};
    },
    [recarregar],
  );

  // ---------- desejos ----------
  const salvarItem = useCallback(
    async (d: DadosItem): Promise<Resultado & { id?: string }> => {
      const nome = d.nome.trim();
      if (!nome) return { erro: 'Faltou o nome do desejo.' };
      const linha = {
        nome,
        descricao: d.descricao.trim(),
        id_categoria: d.categoria,
        prioridade: d.prioridade,
        preco: d.preco,
        link: d.link.trim(),
        imagem_url: d.imagem,
      };
      if (d.id) {
        const { error } = await supabase.from('item').update(linha).eq('id', d.id);
        if (error) return { erro: traduzirErro(error.message) };
        await recarregar();
        return { id: d.id };
      }
      const { data, error } = await supabase.from('item').insert({ ...linha, id_usuario: uid }).select('id').single();
      if (error || !data) return { erro: traduzirErro(error?.message) };
      await recarregar();
      return { id: data.id as string };
    },
    [uid, recarregar],
  );

  // Exclusão "suave": o desejo só ganha uma data em excluido_em, então dá para desfazer.
  const excluirItem = useCallback(
    async (id: string): Promise<Resultado> => {
      const alvo = itens.find((i) => i.id === id);
      const { error } = await supabase.from('item').update({ excluido_em: new Date().toISOString() }).eq('id', id);
      if (error) return { erro: traduzirErro(error.message) };
      setUltimaExclusao({ id, nome: alvo?.nome ?? 'Desejo' });
      await recarregar();
      return {};
    },
    [itens, recarregar],
  );

  const desfazerExclusao = useCallback(async () => {
    if (!ultimaExclusao) return;
    await supabase.from('item').update({ excluido_em: null }).eq('id', ultimaExclusao.id);
    setUltimaExclusao(null);
    await recarregar();
  }, [ultimaExclusao, recarregar]);

  const limparExclusao = useCallback(() => setUltimaExclusao(null), []);

  const valor = useMemo(
    () => ({
      categorias, itens, selos, carregando, erro, recarregar,
      categoria, principais, filhas, caminho, idsDe, itensDe,
      salvarCategoria, excluirCategoria,
      ultimaExclusao, salvarItem, excluirItem, desfazerExclusao, limparExclusao,
    }),
    [categorias, itens, selos, carregando, erro, recarregar, categoria, principais, filhas, caminho, idsDe, itensDe, salvarCategoria, excluirCategoria, ultimaExclusao, salvarItem, excluirItem, desfazerExclusao, limparExclusao],
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useDados() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDados precisa estar dentro de DadosProvider');
  return v;
}
