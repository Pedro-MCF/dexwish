import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Tela, Topo } from '../componentes/Tela';
import { Chip } from '../componentes/Chip';
import { Vazio } from '../componentes/Vazio';
import { Botao } from '../componentes/Botao';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useDados } from '../dados/DadosContext';

/** Detalhe de uma categoria: subcategorias e quantidade de desejos. A lista de desejos chega na Etapa 4. */
export function Categoria() {
  const { cores } = useTema();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { categoria, filhas, itensDe } = useDados();
  const c = categoria(params.id);

  if (!c) {
    return (
      <Tela>
        <Topo titulo="Categoria" aoVoltar={() => nav.goBack()} />
        <Vazio icone="alert-circle-outline" titulo="Categoria não encontrada" texto="Ela pode ter sido excluída." />
      </Tela>
    );
  }
  const subs = filhas(c.id);
  return (
    <Tela>
      <Topo titulo={c.nome} aoVoltar={() => nav.goBack()} />
      <Text style={[s.sub, { color: cores.sub }]}>{itensDe(c.id).length} desejo(s) nesta categoria</Text>
      <Text style={[s.rotulo, { color: cores.texto }]}>Subcategorias</Text>
      {subs.length ? (
        <View style={s.chips}>
          {subs.map((x) => (
            <Chip key={x.id} rotulo={`${x.nome} · ${itensDe(x.id).length}`} />
          ))}
        </View>
      ) : (
        <Text style={[s.sub, { color: cores.sub }]}>Nenhuma. Toque em Editar para criar.</Text>
      )}
      <Botao titulo="Editar categoria" variante="alternativo" onPress={() => nav.navigate('FormCategoria', { id: c.id })} />
    </Tela>
  );
}

const s = StyleSheet.create({
  sub: { fontFamily: fontes.texto, fontSize: 14 },
  rotulo: { fontFamily: fontes.titulo, fontSize: 18, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
