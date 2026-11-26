import React from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTema } from '../tema/TemaContext';
import { useSessao } from '../sessao/SessaoContext';
import { AbasFlutuantes } from '../componentes/AbasFlutuantes';
import { BoasVindas } from '../telas/BoasVindas';
import { Login } from '../telas/Login';
import { RecuperarSenha } from '../telas/RecuperarSenha';
import { Geral } from '../telas/Geral';
import { Categorias } from '../telas/Categorias';
import { Perfil } from '../telas/Perfil';
import type { RotasAbas, RotasApp, RotasAuth } from './tipos';

const Auth = createNativeStackNavigator<RotasAuth>();
const Pilha = createNativeStackNavigator<RotasApp>();
const Abas = createBottomTabNavigator<RotasAbas>();

function TelasComAbas() {
  return (
    <Abas.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <AbasFlutuantes
          {...props}
          aoNovoDesejo={() => Alert.alert('Novo desejo', 'Esta tela chega na Etapa 4.')}
        />
      )}
    >
      <Abas.Screen name="Geral" component={Geral} />
      <Abas.Screen name="Categorias" component={Categorias} />
      <Abas.Screen name="Perfil" component={Perfil} />
    </Abas.Navigator>
  );
}

export function Navegacao() {
  const { cores, modoEscuro } = useTema();
  const { usuario, carregando } = useSessao();

  const base = modoEscuro ? DarkTheme : DefaultTheme;
  const tema = {
    ...base,
    colors: { ...base.colors, background: cores.fundo, card: cores.fundo, text: cores.texto, border: cores.linha, primary: cores.acento },
  };

  if (carregando) {
    return (
      <View style={{ flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={cores.acento} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={tema}>
      {usuario ? (
        <Pilha.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
          <Pilha.Screen name="Abas" component={TelasComAbas} />
        </Pilha.Navigator>
      ) : (
        <Auth.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }}>
          <Auth.Screen name="BoasVindas" component={BoasVindas} />
          <Auth.Screen name="Login" component={Login} />
          <Auth.Screen name="RecuperarSenha" component={RecuperarSenha} />
        </Auth.Navigator>
      )}
    </NavigationContainer>
  );
}
