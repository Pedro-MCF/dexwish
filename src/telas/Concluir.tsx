import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Tela, Topo } from '../componentes/Tela';
import { Campo } from '../componentes/Campo';
import { Botao } from '../componentes/Botao';
import { Chip } from '../componentes/Chip';
import { Estrelas } from '../componentes/Estrelas';
import { Vazio } from '../componentes/Vazio';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useDados } from '../dados/DadosContext';
import { NOME_SELO_PADRAO } from '../tipos';

/** "Concluir e avaliar": estrelas, selo (Concluído ou personalizado) e comentário opcional. */
export function Concluir() {
  const { cores } = useTema();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { itens, selos, concluirItem, criarSelo } = useDados();
  const i = itens.find((x) => x.id === params.id);

  const [nota, setNota] = useState<number | null>(i?.nota ?? null);
  const [selo, setSelo] = useState(i?.selo ?? NOME_SELO_PADRAO);
  const [comComentario, setComComentario] = useState(!!i?.comentario);
  const [comentario, setComentario] = useState(i?.comentario ?? '');
  const [novoSelo, setNovoSelo] = useState<string | null>(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  if (!i) {
    return (
      <Tela>
        <Topo titulo="Concluir e avaliar" aoVoltar={() => nav.goBack()} />
        <Vazio icone="alert-circle-outline" titulo="Desejo não encontrado" texto="Ele pode ter sido excluído." />
      </Tela>
    );
  }

  const adicionarSelo = async () => {
    const nome = (novoSelo ?? '').trim();
    if (!nome) return setNovoSelo(null);
    const r = await criarSelo(nome);
    if (r.erro) return setErro(r.erro);
    setErro('');
    setSelo(nome);
    setNovoSelo(null);
  };

  const salvar = async () => {
    setSalvando(true);
    const r = await concluirItem(i.id, { selo, nota, comentario: comComentario ? comentario : '' });
    setSalvando(false);
    if (r.erro) return setErro(r.erro);
    nav.goBack();
  };

  return (
    <Tela>
      <Topo titulo="Concluir e avaliar" aoVoltar={() => nav.goBack()} />
      <Text style={[s.nome, { color: cores.texto }]}>{i.nome}</Text>

      <Text style={[s.rotulo, { color: cores.sub }]}>Sua avaliação</Text>
      <Estrelas valor={nota} aoMudar={setNota} />

      <Text style={[s.rotulo, { color: cores.sub }]}>Selo</Text>
      <View style={s.chips}>
        <Chip rotulo={NOME_SELO_PADRAO} ativo={selo === NOME_SELO_PADRAO} onPress={() => setSelo(NOME_SELO_PADRAO)} />
        {selos.map((x) => (
          <Chip key={x.id} rotulo={x.nome} ativo={selo === x.nome} onPress={() => setSelo(x.nome)} />
        ))}
        <Chip rotulo="+" tracejado onPress={() => setNovoSelo('')} />
      </View>
      {novoSelo !== null ? (
        <Campo
          value={novoSelo}
          onChangeText={setNovoSelo}
          placeholder="Nome do novo selo (ex.: Ganhei)"
          maxLength={20}
          autoFocus
          onSubmitEditing={adicionarSelo}
          direita={
            <Pressable accessibilityLabel="Cancelar" hitSlop={10} onPress={() => setNovoSelo(null)}>
              <Ionicons name="close-circle" size={24} color={cores.sub} />
            </Pressable>
          }
        />
      ) : null}
      {novoSelo !== null ? <Botao titulo="Criar selo" variante="alternativo" onPress={adicionarSelo} /> : null}

      {comComentario ? (
        <Campo
          rotulo="Comentário"
          value={comentario}
          onChangeText={setComentario}
          multiline
          placeholder="O que você achou?"
          direita={
            <Pressable accessibilityLabel="Remover comentário" hitSlop={10} onPress={() => { setComComentario(false); setComentario(''); }}>
              <Ionicons name="close-circle" size={24} color={cores.sub} />
            </Pressable>
          }
        />
      ) : (
        <Botao titulo="Adicionar comentário" variante="alternativo" onPress={() => setComComentario(true)} />
      )}

      {erro ? <Text style={[s.erro, { color: cores.erro }]}>{erro}</Text> : null}
      <Botao titulo="Concluir" onPress={salvar} carregando={salvando} />
    </Tela>
  );
}

const s = StyleSheet.create({
  nome: { fontFamily: fontes.tituloMedio, fontSize: 24 },
  rotulo: { fontFamily: fontes.textoForte, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  erro: { fontFamily: fontes.textoSemi, fontSize: 14 },
});
