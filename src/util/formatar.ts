export function formatarPreco(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return '';
  const inteiro = Math.abs(v % 1) < 0.005;
  const txt = inteiro ? String(Math.round(v)) : v.toFixed(2).replace('.', ',');
  return 'R$ ' + txt.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/** "1.234,56" -> 1234.56 ; vazio -> null ; inválido -> NaN */
export function lerPreco(txt: string): number | null {
  const t = (txt || '').trim();
  if (!t) return null;
  const n = Number(t.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
}

export function inicial(nome: string): string {
  return (nome || '?').trim().charAt(0).toUpperCase();
}

export function dominio(url: string): string {
  try {
    const u = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function normalizar(s: string): string {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
