import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'texto' | 'alternativo' | 'perigo';
  desabilitado?: boolean;
  carregando?: boolean;
  estilo?: ViewStyle;
};

export function Botao({ titulo, onPress, variante = 'primario', desabilitado, carregando, estilo }: Props) {
  const { cores } = useTema();
  const fundo =
    variante === 'primario' ? cores.acento : variante === 'alternativo' ? cores.chip : 'transparent';
  const cor =
    variante === 'primario'
      ? '#FFFFFF'
      : variante === 'perigo'
        ? cores.erro
        : variante === 'alternativo'
          ? cores.texto
          : cores.destaque;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      disabled={desabilitado || carregando}
      onPress={onPress}
      style={({ pressed }) => [
        s.base,
        { backgroundColor: fundo, opacity: desabilitado ? 0.5 : pressed ? 0.85 : 1 },
        variante === 'perigo' && { borderWidth: 2, borderColor: cores.erro },
        pressed && { transform: [{ scale: 0.98 }] },
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={cor} />
      ) : (
        <Text style={[s.txt, { color: cor }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { paddingVertical: 15, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  txt: { fontFamily: fontes.tituloForte, fontSize: 17 },
});
