import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { Item } from '../tipos';
import { formatarPreco } from '../util/formatar';
import { IconePrioridade } from './IconePrioridade';

type Props = {
  item: Item;
  grade?: boolean;
  categoria: string;
  onPress: () => void;
  onLongPress: () => void;
};

export function CartaoItem({ item, grade, categoria, onPress, onLongPress }: Props) {
  const { cores } = useTema();
  const foto = item.imagem ? (
    <Image source={{ uri: item.imagem }} style={grade ? s.fotoGrade : s.fotoLista} />
  ) : (
    <View style={[grade ? s.fotoGrade : s.fotoLista, { backgroundColor: cores.chip, alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name="gift-outline" size={grade ? 34 : 26} color={cores.sub} />
    </View>
  );
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={450}
      style={({ pressed }) => [
        s.cartao,
        grade ? s.cartaoGrade : s.cartaoLista,
        { backgroundColor: cores.cartao, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {foto}
      <View style={{ flex: 1, gap: 3, padding: grade ? 10 : 0 }}>
        <Text numberOfLines={grade ? 2 : 1} style={[s.nome, { color: cores.texto }]}>{item.nome}</Text>
        <Text numberOfLines={1} style={[s.sub, { color: cores.sub }]}>{categoria}</Text>
        <View style={s.rodape}>
          <Text style={[s.preco, { color: cores.destaque }]}>{item.preco !== null ? formatarPreco(item.preco) : ''}</Text>
          <IconePrioridade nivel={item.prioridade} altura={18} />
        </View>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  cartao: { borderRadius: 20, overflow: 'hidden' },
  cartaoLista: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  cartaoGrade: { flex: 1 },
  fotoLista: { width: 62, height: 62, borderRadius: 14 },
  fotoGrade: { width: '100%', height: 120 },
  nome: { fontFamily: fontes.titulo, fontSize: 16 },
  sub: { fontFamily: fontes.texto, fontSize: 12 },
  rodape: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  preco: { fontFamily: fontes.tituloForte, fontSize: 14 },
});
