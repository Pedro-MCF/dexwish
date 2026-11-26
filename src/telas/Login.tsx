import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import { Logo } from '../componentes/Logo';
import { Tela, Topo } from '../componentes/Tela';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useSessao } from '../sessao/SessaoContext';
import type { RotasAuth } from '../navegacao/tipos';

const EMAIL = /^\S+@\S+\.\S+$/;

export function Login({ navigation, route }: NativeStackScreenProps<RotasAuth, 'Login'>) {
  const { cores } = useTema();
  const { entrar, cadastrar } = useSessao();
  const [cadastro, setCadastro] = useState(route.params?.modo === 'cadastrar');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const enviar = async () => {
    setErro('');
    setAviso('');
    const u = usuario.trim();
    if (!u) return setErro('Digite o nome de usuário.');
    if (cadastro && !EMAIL.test(email.trim())) return setErro('Digite um e-mail válido, como usuario@gmail.com.');
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.');
    setCarregando(true);
    const r = cadastro ? await cadastrar(u, email.trim(), senha) : await entrar(u, senha);
    setCarregando(false);
    if (r.erro) setErro(r.erro);
    if (r.aviso) setAviso(r.aviso);
  };

  return (
    <Tela estilo={{ paddingTop: 0 }}>
      <Topo titulo="" aoVoltar={() => navigation.goBack()} />
      <View style={s.logo}>
        <Logo altura={44} />
      </View>
      <Text style={[s.titulo, { color: cores.texto }]}>{cadastro ? 'Cadastrar-se' : 'Entrar'}</Text>

      <Campo
        rotulo="Nome de usuário"
        icone="at"
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Usuário123"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {cadastro ? (
        <Campo
          rotulo="E-mail"
          icone="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="usuario@gmail.com"
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
      ) : null}
      <Campo
        rotulo="Senha"
        icone="lock-closed-outline"
        value={senha}
        onChangeText={setSenha}
        senha
        placeholder="••••••"
        autoCapitalize="none"
      />

      {!cadastro ? (
        <Pressable onPress={() => navigation.navigate('RecuperarSenha')} style={{ alignSelf: 'flex-end' }} hitSlop={8}>
          <Text style={[s.esqueci, { color: cores.destaque }]}>Esqueci minha senha</Text>
        </Pressable>
      ) : null}

      {erro ? <Text style={[s.erro, { color: cores.erro }]}>{erro}</Text> : null}
      {aviso ? <Text style={[s.erro, { color: cores.destaque }]}>{aviso}</Text> : null}

      <Botao titulo={cadastro ? 'Criar conta' : 'Entrar'} onPress={enviar} carregando={carregando} />
      <Botao
        variante="texto"
        titulo={cadastro ? 'Já tenho conta' : 'Criar uma conta'}
        onPress={() => {
          setErro('');
          setAviso('');
          setCadastro(!cadastro);
        }}
      />
    </Tela>
  );
}

const s = StyleSheet.create({
  logo: { alignItems: 'center', marginTop: 8 },
  titulo: { fontFamily: fontes.titulo, fontSize: 30, textAlign: 'center', marginVertical: 12 },
  esqueci: { fontFamily: fontes.textoSemi, fontSize: 14 },
  erro: { fontFamily: fontes.textoForte, fontSize: 14 },
});
