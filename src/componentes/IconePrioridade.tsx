import React from 'react';
import { Image } from 'react-native';
import { useTema } from '../tema/TemaContext';
import { Prioridade } from '../tipos';

const larguras: Record<Prioridade, number> = { alta: 111 / 120, media: 85 / 120, baixa: 50 / 120 };

export const NOME_PRIORIDADE: Record<Prioridade, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };

/** Ícone de prioridade (setas). `altura` em pixels. */
export function IconePrioridade({ nivel, altura = 22 }: { nivel: Prioridade; altura?: number }) {
  const { modoEscuro } = useTema();
  const fonte = modoEscuro
    ? { alta: require('../../assets/alta.png'), media: require('../../assets/media.png'), baixa: require('../../assets/baixa.png') }[nivel]
    : { alta: require('../../assets/alta-claro.png'), media: require('../../assets/media-claro.png'), baixa: require('../../assets/baixa-claro.png') }[nivel];
  return (
    <Image
      source={fonte}
      accessibilityLabel={`Prioridade ${NOME_PRIORIDADE[nivel]}`}
      resizeMode="contain"
      style={{ height: altura, width: altura * larguras[nivel] }}
    />
  );
}
