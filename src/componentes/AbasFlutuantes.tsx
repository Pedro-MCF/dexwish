import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '../tema/TemaContext';
import { useSessao } from '../sessao/SessaoContext';

type Props = BottomTabBarProps & { aoNovoDesejo: () => void };

/** Barra flutuante: [casa] [+] [categorias] e, ao lado, a foto do perfil. */
export function AbasFlutuantes({ state, navigation, aoNovoDesejo }: Props) {
  const { cores } = useTema();
  const { usuario } = useSessao();
  const insets = useSafeAreaInsets();
  const atual = state.routes[state.index].name;

  const ir = (nome: string) => {
    if (atual !== nome) navigation.navigate(nome as never);
  };

  const Aba = ({ nome, icone, rotulo }: { nome: string; icone: 'home' | 'grid'; rotulo: string }) => {
    const ativa = atual === nome;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={rotulo}
        accessibilityState={{ selected: ativa }}
        onPress={() => ir(nome)}
        style={[s.aba, ativa && { backgroundColor: cores.abaAtiva }]}
      >
        <Ionicons
          name={ativa ? icone : (`${icone}-outline` as 'home-outline' | 'grid-outline')}
          size={29}
          color={ativa ? cores.texto : cores.sub}
        />
      </Pressable>
    );
  };

  const sombra = { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 8 };

  return (
    <View style={[s.raiz, { bottom: 14 + insets.bottom }]} pointerEvents="box-none">
      <View style={[s.pilula, { backgroundColor: cores.aba, borderColor: cores.anel }, sombra]}>
        <Aba nome="Geral" icone="home" rotulo="Início" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Novo desejo"
          onPress={aoNovoDesejo}
          style={s.aba}
        >
          <Ionicons name="add-circle-outline" size={32} color={cores.sub} />
        </Pressable>
        <Aba nome="Categorias" icone="grid" rotulo="Categorias" />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Perfil"
        onPress={() => ir('Perfil')}
        style={[
          s.avatar,
          { backgroundColor: cores.aba, borderColor: atual === 'Perfil' ? cores.acento : cores.anel, borderWidth: atual === 'Perfil' ? 3 : 1.5 },
          sombra,
        ]}
      >
        {usuario?.avatarUrl ? (
          <Image source={{ uri: usuario.avatarUrl }} style={s.foto} />
        ) : (
          <Ionicons name="person" size={30} color={cores.sub} />
        )}
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  raiz: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14 },
  pilula: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, borderRadius: 999, borderWidth: 1.5 },
  aba: { width: 66, height: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 66, height: 66, borderRadius: 33, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  foto: { width: '100%', height: '100%' },
});
