import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';

type Props = {
  rotulo: string;
  ativo?: boolean;
  tracejado?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  icone?: React.ReactNode;
};

export function Chip({ rotulo, ativo, tracejado, onPress, onLongPress, icone }: Props) {
  const { cores } = useTema();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      style={({ pressed }) => [
        s.chip,
        { backgroundColor: ativo ? cores.acento : tracejado ? 'transparent' : cores.chip },
        tracejado && { borderWidth: 1, borderStyle: 'dashed', borderColor: cores.sub },
        pressed && { opacity: 0.8 },
      ]}
    >
      {icone ? <View>{icone}</View> : null}
      <Text style={[s.txt, { color: ativo ? '#FFFFFF' : cores.sub }]}>{rotulo}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txt: { fontFamily: fontes.textoSemi, fontSize: 15 },
});
