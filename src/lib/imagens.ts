import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase, traduzirErro } from './supabase';

export type Origem = 'galeria' | 'camera';

/** Abre a galeria ou a câmera e devolve a imagem escolhida (já comprimida), ou null se a pessoa cancelou. */
export async function escolherImagem(
  origem: Origem,
  quadrada = false,
): Promise<{ base64: string; tipo: string } | { erro: string } | null> {
  const permissao =
    origem === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissao.granted) {
    return { erro: origem === 'camera' ? 'Sem permissão para usar a câmera.' : 'Sem permissão para acessar as fotos.' };
  }
  const opcoes = {
    mediaTypes: ['images'] as any,
    quality: 0.6,
    base64: true,
    allowsEditing: quadrada,
    aspect: quadrada ? ([1, 1] as [number, number]) : undefined,
  };
  const r = origem === 'camera' ? await ImagePicker.launchCameraAsync(opcoes) : await ImagePicker.launchImageLibraryAsync(opcoes);
  if (r.canceled || !r.assets?.[0]?.base64) return null;
  return { base64: r.assets[0].base64, tipo: r.assets[0].mimeType || 'image/jpeg' };
}

/** Envia a imagem para o bucket "imagens" (pasta do usuário) e devolve o endereço público. */
export async function enviarImagem(
  uid: string,
  img: { base64: string; tipo: string },
  prefixo = 'item',
): Promise<{ url: string } | { erro: string }> {
  const ext = img.tipo.includes('png') ? 'png' : 'jpg';
  const caminho = `${uid}/${prefixo}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('imagens').upload(caminho, decode(img.base64), {
    contentType: img.tipo,
    upsert: true,
  });
  if (error) return { erro: traduzirErro(error.message) };
  const { data } = supabase.storage.from('imagens').getPublicUrl(caminho);
  // o "?v=" evita que o aparelho mostre uma versão antiga da foto de perfil
  return { url: `${data.publicUrl}?v=${Date.now()}` };
}
