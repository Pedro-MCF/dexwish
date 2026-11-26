import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Logo } from '../componentes/Logo';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useSessao } from '../sessao/SessaoContext';
import type { RotasAuth } from '../navegacao/tipos';

export function BoasVindas({ navigation }: NativeStackScreenProps<RotasAuth, 'BoasVindas'>) {
  const { cores } = useTema();
  const { entrarConvidado, entrarComGoogle } = useSessao();
  const [erro, setErro] = useState('');

  const google = async () => {
    setErro('');
    const r = await entrarComGoogle();
    if (r.erro) setErro(r.erro);
  };
  const convidado = async () => {
    setErro('');
    const r = await entrarConvidado();
    if (r.erro) setErro(r.erro);
  };

  return (
    <SafeAreaView style={[s.raiz, { backgroundColor: cores.fundo }]}>
      <View style={s.centro}>
        <Logo altura={56} />
        <Text style={[s.slogan, { color: cores.sub }]}>Seus desejos, em um só lugar</Text>
      </View>

      <View style={s.baixo}>
        <Text style={[s.acesso, { color: cores.texto }]}>
          <Text onPress={() => navigation.navigate('Login', { modo: 'cadastrar' })}>Inscrever-se</Text>
          <Text style={{ fontFamily: fontes.texto, color: cores.sub }}> ou </Text>
          <Text onPress={() => navigation.navigate('Login', { modo: 'entrar' })}>Faça login</Text>
        </Text>

        <View style={s.redondos}>
          <Pressable
            accessibilityLabel="Entrar com Google"
            onPress={google}
            style={[s.redondo, { backgroundColor: cores.chip }]}
          >
            <Ionicons name="logo-google" size={26} color={cores.texto} />
          </Pressable>
          <Pressable
            accessibilityLabel="Entrar com e-mail"
            onPress={() => navigation.navigate('Login', { modo: 'entrar' })}
            style={[s.redondo, { backgroundColor: cores.chip }]}
          >
            <Ionicons name="at" size={28} color={cores.destaque} />
          </Pressable>
        </View>

        {erro ? <Text style={[s.erro, { color: cores.erro }]}>{erro}</Text> : null}

        <Pressable
          accessibilityRole="button"
          onPress={convidado}
          style={[s.convidado, { backgroundColor: cores.chip }]}
        >
          <Text style={[s.convidadoTxt, { color: cores.texto }]}>Entrar como convidado</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1, paddingHorizontal: 18, paddingBottom: 24, justifyContent: 'space-between' },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  slogan: { fontFamily: fontes.textoLeve, fontSize: 18 },
  baixo: { alignItems: 'center', gap: 16 },
  acesso: { fontFamily: fontes.textoForte, fontSize: 17 },
  redondos: { flexDirection: 'row', gap: 20 },
  redondo: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  convidado: { paddingVertical: 10, paddingHorizontal: 22, borderRadius: 999 },
  convidadoTxt: { fontFamily: fontes.textoSemi, fontSize: 16 },
  erro: { fontFamily: fontes.textoForte, fontSize: 14, textAlign: 'center' },
});
