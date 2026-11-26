import React from 'react';
import { Alert, Image, Linking, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Tela, Topo } from '../componentes/Tela';
import { Botao } from '../componentes/Botao';
import { Vazio } from '../componentes/Vazio';
import { Estrelas } from '../componentes/Estrelas';
import { Selo } from '../componentes/Selo';
import { IconePrioridade, NOME_PRIORIDADE } from '../componentes/IconePrioridade';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useDados } from '../dados/DadosContext';
import { dominio, formatarPreco } from '../util/formatar';

export function Detalhes() {
  const { cores } = useTema();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { itens, caminho, excluirItem, reabrirItem } = useDados();
  const i = itens.find((x) => x.id === params.id);

  if (!i) {
    return (
      <Tela>
        <Topo titulo="Detalhes do desejo" aoVoltar={() => nav.goBack()} />
        <Vazio icone="alert-circle-outline" titulo="Desejo não encontrado" texto="Ele pode ter sido excluído." />
      </Tela>
    );
  }

  const abrirLink = () => {
    const url = /^https?:\/\//i.test(i.link) ? i.link : 'https://' + i.link;
    Linking.openURL(url).catch(() => Alert.alert('Ops', 'Não consegui abrir esse link.'));
  };
  const excluir = async () => {
    const r = await excluirItem(i.id);
    if (r.erro) return Alert.alert('Ops', r.erro);
    nav.goBack();
  };

  return (
    <Tela>
      <Topo titulo="Detalhes do desejo" aoVoltar={() => nav.goBack()} />
      {i.imagem ? <Image source={{ uri: i.imagem }} style={s.foto} /> : null}
      <View style={s.linha}>
        <Text style={[s.nome, { color: cores.texto, flex: 1 }]}>{i.nome}</Text>
        {i.selo ? <Selo nome={i.selo} tamanho={72} /> : null}
      </View>
      <Text style={[s.sub, { color: cores.sub }]}>{caminho(i.categoria)}</Text>

      {i.preco !== null ? (
        <View style={s.bloco}>
          <Text style={[s.rotulo, { color: cores.sub }]}>Preço</Text>
          <Text style={[s.preco, { color: cores.destaque }]}>{formatarPreco(i.preco)}</Text>
        </View>
      ) : null}
      <View style={s.bloco}>
        <Text style={[s.rotulo, { color: cores.sub }]}>Prioridade</Text>
        <View style={s.linha}>
          <IconePrioridade nivel={i.prioridade} altura={20} />
          <Text style={[s.valor, { color: cores.texto }]}>{NOME_PRIORIDADE[i.prioridade]}</Text>
        </View>
      </View>
      {i.descricao ? (
        <View style={s.bloco}>
          <Text style={[s.rotulo, { color: cores.sub }]}>Descrição</Text>
          <Text style={[s.valor, { color: cores.texto }]}>{i.descricao}</Text>
        </View>
      ) : null}
      {i.selo ? (
        <View style={s.bloco}>
          <Text style={[s.rotulo, { color: cores.sub }]}>Minha avaliação</Text>
          {i.nota ? <Estrelas valor={i.nota} tamanho={26} /> : <Text style={[s.valor, { color: cores.sub }]}>Sem nota</Text>}
          {i.comentario ? <Text style={[s.valor, { color: cores.texto }]}>{i.comentario}</Text> : null}
        </View>
      ) : null}
      {i.link ? (
        <Botao
          titulo={`Abrir ${dominio(i.link)}`}
          variante="alternativo"
          onPress={abrirLink}
        />
      ) : null}

      {i.selo ? (
        <Botao titulo="Reabrir desejo" variante="alternativo" onPress={() => reabrirItem(i.id)} />
      ) : (
        <Botao titulo="Concluir e avaliar" onPress={() => nav.navigate('Concluir', { id: i.id })} />
      )}
      <Botao titulo="Editar" variante="alternativo" onPress={() => nav.navigate('FormItem', { id: i.id })} />
      <Botao titulo="Excluir" variante="perigo" onPress={excluir} />
    </Tela>
  );
}

const s = StyleSheet.create({
  foto: { width: '100%', height: 230, borderRadius: 22 },
  nome: { fontFamily: fontes.tituloMedio, fontSize: 28 },
  sub: { fontFamily: fontes.texto, fontSize: 14, marginTop: -8 },
  bloco: { gap: 4 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rotulo: { fontFamily: fontes.textoForte, fontSize: 13 },
  valor: { fontFamily: fontes.texto, fontSize: 16, lineHeight: 22 },
  preco: { fontFamily: fontes.tituloForte, fontSize: 24 },
});
