import React from 'react';
import { Image, Text, View } from 'react-native';
import { fontes } from '../tema/cores';

/** Selo (carimbo) com o nome por cima. */
export function Selo({ nome, tamanho = 64 }: { nome: string; tamanho?: number }) {
  return (
    <View
      style={{
        width: tamanho,
        height: tamanho,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Image
        source={require('../../assets/selo.png')}
        resizeMode="contain"
        style={{ position: 'absolute', top: 0, left: 0, width: tamanho, height: tamanho }}
      />
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        style={{
          fontFamily: fontes.selo,
          color: '#1d102f',
          fontSize: tamanho * 0.2,
          textAlign: 'center',
          width: tamanho * 1.0,
          transform: [{ rotate: '-0deg' }],
        }}
      >
        {nome.toUpperCase()}
      </Text>
    </View>
  );
}