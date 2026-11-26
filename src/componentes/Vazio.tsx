import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';

type Props = { icone: React.ComponentProps<typeof Ionicons>['name']; titulo: string; texto: string };

export function Vazio({ icone, titulo, texto }: Props) {
  const { cores } = useTema();
  return (
    <View style={s.caixa}>
      <View style={[s.circulo, { backgroundColor: cores.acento + '29' }]}>
        <Ionicons name={icone} size={30} color={cores.destaque} />
      </View>
      <Text style={[s.titulo, { color: cores.texto }]}>{titulo}</Text>
      <Text style={[s.texto, { color: cores.sub }]}>{texto}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  caixa: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 16, gap: 6 },
  circulo: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  titulo: { fontFamily: fontes.titulo, fontSize: 18 },
  texto: { fontFamily: fontes.texto, fontSize: 14, textAlign: 'center', lineHeight: 20, maxWidth: 260 },
});
