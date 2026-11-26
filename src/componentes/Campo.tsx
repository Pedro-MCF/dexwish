import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';

type Props = TextInputProps & {
  rotulo?: string;
  icone?: React.ComponentProps<typeof Ionicons>['name'];
  senha?: boolean;
  direita?: React.ReactNode;
};

export function Campo({ rotulo, icone, senha, direita, style, multiline, ...resto }: Props) {
  const { cores } = useTema();
  const [ver, setVer] = useState(false);
  const [foco, setFoco] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      {rotulo ? (
        <View style={s.linhaRotulo}>
          {icone ? <Ionicons name={icone} size={22} color={cores.texto} /> : null}
          <Text style={[s.rotulo, { color: icone ? cores.texto : cores.sub }]}>{rotulo}</Text>
        </View>
      ) : null}
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          {...resto}
          multiline={multiline}
          secureTextEntry={senha && !ver}
          placeholderTextColor={cores.sub + '99'}
          onFocus={(e) => {
            setFoco(true);
            resto.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFoco(false);
            resto.onBlur?.(e);
          }}
          style={[
            s.input,
            {
              backgroundColor: cores.campo,
              color: cores.texto,
              borderColor: foco ? cores.acento : cores.linha,
              paddingRight: senha || direita ? 52 : 16,
            },
            multiline && { height: 90, textAlignVertical: 'top' },
            style,
          ]}
        />
        {senha ? (
          <Pressable
            accessibilityLabel={ver ? 'Ocultar senha' : 'Mostrar senha'}
            onPress={() => setVer(!ver)}
            style={s.olho}
            hitSlop={10}
          >
            <Ionicons name={ver ? 'eye-off-outline' : 'eye-outline'} size={24} color={cores.texto} />
          </Pressable>
        ) : direita ? (
          <View style={s.olho}>{direita}</View>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  linhaRotulo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rotulo: { fontFamily: fontes.textoForte, fontSize: 14 },
  input: {
    fontFamily: fontes.texto,
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  olho: { position: 'absolute', right: 12 },
});
