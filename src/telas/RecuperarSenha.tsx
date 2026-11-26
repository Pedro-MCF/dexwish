import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Botao } from '../componentes/Botao';
import { Campo } from '../componentes/Campo';
import { Tela, Topo } from '../componentes/Tela';
import { useTema } from '../tema/TemaContext';
import { fontes } from '../tema/cores';
import { useSessao } from '../sessao/SessaoContext';
import type { RotasAuth } from '../navegacao/tipos';

const EMAIL = /^\S+@\S+\.\S+$/;

/** Recuperação em 2 passos: (1) pede o e-mail e recebe um código; (2) digita o código e a nova senha. */
export function RecuperarSenha({ navigation }: NativeStackScreenProps<RotasAuth, 'RecuperarSenha'>) {
  const { cores } = useTema();
  const { recuperarSenha, redefinirSenha } = useSessao();
  const [passo, setPasso] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nova, setNova] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const enviarCodigo = async () => {
    setErro('');
    if (!EMAIL.test(email.trim())) return setErro('Digite um e-mail válido, como usuario@gmail.com.');
    setCarregando(true);
    const r = await recuperarSenha(email.trim());
    setCarregando(false);
    if (r.erro) setErro(r.erro);
    else setPasso(2);
  };

  const salvar = async () => {
    setErro('');
    if (codigo.trim().length < 6) return setErro('Digite o código de 6 dígitos que chegou no e-mail.');
    if (nova.length < 6) return setErro('A nova senha precisa ter pelo menos 6 caracteres.');
    setCarregando(true);
    const r = await redefinirSenha(email.trim(), codigo.trim(), nova);
    setCarregando(false);
    if (r.erro) setErro(r.erro);
    // Se deu certo, a sessão é aberta e o app troca de tela sozinho.
  };

  return (
    <Tela>
      <Topo titulo="Recuperar senha" aoVoltar={() => navigation.goBack()} />
      {passo === 1 ? (
        <>
          <Text style={[s.texto, { color: cores.sub }]}>
            Digite o e-mail da sua conta e enviaremos um código para você criar uma nova senha.
          </Text>
          <Campo
            rotulo="E-mail da conta"
            icone="mail-outline"
            value={email}
            onChangeText={setEmail}
            placeholder="usuario@gmail.com"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />
          {erro ? <Text style={[s.erro, { color: cores.erro }]}>{erro}</Text> : null}
          <Botao titulo="Enviar código" onPress={enviarCodigo} carregando={carregando} />
          <Botao variante="texto" titulo="Cancelar" onPress={() => navigation.goBack()} />
        </>
      ) : (
        <>
          <Text style={[s.texto, { color: cores.texto }]}>
            Enviamos um código para <Text style={{ fontFamily: fontes.textoForte }}>{email.trim()}</Text>. Digite-o abaixo e escolha
            a nova senha.
          </Text>
          <Text style={[s.dica, { color: cores.sub }]}>Não chegou? Veja a caixa de spam ou volte e envie de novo.</Text>
          <Campo
            rotulo="Código"
            icone="keypad-outline"
            value={codigo}
            onChangeText={setCodigo}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={8}
          />
          <Campo rotulo="Nova senha" icone="lock-closed-outline" value={nova} onChangeText={setNova} senha autoCapitalize="none" />
          {erro ? <Text style={[s.erro, { color: cores.erro }]}>{erro}</Text> : null}
          <Botao titulo="Salvar nova senha" onPress={salvar} carregando={carregando} />
          <Botao variante="texto" titulo="Voltar" onPress={() => setPasso(1)} />
        </>
      )}
    </Tela>
  );
}

const s = StyleSheet.create({
  texto: { fontFamily: fontes.texto, fontSize: 15, lineHeight: 22 },
  dica: { fontFamily: fontes.texto, fontSize: 13 },
  erro: { fontFamily: fontes.textoForte, fontSize: 14 },
});
