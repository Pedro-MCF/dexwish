import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Tela, Topo } from '../componentes/Tela';
import { Campo } from '../componentes/Campo';
import { Botao } from '../componentes/Botao';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { SubForm, useDados } from '../dados/DadosContext';

/** Criar/editar categoria. Subcategorias: só um nível. */
export function FormCategoria() {
  const { cores } = useTema();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const id: string | undefined = params?.id;
  const { categoria, filhas, salvarCategoria } = useDados();
  const atual = categoria(id);

  const [nome, setNome] = useState(atual?.nome ?? '');
  const [subs, setSubs] = useState<SubForm[]>(id ? filhas(id).map((x) => ({ id: x.id, nome: x.nome })) : []);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const mudar = (i: number, v: string) => setSubs(subs.map((x, k) => (k === i ? { ...x, nome: v } : x)));

  const salvar = async () => {
    setSalvando(true);
    const r = await salvarCategoria({ id, nome, subs });
    setSalvando(false);
    if (r.erro) return setErro(r.erro);
    nav.goBack();
  };

  return (
    <Tela>
      <Topo titulo={id ? 'Editar categoria' : 'Nova categoria'} aoVoltar={() => nav.goBack()} />
      <Campo rotulo="Nome" value={nome} onChangeText={setNome} placeholder="Ex.: Tecnologia" maxLength={40} />

      <Text style={[s.rotulo, { color: cores.texto }]}>Subcategorias (opcional)</Text>
      {subs.map((x, i) => (
        <Campo
          key={x.id ?? `n${i}`}
          value={x.nome}
          onChangeText={(v) => mudar(i, v)}
          placeholder="Nome da subcategoria"
          maxLength={40}
          direita={
            <Pressable accessibilityLabel="Remover subcategoria" hitSlop={10} onPress={() => setSubs(subs.filter((_, k) => k !== i))}>
              <Ionicons name="close-circle" size={24} color={cores.sub} />
            </Pressable>
          }
        />
      ))}
      <Botao titulo="+ Adicionar subcategoria" variante="texto" onPress={() => setSubs([...subs, { nome: '' }])} />

      {erro ? <Text style={[s.erro, { color: cores.erro }]}>{erro}</Text> : null}
      <View style={{ marginTop: 6 }}>
        <Botao titulo="Salvar" onPress={salvar} carregando={salvando} />
      </View>
    </Tela>
  );
}

const s = StyleSheet.create({
  rotulo: { fontFamily: fontes.titulo, fontSize: 16, marginTop: 4 },
  erro: { fontFamily: fontes.textoSemi, fontSize: 14 },
});
