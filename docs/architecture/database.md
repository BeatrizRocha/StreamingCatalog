# Persistência e Modelagem de Dados

## Escolha do ORM (Prisma 7)
Utilizei o **Prisma** em substituição a abordagens como TypeORM ou Query Builders manuais devido à sua auto-geração de tipos baseada no esquema. Isso elimina desvios entre a estrutura do banco e a aplicação TypeScript.

## Decisões de Modelagem
- **Chaves Compostas**: A restrição `@@unique([userId, tmdbId, type])` no modelo `UserContent` foi aplicada para garantir a integridade dos dados no nível do banco, impedindo duplicidade lógica sem a necessidade de queries de verificação adicionais no Service.
- **Enums**: Aplicados para `ContentType` e `ContentStatus`. O uso de Enums nativos do PostgreSQL via Prisma garante que apenas estados válidos sejam persistidos, reduzindo a complexidade de validação na camada de aplicação.

## Sincronização em Produção
Em ambientes serverless (Neon/Render), a sincronização é feita de forma controlada via `prisma db push` para garantir que o esquema evolua conforme o backend, sem a sobrecarga de gerenciamento de migrações pesadas para este estágio do projeto.

## Visualização
Para depuração rápida, utilizo o **Prisma Studio**, permitindo inspeção visual dos relacionamentos sem a necessidade de ferramentas externas de banco de dados.
