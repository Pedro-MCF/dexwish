import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Tela, Topo } from '../componentes/Tela';
import { Campo } from '../componentes/Campo';
import { Botao } from '../componentes/Botao';
import { Selo } from '../componentes/Selo';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useDados } from '../dados/DadosContext';
import { NOME_SELO_PADRAO } from '../tipos';

export function MeusSelos() {
  const { cores } = useTema();
  const nav = useNavigation<any>();
  const { selos, itens, criarSelo, excluirSelo } = useDados();
  const [novo, setNovo] = useState('');
  const [erro, setErro] = useState('');

  const total = (nome: string) => itens.filter((i) => i.selo === nome).length;

  const criar = async () => {
    const r = await criarSelo(novo);
    if (r.erro) return setErro(r.erro);
    setErro('');
    setNovo('');
  };

  const excluir = (id: string, nome: string) =>
    Alert.alert(`Excluir o selo "${nome}"?`, 'Os desejos que tinham esse selo voltam para a lista em aberto.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => excluirSelo(id) },
    ]);

  return (
    <Tela>
      <Topo titulo="Meus selos" aoVoltar={() => nav.goBack()} />
      <View style={[s.linha, { backgroundColor: cores.cartao }]}>
        <Selo nome={NOME_SELO_PADRAO} tamanho={56} />
        <View style={{ flex: 1 }}>
          <Text style={[s.nome, { color: cores.texto }]}>{NOME_SELO_PADRAO}</Text>
          <Text style={[s.sub, { color: cores.sub }]}>Selo padrão · {total(NOME_SELO_PADRAO)} desejo(s)</Text>
        </View>
      </View>
      {selos.map((x) => (
        <View key={x.id} style={[s.linha, { backgroundColor: cores.cartao }]}>
          <Selo nome={x.nome} tamanho={56} />
          <View style={{ flex: 1 }}>
            <Text style={[s.nome, { color: cores.texto }]}>{x.nome}</Text>
            <Text style={[s.sub, { color: cores.sub }]}>{total(x.nome)} desejo(s)</Text>
          </View>
          <Pressable accessibilityLabel={`Excluir selo ${x.nome}`} hitSlop={10} onPress={() => excluir(x.id, x.nome)}>
            <Ionicons name="trash-outline" size={22} color={cores.erro} />
          </Pressable>
        </View>
      ))}

      <Campo rotulo="Novo selo" value={novo} onChangeText={setNovo} placeholder="Ex.: Ganhei de presente" maxLength={20} onSubmitEditing={criar} />
      {erro ? <Text style={[s.erro, { color: cores.erro }]}>{erro}</Text> : null}
      <Botao titulo="Criar selo" variante="alternativo" onPress={criar} />
    </Tela>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 20 },
  nome: { fontFamily: fontes.titulo, fontSize: 17 },
  sub: { fontFamily: fontes.texto, fontSize: 13 },
  erro: { fontFamily: fontes.textoSemi, fontSize: 14 },
});
