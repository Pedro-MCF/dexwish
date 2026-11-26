import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CartaoItem } from './CartaoItem';
import { FolhaInferior, Opcao } from './FolhaInferior';
import { useDados } from '../dados/DadosContext';
import { Item } from '../tipos';

/** Lista (ou grade) de desejos com o menu de segurar (editar / excluir). */
export function ListaItens({ itens, grade }: { itens: Item[]; grade: boolean }) {
  const nav = useNavigation<any>();
  const { caminho, excluirItem } = useDados();
  const [menu, setMenu] = useState<Item | null>(null);

  const cartao = (i: Item) => (
    <CartaoItem
      key={i.id}
      item={i}
      grade={grade}
      categoria={caminho(i.categoria)}
      onPress={() => nav.navigate('Detalhes', { id: i.id })}
      onLongPress={() => setMenu(i)}
    />
  );

  return (
    <>
      {grade ? (
        <View style={s.grade}>
          {itens.map((i) => (
            <View key={i.id} style={s.celula}>{cartao(i)}</View>
          ))}
        </View>
      ) : (
        <View style={{ gap: 10 }}>{itens.map(cartao)}</View>
      )}

      <FolhaInferior visivel={!!menu} aoFechar={() => setMenu(null)} titulo={menu?.nome}>
        <Opcao
          primeira
          rotulo="Editar"
          onPress={() => {
            const id = menu!.id;
            setMenu(null);
            nav.navigate('FormItem', { id });
          }}
        />
        <Opcao
          rotulo="Excluir"
          perigo
          onPress={async () => {
            const id = menu!.id;
            setMenu(null);
            const r = await excluirItem(id);
            if (r.erro) Alert.alert('Ops', r.erro);
          }}
        />
      </FolhaInferior>
    </>
  );
}

const s = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  celula: { width: '48%', flexGrow: 1, flexBasis: '45%' },
});
