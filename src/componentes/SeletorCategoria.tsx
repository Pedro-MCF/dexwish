import React, { useState } from 'react';
import { Text } from 'react-native';
import { FolhaInferior, Opcao } from './FolhaInferior';
import { useDados } from '../dados/DadosContext';

type Props = {
  visivel: boolean;
  aoFechar: () => void;
  valor: string | null;
  aoEscolher: (id: string | null) => void;
};

/** Escolha de categoria em dois passos: principal e, se houver, subcategoria. */
export function SeletorCategoria({ visivel, aoFechar, valor, aoEscolher }: Props) {
  const { principais, filhas, categoria } = useDados();
  const [pai, setPai] = useState<string | null>(null);

  const fechar = () => {
    setPai(null);
    aoFechar();
  };
  const escolher = (id: string | null) => {
    setPai(null);
    aoEscolher(id);
  };

  const principal = pai ? categoria(pai) : undefined;
  return (
    <FolhaInferior visivel={visivel} aoFechar={fechar} titulo={principal ? principal.nome : 'Categoria'}>
      {principal ? (
        <>
          <Opcao primeira rotulo={`Só "${principal.nome}"`} marcada={valor === principal.id} onPress={() => escolher(principal.id)} />
          {filhas(principal.id).map((f) => (
            <Opcao key={f.id} rotulo={f.nome} marcada={valor === f.id} onPress={() => escolher(f.id)} />
          ))}
          <Opcao rotulo="‹ Voltar" destaque onPress={() => setPai(null)} />
        </>
      ) : (
        <>
          <Opcao primeira rotulo="Sem categoria" marcada={valor === null} onPress={() => escolher(null)} />
          {principais().map((c) => {
            const subs = filhas(c.id);
            return (
              <Opcao
                key={c.id}
                rotulo={c.nome}
                marcada={valor === c.id || subs.some((x) => x.id === valor)}
                direita={subs.length ? <Text style={{ fontSize: 22, color: '#8B66FF' }}>›</Text> : undefined}
                onPress={() => (subs.length ? setPai(c.id) : escolher(c.id))}
              />
            );
          })}
        </>
      )}
    </FolhaInferior>
  );
}
