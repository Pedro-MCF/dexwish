import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';

type Props = {
  children: React.ReactNode;
  rolagem?: boolean;
  comAbas?: boolean;
  estilo?: StyleProp<ViewStyle>;
};

/** Fundo da tela + área segura + rolagem. `comAbas` deixa espaço para a barra flutuante. */
export function Tela({ children, rolagem = true, comAbas = false, estilo }: Props) {
  const { cores } = useTema();
  const conteudo = rolagem ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[s.conteudo, { paddingBottom: comAbas ? 140 : 40 }, estilo]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[s.conteudo, { flex: 1 }, estilo]}>{children}</View>
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.fundo }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {conteudo}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Barra de topo das telas internas: botão voltar + título. */
export function Topo({ titulo, aoVoltar }: { titulo: string; aoVoltar: () => void }) {
  const { cores } = useTema();
  return (
    <View style={s.topo}>
      <Pressable
        accessibilityLabel="Voltar"
        onPress={aoVoltar}
        style={[s.voltar, { backgroundColor: cores.chip }]}
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={24} color={cores.texto} />
      </Pressable>
      <Text numberOfLines={1} style={[s.tituloTopo, { color: cores.texto }]}>
        {titulo}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  conteudo: { paddingHorizontal: 18, paddingTop: 6, gap: 14 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 4 },
  voltar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tituloTopo: { flex: 1, fontFamily: fontes.titulo, fontSize: 22 },
});
