import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import {
  Raleway_300Light,
  Raleway_400Regular,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from '@expo-google-fonts/raleway';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { TemaProvider, useTema } from './src/tema/TemaContext';
import { SessaoProvider } from './src/sessao/SessaoContext';
import { Navegacao } from './src/navegacao';

function Raiz() {
  const { pronto, modoEscuro, cores } = useTema();
  const [fontesOk] = useFonts({
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Raleway_300Light,
    Raleway_400Regular,
    Raleway_600SemiBold,
    Raleway_700Bold,
    BebasNeue_400Regular,
  });

  if (!pronto || !fontesOk) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={cores.acento} />
      </View>
    );
  }
  return (
    <>
      <StatusBar style={modoEscuro ? 'light' : 'dark'} />
      <Navegacao />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <SessaoProvider>
          <Raiz />
        </SessaoProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}
