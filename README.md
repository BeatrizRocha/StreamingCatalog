# StreamingCatalog 🎬

![Status](https://img.shields.io/badge/Status-Foundation_Complete-brightgreen)
![Node](https://img.shields.io/badge/Backend-NestJS_11-red)
![Database](https://img.shields.io/badge/Database-PostgreSQL_|_Redis-blue)

O **StreamingCatalog** é uma plataforma full-stack para gerenciamento e descoberta de conteúdo audiovisual. Este projeto demonstra uma arquitetura moderna de **BFF (Backend For Frontend)** focada em performance, segurança e testabilidade.

## 🏗️ Estrutura do Projeto

O projeto é organizado como um monorepo:
- `catalog-api/`: Backend robusto construído com NestJS, Prisma 7 e PostgreSQL.
- `catalog-web/`: Interface moderna construída com React e Tailwind CSS (Em breve).
- `docs/`: Documentação detalhada da arquitetura e decisões de design.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (v20 ou superior)
- Docker e Docker Compose
- NPM ou Yarn

### 1. Clonar e Instalar
```bash
git clone https://github.com/BeatrizRocha/StreamingCatalog.git
cd StreamingCatalog
```

### 2. Configurar o Ambiente
Copie os templates de exemplo e preencha com suas chaves:
```bash
cp catalog-api/.env.example catalog-api/.env
cp catalog-api/.env.test.example catalog-api/.env.test
```

### 3. Subir a Infraestrutura (Docker)
```bash
docker-compose up -d
```
*Isso iniciará o PostgreSQL e o Redis.*

### 4. Rodar a API
```bash
cd catalog-api
npm install
npx prisma db push
npm run start:dev
```
A API estará disponível em `http://localhost:3000`.
O Swagger estará em `http://localhost:3000/api/docs`.

---

## 🧪 Testes

Garantimos a qualidade através de testes automatizados:

```bash
# Testes de Unidade
npm run test

# Testes E2E (Utiliza um banco isolado automaticamente)
npm run test:e2e
```

---

## 🛠️ Tecnologias Principais

- **Core**: NestJS, React, TypeScript.
- **ORM**: Prisma 7 (com PostgreSQL).
- **Segurança**: JWT (Passport) e Bcrypt.
- **Documentação**: Swagger (OpenAPI 3).
- **Qualidade**: Jest, Supertest, ESLint.

---

## 🔍 Guia Rápido de Testes

Se você deseja testar a API manualmente, siga estes passos:
1.  Acesse a documentação interativa (Swagger) em `/api/docs`.
2.  Utilize os endpoints de `auth/register` e `auth/login` para criar e autenticar sua conta.
3.  Copie o `accessToken` retornado no login.
4.  Clique no botão **Authorize** (cadeado) no topo do Swagger e cole o token.
5.  Agora você pode testar as rotas protegidas (como `/users/profile`) diretamente pelo navegador.