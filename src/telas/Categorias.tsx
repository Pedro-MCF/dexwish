import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Logo } from '../componentes/Logo';
import { Tela } from '../componentes/Tela';
import { Vazio } from '../componentes/Vazio';
import { Botao } from '../componentes/Botao';
import { FolhaInferior, Opcao } from '../componentes/FolhaInferior';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useDados } from '../dados/DadosContext';
import { Categoria } from '../tipos';

export function Categorias() {
  const { cores } = useTema();
  const nav = useNavigation<any>();
  const { principais, filhas, itensDe, excluirCategoria } = useDados();
  const [menu, setMenu] = useState<Categoria | null>(null);
  const lista = principais();

  const confirmarExclusao = (c: Categoria) => {
    setMenu(null);
    Alert.alert(
      `Excluir "${c.nome}"?`,
      'As subcategorias também serão excluídas. Os desejos dela continuam na sua lista, só ficam sem categoria.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const r = await excluirCategoria(c.id);
            if (r.erro) Alert.alert('Ops', r.erro);
          },
        },
      ],
    );
  };

  return (
    <Tela comAbas>
      <View style={s.logo}>
        <Logo altura={34} />
      </View>
      <Text style={[s.h1, { color: cores.texto }]}>Categorias</Text>

      {lista.length === 0 ? (
        <Vazio icone="grid-outline" titulo="Nenhuma categoria ainda" texto="Elas são opcionais. Crie uma para organizar seus desejos." />
      ) : (
        lista.map((c) => {
          const subs = filhas(c.id);
          return (
            <Pressable
              key={c.id}
              onPress={() => nav.navigate('Categoria', { id: c.id })}
              onLongPress={() => setMenu(c)}
              delayLongPress={450}
              style={({ pressed }) => [s.cartao, { backgroundColor: cores.cartao, opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.nome, { color: cores.texto }]}>{c.nome}</Text>
                <Text style={[s.sub, { color: cores.sub }]}>
                  {itensDe(c.id).length} desejo(s){subs.length ? ` · ${subs.length} subcategoria(s)` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={cores.sub} />
            </Pressable>
          );
        })
      )}

      <Botao titulo="+ Nova categoria" variante="alternativo" onPress={() => nav.navigate('FormCategoria')} />

      <FolhaInferior visivel={!!menu} aoFechar={() => setMenu(null)} titulo={menu?.nome}>
        <Opcao
          primeira
          rotulo="Editar"
          onPress={() => {
            const id = menu!.id;
            setMenu(null);
            nav.navigate('FormCategoria', { id });
          }}
        />
        <Opcao rotulo="Excluir" perigo onPress={() => menu && confirmarExclusao(menu)} />
      </FolhaInferior>
    </Tela>
  );
}

const s = StyleSheet.create({
  logo: { alignItems: 'center', paddingTop: 10 },
  h1: { fontFamily: fontes.tituloMedio, fontSize: 32 },
  cartao: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, gap: 10 },
  nome: { fontFamily: fontes.titulo, fontSize: 18 },
  sub: { fontFamily: fontes.texto, fontSize: 13 },
});
