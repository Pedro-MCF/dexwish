import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { fontes } from '../tema/cores';

/** Selo (carimbo) com o nome por cima. */
export function Selo({ nome, tamanho = 64 }: { nome: string; tamanho?: number }) {
  return (
    <View style={{ width: tamanho, height: tamanho, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={require('../../assets/selo.png')} style={StyleSheet.absoluteFill} resizeMode="contain" />
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        style={{
          fontFamily: fontes.selo,
          color: '#FFFFFF',
          fontSize: tamanho * 0.24,
          textAlign: 'center',
          width: tamanho * 0.7,
          transform: [{ rotate: '-8deg' }],
        }}
      >
        {nome.toUpperCase()}
      </Text>
    </View>
  );
}
