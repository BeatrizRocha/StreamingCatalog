# Documentação de Autenticação (Auth Flow)

## Visão Geral
O sistema de autenticação utiliza JSON Web Token (JWT) seguindo o padrão **stateless**. As sessões não são armazenadas no banco de dados, garantindo maior escalabilidade.

## Componentes Técnicos
- **Passport.js**: Middleware padrão para integração de estratégias de autenticação no NestJS.
- **Bcrypt**: Utilizado para hashing de senhas com um fator de salt de 10.
- **JWT**: Tokens assinados com `HS256`.

## Fluxo de Autenticação

### 1. Registro (`POST /auth/register`)
- Recebe `email`, `password` e `name`.
- Valida se o email já existe.
- Hasheia a senha antes de salvar no PostgreSQL via Prisma.
- Retorna o usuário criado (sem a senha).

### 2. Login (`POST /auth/login`)
- Valida as credenciais.
- Se válidas, emite um JWT contendo no payload:
  ```json
  {
    "sub": "id-do-usuario",
    "email": "email-do-usuario"
  }
  ```
- O token tem validade de **1 dia**.

### 3. Autorização (JWT Strategy)
- O cliente deve enviar o token no header `Authorization: Bearer <token>`.
- O `JwtAuthGuard` valida a assinatura do token usando a `JWT_SECRET` do `.env`.
- Se válido, o NestJS injeta os dados do usuário no objeto `request.user`.

### 4. DX Refinement: `@CurrentUser()`
- Utilizo um decorator customizado para extrair o usuário diretamente do objeto `Request`.
- Isso remove a necessidade de acessar o `req.user` manualmente e evita o uso do tipo `any` nos controllers.
- O decorator permite extrair campos específicos (ex: `@CurrentUser('id')`) ou o objeto completo.

## Configuração (Environment)
- `JWT_SECRET`: Chave mestre para assinatura dos tokens.
- `JWT_EXPIRES_IN`: Tempo de expiração (ex: `1d`).

## Meus Testes e Isolamento
- **Unitários**: `auth.service.spec.ts` (lógica de hash e validação usando mocks de `UserService` e `JwtService`).
- **E2E**: `test/auth.e2e-spec.ts` (validação de ponta a ponta).
- **Isolamento**: Utilizo um banco de dados dedicado (`streaming_catalog_test`) criado e migrado automaticamente via `jest-e2e.json` (`globalSetup`). Garanto assim que o banco de desenvolvimento nunca seja afetado pelos testes.
