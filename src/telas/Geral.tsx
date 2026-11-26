import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../componentes/Logo';
import { Tela } from '../componentes/Tela';
import { Vazio } from '../componentes/Vazio';
import { Chip } from '../componentes/Chip';
import { FolhaInferior, Opcao } from '../componentes/FolhaInferior';
import { ListaItens } from '../componentes/ListaItens';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useDados } from '../dados/DadosContext';
import { normalizar } from '../util/formatar';
import { Item } from '../tipos';

const PESO = { alta: 0, media: 1, baixa: 2 } as const;

export function Geral() {
  const { cores, modoEscuro, definir } = useTema();
  const { itens, categoria, principais, filhas, idsDe } = useDados();

  const [busca, setBusca] = useState('');
  const [cat, setCat] = useState<'todos' | 'sem' | string>('todos');
  const [sub, setSub] = useState<string | null>(null);
  const [grade, setGrade] = useState(false);
  const [painel, setPainel] = useState<null | 'categoria' | 'exibicao'>(null);

  const lista = useMemo(() => {
    const q = normalizar(busca.trim());
    return itens
      .filter((i: Item) => !i.selo) // a lista padrão só mostra desejos ainda sem selo
      .filter((i) => {
        if (cat === 'sem') return !i.categoria;
        if (cat !== 'todos') {
          if (sub) return i.categoria === sub;
          return !!i.categoria && idsDe(cat).includes(i.categoria);
        }
        return true;
      })
      .filter((i) => !q || normalizar(i.nome).includes(q) || normalizar(i.descricao).includes(q))
      .sort((a, b) => PESO[a.prioridade] - PESO[b.prioridade] || b.criadoEm.localeCompare(a.criadoEm));
  }, [itens, busca, cat, sub, idsDe]);

  const nomeCat = cat === 'todos' ? 'Todos' : cat === 'sem' ? 'Sem categoria' : (categoria(cat)?.nome ?? 'Todos');
  const subs = cat !== 'todos' && cat !== 'sem' ? filhas(cat) : [];
  const temFiltro = !!busca.trim() || cat !== 'todos';

  const escolher = (c: string) => {
    setCat(c);
    setSub(null);
    setPainel(null);
  };

  return (
    <Tela comAbas>
      <View style={s.logo}>
        <Logo altura={34} />
      </View>
      <Text style={[s.h1, { color: cores.texto }]}>Seus desejos</Text>

      <View style={[s.busca, { backgroundColor: cores.campo, borderColor: cores.linha }]}>
        <Ionicons name="search" size={20} color={cores.sub} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Buscar desejo"
          placeholderTextColor={cores.sub + '99'}
          style={[s.buscaInput, { color: cores.texto }]}
          returnKeyType="search"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pilulas}>
        <Chip rotulo={`${nomeCat} ▾`} ativo={cat !== 'todos'} onPress={() => setPainel('categoria')} />
        <Chip rotulo="Exibição ▾" onPress={() => setPainel('exibicao')} />
      </ScrollView>

      {subs.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pilulas}>
          <Chip rotulo="Todas" ativo={!sub} onPress={() => setSub(null)} />
          {subs.map((x) => (
            <Chip key={x.id} rotulo={x.nome} ativo={sub === x.id} onPress={() => setSub(x.id)} />
          ))}
        </ScrollView>
      ) : null}

      {lista.length === 0 ? (
        temFiltro ? (
          <Vazio icone="search-outline" titulo="Nada encontrado" texto="Tente outra busca ou mude o filtro." />
        ) : (
          <Vazio icone="add-circle-outline" titulo="Sua lista está vazia" texto="Toque no + lá embaixo para adicionar o primeiro desejo." />
        )
      ) : (
        <ListaItens itens={lista} grade={grade} />
      )}

      <FolhaInferior visivel={painel === 'categoria'} aoFechar={() => setPainel(null)} titulo="Categoria">
        <Opcao primeira rotulo="Todos" marcada={cat === 'todos'} onPress={() => escolher('todos')} />
        {principais().map((c) => (
          <Opcao key={c.id} rotulo={c.nome} marcada={cat === c.id} onPress={() => escolher(c.id)} />
        ))}
        <Opcao rotulo="Sem categoria" marcada={cat === 'sem'} onPress={() => escolher('sem')} />
      </FolhaInferior>

      <FolhaInferior visivel={painel === 'exibicao'} aoFechar={() => setPainel(null)} titulo="Exibição">
        <Opcao primeira rotulo="Lista" marcada={!grade} onPress={() => setGrade(false)} />
        <Opcao rotulo="Grade" marcada={grade} onPress={() => setGrade(true)} />
        <Opcao
          rotulo="Modo escuro"
          onPress={() => definir(!modoEscuro)}
          direita={
            <Switch value={modoEscuro} onValueChange={definir} trackColor={{ false: cores.anel, true: cores.acento }} thumbColor="#FFFFFF" />
          }
        />
      </FolhaInferior>
    </Tela>
  );
}

const s = StyleSheet.create({
  logo: { alignItems: 'center', paddingTop: 10 },
  h1: { fontFamily: fontes.tituloMedio, fontSize: 32 },
  busca: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14 },
  buscaInput: { flex: 1, fontFamily: fontes.texto, fontSize: 16, paddingVertical: 12 },
  pilulas: { gap: 8, paddingRight: 8 },
});
