import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Botao } from '../componentes/Botao';
import { Logo } from '../componentes/Logo';
import { Tela } from '../componentes/Tela';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useNavigation } from '@react-navigation/native';
import { useSessao } from '../sessao/SessaoContext';

export function Perfil() {
  const { cores, modoEscuro, definir } = useTema();
  const { usuario, sair } = useSessao();
  const nav = useNavigation<any>();

  const pedirSaida = () => {
    if (usuario?.convidado) {
      Alert.alert(
        'Sair da conta de convidado?',
        'Uma conta de convidado não pode ser recuperada: ao sair, você perde seus desejos. Crie uma conta para guardá-los.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Sair e apagar', style: 'destructive', onPress: () => sair() },
        ],
      );
    } else {
      sair();
    }
  };

  return (
    <Tela comAbas>
      <View style={s.logo}>
        <Logo altura={34} />
      </View>
      <View style={s.cabeca}>
        <View style={[s.avatar, { backgroundColor: cores.chip, borderColor: cores.anel }]}>
          <Ionicons name="person" size={46} color={cores.sub} />
        </View>
        <Text style={[s.nome, { color: cores.texto }]}>{usuario?.nome}</Text>
        {usuario?.convidado ? (
          <Text style={[s.sub, { color: cores.sub }]}>Conta de convidado</Text>
        ) : usuario?.email ? (
          <Text style={[s.sub, { color: cores.sub }]}>{usuario.email}</Text>
        ) : null}
      </View>

      <View style={[s.linha, { borderTopColor: cores.linha }]}>
        <Text style={[s.linhaTxt, { color: cores.texto }]}>Modo escuro</Text>
        <Switch
          value={modoEscuro}
          onValueChange={definir}
          trackColor={{ false: cores.anel, true: cores.acento }}
          thumbColor="#FFFFFF"
        />
      </View>

      <Pressable onPress={() => nav.navigate('Abas', { screen: 'Categorias' })} style={[s.linha, { borderTopColor: cores.linha }]}>
        <Text style={[s.linhaTxt, { color: cores.texto }]}>Minhas categorias</Text>
        <Ionicons name="chevron-forward" size={20} color={cores.sub} />
      </Pressable>
      <Pressable onPress={() => nav.navigate('MeusSelos')} style={[s.linha, { borderTopColor: cores.linha }]}>
        <Text style={[s.linhaTxt, { color: cores.texto }]}>Meus selos</Text>
        <Ionicons name="chevron-forward" size={20} color={cores.sub} />
      </Pressable>

      <Botao variante="perigo" titulo="Sair" onPress={pedirSaida} estilo={{ marginTop: 20 }} />
    </Tela>
  );
}

const s = StyleSheet.create({
  logo: { alignItems: 'center', paddingTop: 10 },
  cabeca: { alignItems: 'center', gap: 8, marginVertical: 8 },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  nome: { fontFamily: fontes.titulo, fontSize: 24 },
  sub: { fontFamily: fontes.texto, fontSize: 14 },
  linha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderTopWidth: 1 },
  linhaTxt: { fontFamily: fontes.textoSemi, fontSize: 16 },
});
