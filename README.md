# StreamingCatalog 🎬

![Status](https://img.shields.io/badge/Status-Cloud_Integrated-brightgreen)
![CI/CD](https://img.shields.io/badge/CI/CD-Active-blue)
![Backend](https://img.shields.io/badge/Backend-NestJS_11-red)
![Database](https://img.shields.io/badge/Database-PostgreSQL_|_Redis-blue)
![Security](https://img.shields.io/badge/Security-Rate_Limited-yellow)

O **StreamingCatalog** é a minha plataforma full-stack para gerenciamento e descoberta de conteúdo audiovisual. Desenvolvi este projeto para demonstrar uma arquitetura moderna de **BFF (Backend For Frontend)**, com foco total em performance, segurança e resiliência.

## 📂 Minha Documentação Detalhada
Eu estruturei a documentação para que você possa entender cada decisão técnica que tomei:
- [Minha Infraestrutura em Nuvem (Cloud)](docs/architecture/infrastructure.md)
- [Meu Fluxo de Autenticação e Segurança](docs/architecture/auth.md)
- [Integração TMDb & Estratégia de Cache](docs/architecture/tmdb_integration.md)
- [Persistência de Conteúdo (UserContent)](docs/architecture/user_content.md)
- [Modelagem de Banco de Dados](docs/architecture/database.md)

## 🏗️ Estrutura que Escolhi
Organizei o projeto como um monorepo para facilitar a gestão dos contratos:
- `catalog-api/`: Meu backend robusto construído com NestJS, Prisma 7 e PostgreSQL.
- `catalog-web/`: Minha interface moderna construída com React e Tailwind CSS (Em desenvolvimento).
- `docs/`: Onde eu detalho minha visão arquitetural.

---

## 🚀 Como Executar o Meu Projeto

### Pré-requisitos
- Node.js (v20 ou superior)
- Docker e Docker Compose

### 1. Clonar e Instalar
```bash
git clone https://github.com/BeatrizRocha/StreamingCatalog.git
cd StreamingCatalog
```

### 2. Configurar o Ambiente
Eu preparei templates para facilitar o seu setup:
```bash
cp catalog-api/.env.example catalog-api/.env
cp catalog-api/.env.test.example catalog-api/.env.test
```

### 3. Subir a Infraestrutura (Docker)
Eu automatizei o PostgreSQL e o Redis via Docker:
```bash
docker-compose up -d
```

### 4. Rodar a API
```bash
cd catalog-api
npm install
npx prisma db push
npm run start:dev
```
A API estará disponível em `http://localhost:3000` e eu já configurei o Swagger em `http://localhost:3000/api/docs`.

---

## 🧪 Qualidade e Testes
Garanto a integridade do meu código através de uma suite rigorosa:

```bash
# Meus Testes de Unidade
npm run test

# Meus Testes E2E (Utilizam um banco isolado e limpo automaticamente)
npm run test:e2e
```

---

## 🛡️ Segurança e Resiliência
- **Rate Limiting**: Implementei proteção global (10 req/min) para garantir a saúde da API.
- **Cache Fallback**: Minha integração com TMDb possui um sistema de fallback; se o Redis falhar, eu busco os dados em tempo real sem interromper o serviço.
- **Autenticação**: Utilizo JWT Stateless com Bcrypt para garantir sessões seguras e escaláveis.