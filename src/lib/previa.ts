/** Dados que dá para ler de uma página de produto. */
export type Previa = {
  titulo: string;
  imagem: string;
  descricao: string;
  preco: number | null;
  site: string;
};

function decodificar(t: string): string {
  return t
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
    .trim();
}

/** Lê o valor de uma <meta> (property= ou name=), com o content antes ou depois. */
function meta(html: string, chave: string): string {
  const c = chave.replace(/[.:]/g, '\\$&');
  const a = new RegExp(`<meta[^>]+(?:property|name)=["']${c}["'][^>]*?content=["']([^"']*)["']`, 'i').exec(html);
  if (a) return decodificar(a[1]);
  const b = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*?(?:property|name)=["']${c}["']`, 'i').exec(html);
  return b ? decodificar(b[1]) : '';
}

function numero(v: any): number | null {
  if (v === undefined || v === null || v === '') return null;
  let t = String(v).replace(/[^\d.,]/g, '');
  if (!t) return null;
  // "1.234,56" (BR) ou "1234.56" (EUA)
  if (t.includes(',') && t.includes('.')) t = t.lastIndexOf(',') > t.lastIndexOf('.') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  else if (t.includes(',')) t = t.replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Procura um "Product" nos blocos JSON-LD (é o que a maioria das lojas publica). */
function doJsonLd(html: string): Partial<Previa> {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const dados = JSON.parse(m[1].trim());
      const pilha: any[] = Array.isArray(dados) ? [...dados] : [dados];
      while (pilha.length) {
        const o = pilha.shift();
        if (!o || typeof o !== 'object') continue;
        if (Array.isArray(o['@graph'])) pilha.push(...o['@graph']);
        const tipo = ([] as string[]).concat(o['@type'] ?? []).join(',');
        if (/Product/i.test(tipo)) {
          const oferta = Array.isArray(o.offers) ? o.offers[0] : o.offers;
          const img = Array.isArray(o.image) ? o.image[0] : o.image;
          return {
            titulo: typeof o.name === 'string' ? decodificar(o.name) : '',
            descricao: typeof o.description === 'string' ? decodificar(o.description) : '',
            imagem: typeof img === 'string' ? img : (img?.url ?? ''),
            preco: numero(oferta?.price ?? oferta?.lowPrice ?? oferta?.priceSpecification?.price),
          };
        }
      }
    } catch {
      /* bloco inválido: ignora e tenta o próximo */
    }
  }
  return {};
}

/** Baixa a página e tenta ler título, imagem, descrição e preço. Devolve null se não der. */
export async function buscarPrevia(entrada: string): Promise<Previa | null> {
  const url = /^https?:\/\//i.test(entrada.trim()) ? entrada.trim() : 'https://' + entrada.trim();
  let base: URL;
  try {
    base = new URL(url);
  } catch {
    return null;
  }

  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), 9000);
  let html = '';
  try {
    const resp = await fetch(url, {
      signal: controle.signal,
      headers: { Accept: 'text/html,application/xhtml+xml', 'Accept-Language': 'pt-BR,pt;q=0.9' },
    });
    if (!resp.ok) return null;
    html = (await resp.text()).slice(0, 600000);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }

  const ld = doJsonLd(html);
  const titulo = ld.titulo || meta(html, 'og:title') || meta(html, 'twitter:title') || decodificar(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '');
  let imagem = ld.imagem || meta(html, 'og:image') || meta(html, 'twitter:image');
  if (imagem) {
    try {
      imagem = new URL(imagem, base).toString();
    } catch {
      imagem = '';
    }
  }
  const descricao = ld.descricao || meta(html, 'og:description') || meta(html, 'description');
  const preco =
    ld.preco ??
    numero(meta(html, 'product:price:amount')) ??
    numero(meta(html, 'og:price:amount')) ??
    numero(meta(html, 'twitter:data1'));

  if (!titulo && !imagem && preco === null) return null;
  return { titulo: titulo.slice(0, 120), imagem, descricao: descricao.slice(0, 300), preco, site: base.hostname.replace(/^www\./, '') };
}
