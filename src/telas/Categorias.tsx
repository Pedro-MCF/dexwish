import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from '../componentes/Logo';
import { Tela } from '../componentes/Tela';
import { Vazio } from '../componentes/Vazio';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';

/** ETAPA 1: esqueleto. As categorias de verdade chegam na Etapa 3. */
export function Categorias() {
  const { cores } = useTema();
  return (
    <Tela comAbas>
      <View style={s.logo}>
        <Logo altura={34} />
      </View>
      <Text style={[s.h1, { color: cores.texto }]}>Categorias</Text>
      <Vazio icone="grid-outline" titulo="Nenhuma categoria ainda" texto="Elas são opcionais. Você poderá criar a primeira na próxima etapa." />
    </Tela>
  );
}

const s = StyleSheet.create({
  logo: { alignItems: 'center', paddingTop: 10 },
  h1: { fontFamily: fontes.tituloMedio, fontSize: 32 },
});
