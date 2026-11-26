import React from 'react';
import { Image, Pressable, View } from 'react-native';

type Props = {
  valor: number | null;
  aoMudar?: (n: number | null) => void;
  tamanho?: number;
};

/** Avaliação de 1 a 5 estrelas. Sem `aoMudar` é só leitura. Tocar na nota atual limpa a avaliação. */
export function Estrelas({ valor, aoMudar, tamanho = 34 }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const cheia = (valor ?? 0) >= n;
        const img = (
          <Image
            source={cheia ? require('../../assets/estrela.png') : require('../../assets/estrela-off.png')}
            style={{ width: tamanho, height: tamanho * (153 / 160) }}
            resizeMode="contain"
          />
        );
        return aoMudar ? (
          <Pressable key={n} accessibilityLabel={`${n} estrela(s)`} hitSlop={4} onPress={() => aoMudar(valor === n ? null : n)}>
            {img}
          </Pressable>
        ) : (
          <View key={n}>{img}</View>
        );
      })}
    </View>
  );
}
