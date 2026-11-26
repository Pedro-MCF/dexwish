import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';

type Props = {
  visivel: boolean;
  aoFechar: () => void;
  titulo?: string;
  children: React.ReactNode;
};

/** Menu que sobe do rodapé (filtros, opções, confirmações). */
export function FolhaInferior({ visivel, aoFechar, titulo, children }: Props) {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar} statusBarTranslucent>
      <View style={s.fundo}>
        <Pressable style={StyleSheet.absoluteFill} onPress={aoFechar} accessibilityLabel="Fechar" />
        <View style={[s.folha, { backgroundColor: cores.cartao, paddingBottom: 20 + insets.bottom }]}>
          <View style={[s.alca, { backgroundColor: cores.anel }]} />
          {titulo ? <Text style={[s.titulo, { color: cores.texto }]}>{titulo}</Text> : null}
          <ScrollView bounces={false} keyboardShouldPersistTaps="handled" style={{ maxHeight: 520 }}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type OpcaoProps = {
  rotulo: string;
  onPress: () => void;
  marcada?: boolean;
  perigo?: boolean;
  destaque?: boolean;
  direita?: React.ReactNode;
  primeira?: boolean;
};

/** Linha de opção dentro da folha. */
export function Opcao({ rotulo, onPress, marcada, perigo, destaque, direita, primeira }: OpcaoProps) {
  const { cores } = useTema();
  const cor = perigo ? cores.erro : destaque ? cores.destaque : cores.texto;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        s.opcao,
        { borderTopColor: cores.linha, borderTopWidth: primeira ? 0 : 1, backgroundColor: pressed ? cores.chip : 'transparent' },
      ]}
    >
      <Text style={[s.opcaoTxt, { color: cor }]}>{rotulo}</Text>
      {direita ? direita : marcada ? <Text style={{ color: cores.destaque, fontSize: 20 }}>✓</Text> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  folha: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 10 },
  alca: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, marginBottom: 14 },
  titulo: { fontFamily: fontes.titulo, fontSize: 20, marginBottom: 6 },
  opcao: {
    paddingVertical: 14,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  opcaoTxt: { fontFamily: fontes.textoSemi, fontSize: 16, flexShrink: 1 },
});
