import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from '../componentes/Logo';
import { Tela } from '../componentes/Tela';
import { Vazio } from '../componentes/Vazio';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';

/** ETAPA 1: só o esqueleto. A lista, a busca e os filtros chegam na Etapa 4. */
export function Geral() {
  const { cores } = useTema();
  return (
    <Tela comAbas>
      <View style={s.logo}>
        <Logo altura={34} />
      </View>
      <Text style={[s.h1, { color: cores.texto }]}>Seus desejos</Text>
      <Vazio icone="add-circle-outline" titulo="Sua lista está vazia" texto="Toque no + lá embaixo para adicionar o primeiro desejo." />
    </Tela>
  );
}

const s = StyleSheet.create({
  logo: { alignItems: 'center', paddingTop: 10 },
  h1: { fontFamily: fontes.tituloMedio, fontSize: 32 },
});
