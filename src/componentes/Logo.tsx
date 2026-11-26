import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { useTema } from '../tema/TemaContext';

/** Logo "DexWish". `altura` em pixels; a largura segue a proporção da imagem (900x177). */
export function Logo({ altura = 36, estilo }: { altura?: number; estilo?: StyleProp<ImageStyle> }) {
  const { modoEscuro } = useTema();
  const fonte = modoEscuro
    ? require('../../assets/logo.png')
    : require('../../assets/logo-claro.png');
  return (
    <Image
      source={fonte}
      accessibilityLabel="DexWish"
      resizeMode="contain"
      style={[{ height: altura, width: altura * (900 / 177) }, estilo]}
    />
  );
}
