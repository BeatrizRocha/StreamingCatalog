# Arquitetura: Minha Abordagem para Persistência de Conteúdo (UserContent)

## Visão Geral
Neste módulo, eu gerencio a interação do usuário com o catálogo. Projetos este sistema para permitir que filmes e séries sejam salvos em listas personalizadas, como Favoritos, Watchlist e Histórico.

## Minhas Decisões de Design

### 1. Modelo de Dados "Thin"
Eu escolhi armazenar apenas o `tmdbId` e o `type` (MOVIE/TV). Os metadados, como capas e sinopses, eu busco dinamicamente do TMDb. Com isso, eu garanto que a lista do usuário nunca fique desatualizada caso o TMDb altere um título ou uma imagem.

### 2. Estratégia de Upsert
Para evitar duplicatas e reduzir a latência, eu utilizei a operação `upsert` do Prisma.
- **Se o item não existe**: Eu o crio com o status inicial.
- **Se o item já existe**: Eu apenas atualizo os dados necessários, como a mudança de status ou a atualização da nota.

### 3. Regra de Unicidade
Eu implementei uma constraint composta diretamente no banco de dados:
`@@unique([userId, tmdbId, type], name: "userId_tmdbId_type")`
Essa decisão garante a integridade total dos dados, impedindo que eu permita entradas duplicadas para o mesmo conteúdo no perfil de um usuário.

### 4. Sistema de Avaliação (1-5)
Eu optei por uma escala numérica de 1 a 5 estrelas em vez de um simples booleano. Essa escolha me dá mais flexibilidade para implementar, no futuro, funcionalidades de recomendação baseadas em peso. Além disso, eu protegi essa entrada com `class-validator` no DTO.

## Segurança e Isolamento
- Eu protegi todas as rotas com o `JwtAuthGuard`.
- Utilizei meu decorator customizado `@CurrentUser('id')` para extrair o ID do usuário de forma segura, garantindo que ninguém manipule dados de terceiros.

## Estratégia de Testes
- **Service**: Eu realizei a validação unitária das regras de negócio mockando o banco.
- **E2E**: Criei uma suite completa que simula o fluxo real. Eu também me certifiquei de que os processos fechem de forma limpa, eliminando qualquer handle leak (vazamento de memória/conexão).
