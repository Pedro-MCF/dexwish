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
import { DadosProvider } from './src/dados/DadosContext';
import { Navegacao } from './src/navegacao';
import { configurado } from './src/lib/supabase';
import { Text } from 'react-native';

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
  if (!configurado) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12 }}>
        <Text style={{ color: cores.texto, fontFamily: 'Montserrat_600SemiBold', fontSize: 20, textAlign: 'center' }}>
          Falta configurar o Supabase
        </Text>
        <Text style={{ color: cores.sub, fontFamily: 'Raleway_400Regular', fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
          Copie o arquivo .env.example para .env, cole a URL e a chave do seu projeto e reinicie com: npx expo start -c
        </Text>
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
          <DadosProvider>
            <Raiz />
          </DadosProvider>
        </SessaoProvider>
      </TemaProvider>
    </SafeAreaProvider>
  );
}
