import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useDados } from '../dados/DadosContext';

/** Faixa "Desejo excluído · Desfazer" que some sozinha depois de alguns segundos. */
export function AvisoDesfazer() {
  const { cores } = useTema();
  const insets = useSafeAreaInsets();
  const { ultimaExclusao, desfazerExclusao, limparExclusao } = useDados();

  useEffect(() => {
    if (!ultimaExclusao) return;
    const t = setTimeout(limparExclusao, 6000);
    return () => clearTimeout(t);
  }, [ultimaExclusao, limparExclusao]);

  if (!ultimaExclusao) return null;
  return (
    <View pointerEvents="box-none" style={[s.fora, { bottom: 104 + insets.bottom }]}>
      <View style={[s.caixa, { backgroundColor: cores.abaAtiva }]}>
        <Text numberOfLines={1} style={[s.txt, { color: cores.texto }]}>“{ultimaExclusao.nome}” excluído</Text>
        <Pressable onPress={desfazerExclusao} hitSlop={10} accessibilityRole="button">
          <Text style={[s.desfazer, { color: cores.destaque }]}>Desfazer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fora: { position: 'absolute', left: 16, right: 16 },
  caixa: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16 },
  txt: { flex: 1, fontFamily: fontes.textoSemi, fontSize: 14 },
  desfazer: { fontFamily: fontes.tituloForte, fontSize: 14 },
});
