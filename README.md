# DexWish

> Seus desejos, em um só lugar.

Aplicativo de lista de desejos feito em **React Native (Expo) + TypeScript**, com **Supabase** (autenticação, banco de dados e armazenamento de imagens).
Projeto de conclusão da disciplina de Desenvolvimento Mobile — Sistemas de Informação, Unirios.

## Funcionalidades

- Login por **nome de usuário e senha**, cadastro, **convidado**, Google (opcional) e recuperação de senha por código no e-mail
- Desejos com nome, foto (galeria ou câmera), categoria/subcategoria, prioridade, descrição, link e preço
- **Leitura automática do link**: título, imagem e preço da página do produto
- Categorias com **um nível** de subcategorias
- Busca, filtros (categoria, situação) e exibição em lista ou grade
- **Concluir e avaliar**: estrelas, selo "Concluído" ou selos personalizados, comentário
- Excluir com **Desfazer**
- Modo claro e escuro, foto de perfil

## Como rodar

1. `npm install`
2. Copie `.env.example` para `.env` e preencha com a URL e a chave **anon** do seu projeto Supabase
3. No Supabase, abra **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
4. `npx expo start -c` e abra no celular com o app **Expo Go**

## Estrutura

```
src/
  componentes/   peças reutilizáveis (botão, campo, chip, selo, estrelas…)
  dados/         desejos, categorias e selos (Supabase)
  lib/           cliente Supabase, imagens, leitura de link
  navegacao/     rotas (login, abas, telas internas)
  sessao/        login e usuário atual
  telas/         telas do app
  tema/          cores, fontes, modo claro/escuro
supabase/        schema.sql (tabelas, regras de segurança e armazenamento)
```

## Gerar o APK

```
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
