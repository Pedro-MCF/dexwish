import type { NavigatorScreenParams } from '@react-navigation/native';

export type RotasAuth = {
  BoasVindas: undefined;
  Login: { modo?: 'entrar' | 'cadastrar' } | undefined;
  RecuperarSenha: undefined;
};

export type RotasAbas = {
  Geral: undefined;
  Categorias: undefined;
  Perfil: undefined;
};

export type RotasApp = {
  Abas: NavigatorScreenParams<RotasAbas> | undefined;
};
