export type Prioridade = 'alta' | 'media' | 'baixa';

export type Categoria = {
  id: string;
  nome: string;
  /** id da categoria principal quando for uma subcategoria; null nas principais */
  pai: string | null;
};

export type Selo = { id: string; nome: string };

export type Item = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string | null;
  prioridade: Prioridade;
  preco: number | null;
  link: string;
  imagem: string;
  concluido: boolean;
  selo: string | null;
  nota: number | null;
  comentario: string;
  concluidoEm: string | null;
  criadoEm: string;
};

/** Converte uma linha da tabela "item" do banco para o formato usado no app. */
export function itemDeLinha(l: any): Item {
  return {
    id: l.id,
    nome: l.nome ?? '',
    descricao: l.descricao ?? '',
    categoria: l.id_categoria ?? null,
    prioridade: (l.prioridade as Prioridade) ?? 'media',
    preco: l.preco === null || l.preco === undefined ? null : Number(l.preco),
    link: l.link ?? '',
    imagem: l.imagem_url ?? '',
    concluido: !!l.concluido,
    selo: l.selo ?? null,
    nota: l.nota ?? null,
    comentario: l.comentario ?? '',
    concluidoEm: l.concluido_em ?? null,
    criadoEm: l.criado_em ?? '',
  };
}

export const NOME_SELO_PADRAO = 'Concluído';
