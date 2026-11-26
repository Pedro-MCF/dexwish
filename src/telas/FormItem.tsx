import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Tela, Topo } from '../componentes/Tela';
import { Campo } from '../componentes/Campo';
import { Botao } from '../componentes/Botao';
import { IconePrioridade, NOME_PRIORIDADE } from '../componentes/IconePrioridade';
import { SeletorCategoria } from '../componentes/SeletorCategoria';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useDados } from '../dados/DadosContext';
import { Prioridade } from '../tipos';
import { lerPreco } from '../util/formatar';

const NIVEIS: Prioridade[] = ['alta', 'media', 'baixa'];

/** Criar/editar desejo. Imagem e leitura automática do link chegam na Etapa 6. */
export function FormItem() {
  const { cores } = useTema();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const id: string | undefined = params?.id;
  const { itens, caminho, salvarItem } = useDados();
  const atual = itens.find((i) => i.id === id);

  const [nome, setNome] = useState(atual?.nome ?? '');
  const [categoria, setCategoria] = useState<string | null>(atual?.categoria ?? params?.categoria ?? null);
  const [prioridade, setPrioridade] = useState<Prioridade>(atual?.prioridade ?? 'media');
  const [descricao, setDescricao] = useState(atual?.descricao ?? '');
  const [comLink, setComLink] = useState(!!atual?.link);
  const [link, setLink] = useState(atual?.link ?? '');
  const [comPreco, setComPreco] = useState(atual?.preco !== null && atual?.preco !== undefined);
  const [preco, setPreco] = useState(atual?.preco !== null && atual?.preco !== undefined ? String(atual.preco).replace('.', ',') : '');
  const [escolhendo, setEscolhendo] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const salvar = async () => {
    setErro('');
    const p = comPreco ? lerPreco(preco) : null;
    if (p !== null && Number.isNaN(p)) return setErro('O preço não parece certo. Use só números, como 199,90.');
    setSalvando(true);
    const r = await salvarItem({
      id,
      nome,
      descricao,
      categoria,
      prioridade,
      preco: p,
      link: comLink ? link : '',
      imagem: atual?.imagem ?? '',
    });
    setSalvando(false);
    if (r.erro) return setErro(r.erro);
    nav.goBack();
  };

  return (
    <Tela>
      <Topo titulo={id ? 'Editar desejo' : 'Novo desejo'} aoVoltar={() => nav.goBack()} />

      <Campo rotulo="Nome" value={nome} onChangeText={setNome} placeholder="O que você deseja?" maxLength={80} />

      <View style={{ gap: 7 }}>
        <Text style={[s.rotulo, { color: cores.sub }]}>Categoria (Opcional)</Text>
        <Pressable
          onPress={() => setEscolhendo(true)}
          style={[s.seletor, { backgroundColor: cores.campo, borderColor: cores.linha }]}
        >
          <Text style={[s.seletorTxt, { color: categoria ? cores.texto : cores.sub }]}>{caminho(categoria)}</Text>
          <Ionicons name="chevron-down" size={20} color={cores.sub} />
        </Pressable>
      </View>

      <View style={{ gap: 7 }}>
        <Text style={[s.rotulo, { color: cores.sub }]}>Prioridade</Text>
        <View style={s.niveis}>
          {NIVEIS.map((n) => {
            const ativo = prioridade === n;
            return (
              <Pressable
                key={n}
                onPress={() => setPrioridade(n)}
                style={[
                  s.nivel,
                  { backgroundColor: ativo ? cores.acento + '33' : cores.campo, borderColor: ativo ? cores.acento : cores.linha },
                ]}
              >
                <IconePrioridade nivel={n} altura={18} />
                <Text style={[s.nivelTxt, { color: cores.texto }]}>{NOME_PRIORIDADE[n]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Campo rotulo="Descrição (Opcional)" value={descricao} onChangeText={setDescricao} multiline placeholder="Cor, tamanho, modelo…" />

      {comLink ? (
        <Campo
          rotulo="Link"
          value={link}
          onChangeText={setLink}
          autoCapitalize="none"
          keyboardType="url"
          placeholder="https://…"
          direita={
            <Pressable accessibilityLabel="Remover link" hitSlop={10} onPress={() => { setComLink(false); setLink(''); }}>
              <Ionicons name="close-circle" size={24} color={cores.sub} />
            </Pressable>
          }
        />
      ) : null}
      {comPreco ? (
        <Campo
          rotulo="Preço (R$)"
          value={preco}
          onChangeText={setPreco}
          keyboardType="decimal-pad"
          placeholder="0,00"
          direita={
            <Pressable accessibilityLabel="Remover preço" hitSlop={10} onPress={() => { setComPreco(false); setPreco(''); }}>
              <Ionicons name="close-circle" size={24} color={cores.sub} />
            </Pressable>
          }
        />
      ) : null}
      {!comLink || !comPreco ? (
        <View style={s.extras}>
          {!comLink ? <Botao titulo="Adicionar link" variante="alternativo" onPress={() => setComLink(true)} estilo={s.extra} /> : null}
          {!comPreco ? <Botao titulo="Adicionar preço" variante="alternativo" onPress={() => setComPreco(true)} estilo={s.extra} /> : null}
        </View>
      ) : null}

      {erro ? <Text style={[s.erro, { color: cores.erro }]}>{erro}</Text> : null}
      <Botao titulo="Salvar" onPress={salvar} carregando={salvando} />

      <SeletorCategoria
        visivel={escolhendo}
        aoFechar={() => setEscolhendo(false)}
        valor={categoria}
        aoEscolher={(c) => {
          setCategoria(c);
          setEscolhendo(false);
        }}
      />
    </Tela>
  );
}

const s = StyleSheet.create({
  rotulo: { fontFamily: fontes.textoForte, fontSize: 14 },
  seletor: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14 },
  seletorTxt: { fontFamily: fontes.texto, fontSize: 16, flexShrink: 1 },
  niveis: { flexDirection: 'row', gap: 8 },
  nivel: { flex: 1, borderWidth: 1.5, borderRadius: 16, paddingVertical: 11, alignItems: 'center', gap: 6 },
  nivelTxt: { fontFamily: fontes.textoSemi, fontSize: 13 },
  extras: { flexDirection: 'row', gap: 10 },
  extra: { flex: 1, paddingVertical: 12 },
  erro: { fontFamily: fontes.textoSemi, fontSize: 14 },
});
